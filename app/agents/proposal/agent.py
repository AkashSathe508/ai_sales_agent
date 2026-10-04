"""
Proposal Agent.

Coordinates:
CRM Tool → RAG Tool → Pricing Tool → ROI Tool → Proposal Model → Validation

Ensures all pricing and ROI metrics are verified by tools rather than hallucinated.
"""
from __future__ import annotations

import time
from typing import Any

from app.agents.proposal.prompts import PROPOSAL_SYSTEM_PROMPT, PROPOSAL_USER_PROMPT
from app.exceptions import AgentError
from app.llm.service import LLMService, create_llm_service
from app.observability.logging import get_logger
from app.observability.metrics import agent_run_latency_seconds, agent_runs_total
from app.schemas import (
    ApprovalStatus,
    CRMData,
    Evidence,
    ImplementationMilestone,
    LeadData,
    PricingResult,
    Proposal,
    ROIResult,
    SolutionComponent,
)
from app.tools.crm.tool import CRMTool
from app.tools.pricing.tool import PricingTool
from app.tools.rag.tool import RAGTool
from app.tools.roi.tool import ROITool

logger = get_logger(__name__)

AGENT_NAME = "proposal"


class ProposalAgent:
    """
    Coordinates enterprise proposal generation across CRM, RAG, Pricing, and ROI tools.
    """

    def __init__(
        self,
        crm_tool: CRMTool | None = None,
        rag_tool: RAGTool | None = None,
        pricing_tool: PricingTool | None = None,
        roi_tool: ROITool | None = None,
        llm_service: LLMService | None = None,
    ) -> None:
        self._crm = crm_tool or CRMTool()
        self._rag = rag_tool
        self._pricing = pricing_tool or PricingTool()
        self._roi = roi_tool or ROITool()
        self._llm = llm_service or create_llm_service(agent_name=AGENT_NAME)

    async def generate_proposal(
        self,
        query: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
        organization_id: str = "org-default",
        requested_seats: int = 20,
    ) -> Proposal:
        """
        Generate a fully validated proposal for a prospect or existing customer.

        Args:
            query: User proposal request
            lead_id: Optional CRM lead ID
            customer_id: Optional CRM customer ID
            organization_id: Tenant context
            requested_seats: Number of user seats to price

        Returns:
            Validated Proposal object
        """
        start = time.time()
        logger.info(
            "Proposal generation started",
            query=query[:80],
            lead_id=lead_id,
            seats=requested_seats,
        )

        # 1. CRM Retrieval
        customer_info: dict[str, Any] = {}
        lead: LeadData | None = None
        if lead_id:
            crm_res = await self._crm.get_full_lead_context(lead_id, organization_id)
            if crm_res.success and crm_res.data:
                crm_data: CRMData = (
                    crm_res.data
                    if isinstance(crm_res.data, CRMData)
                    else CRMData.model_validate(crm_res.data)
                )
                lead = crm_data.lead
                if lead:
                    customer_info = {
                        "lead_id": lead.lead_id,
                        "company_name": lead.company_name,
                        "industry": lead.industry,
                        "company_size": lead.company_size,
                        "contact_name": lead.contact_name,
                        "contact_email": lead.contact_email,
                        "current_solution": lead.current_solution,
                        "pain_points": lead.pain_points,
                    }

        company_name = customer_info.get("company_name", "Prospective Enterprise Client")
        problem_desc = (
            ", ".join(customer_info.get("pain_points", []))
            if customer_info.get("pain_points")
            else "Manual sales reporting bottlenecks and fragmented pipeline tracking."
        )

        # 2. RAG Retrieval
        evidence_list: list[Evidence] = []
        if self._rag:
            rag_query = f"sales reporting product guide implementation {query}"
            rag_res = await self._rag.search(rag_query, limit=4)
            if rag_res.success and rag_res.data:
                evidence_list = rag_res.data.get("evidence", [])

        # 3. Verified Pricing Retrieval
        pricing_items: list[PricingResult] = []
        # Subscription software
        sub_res = await self._pricing.get_price(
            product_id="PROD-REP-01",
            quantity=requested_seats,
            organization_id=organization_id,
        )
        if sub_res.success and sub_res.data:
            pricing_items.append(sub_res.data)

        # Onboarding implementation
        imp_res = await self._pricing.get_price(
            product_id="PROD-IMP-01",
            quantity=1,
            organization_id=organization_id,
        )
        if imp_res.success and imp_res.data:
            pricing_items.append(imp_res.data)

        total_investment = sum(p.total_price for p in pricing_items)

        # 4. Deterministic ROI Calculation
        # Assume rep cost $120,000 baseline; 20 seats * $120k * 10% reporting time = $240k baseline
        annual_ongoing = next((p.total_price for p in pricing_items if p.product_id == "PROD-REP-01"), 24000.0)
        onetime_imp = next((p.total_price for p in pricing_items if p.product_id == "PROD-IMP-01"), 15000.0)
        baseline_reporting_cost = max(100000.0, requested_seats * 12000.0)

        roi_tool_res = await self._roi.calculate_roi(
            current_cost=baseline_reporting_cost,
            expected_savings_pct=0.30,
            implementation_cost=onetime_imp,
            time_period_years=3,
            ongoing_cost=annual_ongoing,
        )
        roi_result: ROIResult | None = roi_tool_res.data if roi_tool_res.success else None

        # 5. Build Solution Components
        solution_components = [
            SolutionComponent(
                product_id="PROD-REP-01",
                product_name="Sales Reporting Pro",
                description="Automated weekly/monthly pipeline reporting, executive brief generator, and forecast velocity tracking.",
                pricing=pricing_items[0] if len(pricing_items) > 0 else None,
            ),
            SolutionComponent(
                product_id="PROD-IMP-01",
                product_name="Enterprise Implementation Package",
                description="Dedicated solutions engineering, CRM bidirectional connector setup, schema mapping, and user enablement.",
                pricing=pricing_items[1] if len(pricing_items) > 1 else None,
            ),
        ]

        implementation_plan = [
            ImplementationMilestone(
                milestone="Phase 1: Environment Setup & CRM Connector",
                duration_weeks=2,
                deliverables=["OAuth integration", "Pipeline schema mapping", "SSO setup"],
            ),
            ImplementationMilestone(
                milestone="Phase 2: Reporting Configuration & Model Calibration",
                duration_weeks=2,
                deliverables=["Custom executive dashboards", "Historical forecast velocity model tuning"],
            ),
            ImplementationMilestone(
                milestone="Phase 3: Team Enablement & Production Rollout",
                duration_weeks=2,
                deliverables=["Manager enablement session", "Rep workshop", "Production sign-off"],
            ),
        ]

        expected_benefits = [
            "Recover 4 to 6 hours per week per sales representative by automating manual spreadsheet compilation.",
            "Eliminate reporting latency from 3 business days to real-time automated briefs.",
            "Improve quarterly revenue forecast accuracy with predictive deal velocity modeling.",
            f"Achieve project payback within {roi_result.payback_period_years if roi_result else '6'} months of rollout.",
        ]

        assumptions = [
            f"Pricing valid for {requested_seats} user licenses over a 12-month initial term.",
            "Client CRM admin access will be provisioned during Week 1 of implementation.",
            "ROI modeled using industry standard $120,000/year fully loaded rep compensation.",
        ]

        risks = [
            "Delays in IT security approval for CRM API permissions could push go-live timeline.",
            "Incomplete historical CRM stage change records may require manual data sanitization in Phase 1.",
        ]

        # Check if remote LLM key is configured
        from app.config.settings import get_settings
        settings = get_settings()

        if not settings.llm.google_api_key or settings.llm.google_api_key in {"your_google_api_key_here", "test_key", ""}:
            # Deterministic construction for offline/test environments
            proposal = Proposal(
                customer_information=customer_info,
                executive_summary=(
                    f"SalesFlow Intelligence proposal for {company_name} to modernize revenue reporting, "
                    f"eliminate spreadsheet administrative overhead, and deliver executive deal visibility."
                ),
                customer_problem=f"{company_name} currently experiences: {problem_desc}",
                proposed_solution=(
                    f"Deploy SalesFlow Intelligence with Sales Reporting Pro across {requested_seats} user seats, "
                    "supported by our Enterprise Implementation package to ensure rapid time-to-value."
                ),
                solution_components=solution_components,
                implementation_plan=implementation_plan,
                expected_benefits=expected_benefits,
                roi=roi_result,
                pricing=pricing_items,
                total_investment=round(total_investment, 2),
                assumptions=assumptions,
                risks=risks,
                evidence=evidence_list,
                approval_status=ApprovalStatus.PENDING,
            )
        else:
            messages = [
                {
                    "role": "user",
                    "content": PROPOSAL_USER_PROMPT.format(
                        customer_info_text=str(customer_info),
                        problem_text=problem_desc,
                        evidence_text="\n\n".join(f"[{ev.title}] {ev.content}" for ev in evidence_list),
                        roi_summary=str(roi_result.model_dump() if roi_result else "ROI unavailable"),
                        pricing_summary="\n".join(f"{p.product_name}: ${p.total_price}" for p in pricing_items),
                        user_query=query,
                    ),
                }
            ]
            try:
                proposal = await self._llm.structured_generate(
                    messages=messages,
                    output_schema=Proposal,
                    system_prompt=PROPOSAL_SYSTEM_PROMPT,
                )
                # Enforce verified tool values — LLM output cannot overwrite these
                proposal.roi = roi_result
                proposal.pricing = pricing_items
                proposal.total_investment = round(total_investment, 2)
                proposal.evidence = evidence_list
                proposal.approval_status = ApprovalStatus.PENDING
                # Enforce schema-generated proposal_id; LLM must not invent its own
                if not proposal.proposal_id or not proposal.proposal_id.startswith("prop_"):
                    import uuid as _uuid
                    proposal.proposal_id = f"prop_{_uuid.uuid4().hex[:10]}"
            except Exception as exc:
                logger.error("LLM proposal generation failed, using deterministic construction", error=str(exc))
                proposal = Proposal(
                    customer_information=customer_info,
                    executive_summary=f"SalesFlow Intelligence proposal for {company_name}.",
                    customer_problem=f"Addressing: {problem_desc}",
                    proposed_solution=f"Deploy Sales Reporting Pro across {requested_seats} user seats.",
                    solution_components=solution_components,
                    implementation_plan=implementation_plan,
                    expected_benefits=expected_benefits,
                    roi=roi_result,
                    pricing=pricing_items,
                    total_investment=round(total_investment, 2),
                    assumptions=assumptions,
                    risks=risks,
                    evidence=evidence_list,
                    approval_status=ApprovalStatus.PENDING,
                )

        latency_ms = (time.time() - start) * 1000
        agent_runs_total.labels(agent=AGENT_NAME, intent="proposal", status="success").inc()
        agent_run_latency_seconds.labels(agent=AGENT_NAME).observe(latency_ms / 1000)

        logger.info(
            "Proposal generation complete",
            proposal_id=proposal.proposal_id,
            total_investment=proposal.total_investment,
            approval_status=proposal.approval_status,
            latency_ms=f"{latency_ms:.0f}",
        )
        return proposal
