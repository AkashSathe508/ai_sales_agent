"""
LangGraph Multi-Agent Sales Workflow.

Coordinates:
Input Guardrails → Supervisor → [Qualification | Intelligence | Proposal]
Proposal → Approval Checkpoint → Presentation Tool (MCP) → Output Guardrails
"""
from __future__ import annotations

import re
import uuid
from typing import Any, Literal

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from app.agents.intelligence.agent import SalesIntelligenceAgent
from app.agents.proposal.agent import ProposalAgent
from app.agents.qualification.agent import QualificationAgent
from app.agents.supervisor.agent import SupervisorAgent
from app.guardrails.injection_defense import InjectionDefense
from app.guardrails.input_guardrails import InputGuardrails
from app.guardrails.output_guardrails import OutputGuardrails
from app.graph.state import AgentState
from app.observability.logging import get_logger
from app.rag import get_initialized_rag_tool
from app.schemas import ApprovalState, ApprovalStatus, IntentType, Proposal
from app.tools.crm.tool import CRMTool
from app.tools.presentation.tool import PresentationTool
from app.tools.pricing.tool import PricingTool
from app.tools.rag.tool import RAGTool
from app.tools.roi.tool import ROITool

logger = get_logger(__name__)


class SalesWorkflowEngine:
    """
    Production LangGraph Sales Workflow Engine.
    """

    def __init__(
        self,
        supervisor_agent: SupervisorAgent | None = None,
        qualification_agent: QualificationAgent | None = None,
        intelligence_agent: SalesIntelligenceAgent | None = None,
        proposal_agent: ProposalAgent | None = None,
        presentation_tool: PresentationTool | None = None,
        crm_tool: CRMTool | None = None,
        rag_tool: RAGTool | None = None,
        checkpointer: MemorySaver | None = None,
    ) -> None:
        self._crm = crm_tool or CRMTool()
        self._rag = rag_tool
        self._supervisor = supervisor_agent or SupervisorAgent()
        self._qualification = qualification_agent or QualificationAgent(crm_tool=self._crm)
        self._intelligence = intelligence_agent or SalesIntelligenceAgent(
            crm_tool=self._crm, rag_tool=self._rag
        )
        self._proposal = proposal_agent or ProposalAgent(
            crm_tool=self._crm, rag_tool=self._rag
        )
        self._presentation = presentation_tool or PresentationTool()
        self._checkpointer = checkpointer or MemorySaver()
        self._graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(AgentState)

        # Register nodes
        builder.add_node("input_guardrails", self._input_guardrails_node)
        builder.add_node("supervisor", self._supervisor_node)
        builder.add_node("qualification", self._qualification_node)
        builder.add_node("intelligence", self._intelligence_node)
        builder.add_node("proposal", self._proposal_node)
        builder.add_node("approval_checkpoint", self._approval_checkpoint_node)
        builder.add_node("presentation", self._presentation_node)
        builder.add_node("output_guardrails", self._output_guardrails_node)

        # Edges
        builder.add_edge(START, "input_guardrails")
        builder.add_edge("input_guardrails", "supervisor")

        builder.add_conditional_edges(
            "supervisor",
            self._route_intent,
            {
                "qualification": "qualification",
                "intelligence": "intelligence",
                "proposal": "proposal",
            },
        )

        builder.add_edge("qualification", "output_guardrails")
        builder.add_edge("intelligence", "output_guardrails")

        builder.add_edge("proposal", "approval_checkpoint")
        builder.add_conditional_edges(
            "approval_checkpoint",
            self._route_approval,
            {
                "approved": "presentation",
                "pending": "output_guardrails",
            },
        )

        builder.add_edge("presentation", "output_guardrails")
        builder.add_edge("output_guardrails", END)

        return builder.compile(checkpointer=self._checkpointer)

    # ── Node Implementations ──────────────────────────────────────────────────

    async def _input_guardrails_node(self, state: AgentState) -> dict[str, Any]:
        query = state.get("user_query", "")
        clean_query = InputGuardrails.validate_user_query(query)
        InjectionDefense.guard_user_input(clean_query)

        # Automatically extract lead_id or customer_id from text if not provided
        lead_id = state.get("lead_id")
        if not lead_id:
            m = re.search(r"\b(LEAD-\d{3,8})\b", clean_query, re.IGNORECASE)
            if m:
                lead_id = m.group(1).upper()

        customer_id = state.get("customer_id")
        if not customer_id:
            m = re.search(r"\b(CUST|CUSTOMER-\d{3,8})\b", clean_query, re.IGNORECASE)
            if m:
                customer_id = m.group(1).upper()

        return {
            "user_query": clean_query,
            "lead_id": lead_id,
            "customer_id": customer_id,
            "organization_id": state.get("organization_id", "org-default"),
            "request_id": state.get("request_id") or f"req_{uuid.uuid4().hex[:10]}",
            "auto_approve": state.get("auto_approve", False),
            "errors": state.get("errors", []),
            "warnings": state.get("warnings", []),
        }

    async def _supervisor_node(self, state: AgentState) -> dict[str, Any]:
        decision = await self._supervisor.route(
            query=state["user_query"],
            context={"lead_id": state.get("lead_id")},
        )
        return {
            "intent": decision.intent.value if hasattr(decision.intent, "value") else str(decision.intent),
            "supervisor_decision": decision.model_dump(),
        }

    def _route_intent(self, state: AgentState) -> Literal["qualification", "intelligence", "proposal"]:
        intent = (state.get("intent") or "proposal").lower()
        if "qualif" in intent:
            return "qualification"
        if "intellig" in intent:
            return "intelligence"
        return "proposal"

    async def _qualification_node(self, state: AgentState) -> dict[str, Any]:
        lead_id = state.get("lead_id") or "LEAD-001"
        res = await self._qualification.qualify_lead(
            lead_id=lead_id,
            organization_id=state.get("organization_id", "org-default"),
            user_query=state.get("user_query", ""),
        )
        return {"qualification_result": res.model_dump()}

    async def _intelligence_node(self, state: AgentState) -> dict[str, Any]:
        res = await self._intelligence.analyze(
            query=state["user_query"],
            lead_id=state.get("lead_id"),
            customer_id=state.get("customer_id"),
            organization_id=state.get("organization_id", "org-default"),
        )
        return {
            "intelligence_result": res.model_dump(),
            "retrieved_evidence": [e.model_dump() for e in res.evidence],
        }

    async def _proposal_node(self, state: AgentState) -> dict[str, Any]:
        lead_id = state.get("lead_id") or "LEAD-001"
        res: Proposal = await self._proposal.generate_proposal(
            query=state["user_query"],
            lead_id=lead_id,
            customer_id=state.get("customer_id"),
            organization_id=state.get("organization_id", "org-default"),
        )
        return {
            "proposal": res.model_dump(),
            "roi_result": res.roi.model_dump() if res.roi else None,
            "pricing_result": [p.model_dump() for p in res.pricing],
            "retrieved_evidence": [e.model_dump() for e in res.evidence],
            "approval_state": {
                "approval_required": True,
                "status": "approved" if state.get("auto_approve") is True else (
                    res.approval_status.value if hasattr(res.approval_status, "value") else str(res.approval_status)
                ),
                "action": "proposal_and_presentation",
                "proposal_id": res.proposal_id,
                "reason": "Executive approval status for customer-facing proposal and deck generation.",
            },
        }

    def _route_approval(self, state: AgentState) -> Literal["approved", "pending"]:
        appr = state.get("approval_state") or {}
        # If pre-approved (e.g. in test or automated pipeline approval) route to presentation
        if appr.get("status") == "approved":
            return "approved"
        # Check if caller pre-authorized presentation generation
        if state.get("auto_approve") is True:
            return "approved"
        return "pending"

    async def _approval_checkpoint_node(self, state: AgentState) -> dict[str, Any]:
        # Log approval checkpoint status
        appr = state.get("approval_state") or {}
        logger.info(
            "Workflow reached approval checkpoint",
            status=appr.get("status"),
            proposal_id=appr.get("proposal_id"),
        )
        return {}

    async def _presentation_node(self, state: AgentState) -> dict[str, Any]:
        prop_data = state.get("proposal")
        if not prop_data:
            return {}
        proposal_obj = Proposal.model_validate(prop_data)
        pres_res = await self._presentation.create_presentation_from_proposal(proposal_obj)
        if pres_res.success and pres_res.data:
            return {"presentation_result": pres_res.data.model_dump()}
        return {"warnings": state.get("warnings", []) + [f"Presentation generation failed: {pres_res.error}"]}

    async def _output_guardrails_node(self, state: AgentState) -> dict[str, Any]:
        # Assemble human-readable final summary response
        lines = [f"=== Workflow Result [Intent: {state.get('intent', 'UNKNOWN').upper()}] ==="]

        if state.get("qualification_result"):
            qr = state["qualification_result"]
            lines.append(f"Qualification Assessment for Lead {qr.get('lead_id')}:")
            lines.append(f"- Recommendation: {qr.get('recommendation')}")
            lines.append(f"- Company Summary: {qr.get('company_summary')}")
            lines.append(f"- Missing Information: {', '.join(qr.get('missing_information', []))}")

        elif state.get("intelligence_result"):
            ir = state["intelligence_result"]
            lines.append(f"Sales Intelligence Analysis:")
            lines.append(f"- Summary: {ir.get('summary')}")
            lines.append(f"- Insights count: {len(ir.get('insights', []))}")
            for ins in ir.get("insights", [])[:3]:
                lines.append(f"  * [{ins.get('source_type')}] {ins.get('insight')}")

        elif state.get("proposal"):
            pr = state["proposal"]
            lines.append(f"Proposal Generated: {pr.get('proposal_id')}")
            lines.append(f"- Executive Summary: {pr.get('executive_summary')}")
            lines.append(f"- Total Investment: ${pr.get('total_investment', 0):,.2f}")
            if state.get("roi_result"):
                roi = state["roi_result"]
                lines.append(f"- Projected Annual Savings: ${roi.get('annual_savings', 0):,.2f}")
                lines.append(f"- ROI: {roi.get('roi_percentage', 0)}%")
                lines.append(f"- Payback Period: {roi.get('payback_period_years')} years")
            if state.get("approval_state"):
                appr = state["approval_state"]
                lines.append(f"- Approval Status: {appr.get('status').upper()} ({appr.get('reason')})")
            if state.get("presentation_result"):
                pres = state["presentation_result"]
                lines.append(f"- Presentation PPTX: {pres.get('file_path')} ({pres.get('slide_count')} slides)")

        return {"final_response": "\n".join(lines)}

    async def run(
        self,
        user_query: str,
        lead_id: str | None = None,
        organization_id: str = "org-default",
        auto_approve: bool = False,
        thread_id: str = "default_session",
    ) -> AgentState:
        """
        Execute sales workflow end-to-end.
        """
        initial_state: AgentState = {
            "user_query": user_query,
            "lead_id": lead_id,
            "organization_id": organization_id,
            "errors": [],
            "warnings": [],
            "retrieved_evidence": [],
            "tool_results": [],
            "auto_approve": auto_approve,
        }

        config = {"configurable": {"thread_id": thread_id}}
        final_state = await self._graph.ainvoke(initial_state, config=config)
        return final_state
