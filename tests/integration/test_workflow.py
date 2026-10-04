"""
Integration tests for the LangGraph Sales Workflow Engine.
Verifies end-to-end routing, qualification, intelligence, proposal generation, and approval.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.graph.workflow import SalesWorkflowEngine
from app.rag import get_initialized_rag_tool
from app.schemas import (
    ApprovalStatus,
    CRMData,
    IntentType,
    LeadData,
    PricingResult,
    Proposal,
    ROIInputs,
    ROIResult,
    SupervisorDecision,
    ToolResult,
)


@pytest.fixture
def mock_supervisor():
    sup = MagicMock()
    return sup


@pytest.fixture
def mock_crm():
    crm = MagicMock()
    lead = LeadData(
        lead_id="LEAD-001",
        company_name="Apex Logistics",
        industry="Freight & Logistics",
        pain_points=["Manual reporting", "Quarterly forecast errors"],
        company_size="50-200",
    )
    crm.get_full_lead_context = AsyncMock(
        return_value=ToolResult(
            tool_name="crm_tool",
            tool_call_id="c1",
            success=True,
            data=CRMData(lead=lead),
        )
    )
    return crm


@pytest.mark.asyncio
async def test_workflow_end_to_end_proposal(mock_crm):
    # Setup supervisor to route to proposal
    sup = MagicMock()
    sup.route = AsyncMock(
        return_value=SupervisorDecision(
            intent=IntentType.PROPOSAL,
            reason="User requested proposal for sales reporting.",
            confidence=0.96,
        )
    )

    rag = await get_initialized_rag_tool()
    engine = SalesWorkflowEngine(
        supervisor_agent=sup,
        crm_tool=mock_crm,
        rag_tool=rag,
    )

    # Run workflow with auto_approve=True so presentation is generated
    state = await engine.run(
        user_query="Analyze LEAD-001 and prepare a proposal for improving their sales reporting.",
        auto_approve=True,
    )

    assert state.get("lead_id") == "LEAD-001"
    assert state.get("intent") == "proposal"
    assert state.get("proposal") is not None
    assert state["proposal"]["total_investment"] > 0
    assert state.get("roi_result") is not None
    assert state.get("presentation_result") is not None
    assert state["presentation_result"]["slide_count"] >= 4
    assert "=== Workflow Result [Intent: PROPOSAL] ===" in state.get("final_response", "")


@pytest.mark.asyncio
async def test_workflow_end_to_end_qualification(mock_crm):
    sup = MagicMock()
    sup.route = AsyncMock(
        return_value=SupervisorDecision(
            intent=IntentType.QUALIFICATION,
            reason="User requested lead qualification.",
            confidence=0.94,
        )
    )

    engine = SalesWorkflowEngine(
        supervisor_agent=sup,
        crm_tool=mock_crm,
    )

    state = await engine.run(
        user_query="Qualify lead LEAD-001 for us.",
    )

    assert state.get("lead_id") == "LEAD-001"
    assert state.get("intent") == "qualification"
    assert state.get("qualification_result") is not None
    assert state["qualification_result"]["lead_id"] == "LEAD-001"
    assert "Qualification Assessment" in state.get("final_response", "")
