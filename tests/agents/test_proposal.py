"""
Unit tests for Proposal Agent.
Verifies integration with CRM, RAG, Pricing, and ROI tools, and Pydantic validation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.agents.proposal.agent import ProposalAgent
from app.schemas import (
    ApprovalStatus,
    CRMData,
    Evidence,
    LeadData,
    PricingResult,
    Proposal,
    RetrievalMethod,
    ROIInputs,
    ROIResult,
    ToolResult,
)


@pytest.mark.asyncio
async def test_proposal_agent_generates_valid_proposal():
    mock_crm = MagicMock()
    lead = LeadData(
        lead_id="LEAD-001",
        company_name="Apex Logistics",
        industry="Logistics",
        pain_points=["Manual reporting", "Forecast errors"],
    )
    mock_crm.get_full_lead_context = AsyncMock(
        return_value=ToolResult(
            tool_name="crm_tool",
            tool_call_id="c1",
            success=True,
            data=CRMData(lead=lead),
        )
    )

    mock_rag = MagicMock()
    ev = Evidence(
        evidence_id="ev_sales_rep",
        document_id="doc_rep",
        chunk_id="chk_rep_1",
        source="sales_reporting_guide.md",
        title="Sales Reporting Guide",
        content="Automates weekly sales reporting, saving 4-6 hours per rep.",
        relevance_score=0.92,
        retrieval_method=RetrievalMethod.HYBRID,
    )
    mock_rag.search = AsyncMock(
        return_value=ToolResult(
            tool_name="rag_tool",
            tool_call_id="c2",
            success=True,
            data={"evidence": [ev], "evaluation": None},
        )
    )

    mock_pricing = MagicMock()
    pricing_sub = PricingResult(
        product_id="PROD-REP-01",
        product_name="Sales Reporting Pro",
        quantity=20,
        unit_price=1200.0,
        discount_pct=0.10,
        total_price=21600.0,
        currency="USD",
        pricing_version="2026.1",
    )
    pricing_imp = PricingResult(
        product_id="PROD-IMP-01",
        product_name="Enterprise Implementation Package",
        quantity=1,
        unit_price=15000.0,
        discount_pct=0.0,
        total_price=15000.0,
        currency="USD",
        pricing_version="2026.1",
    )
    mock_pricing.get_price = AsyncMock(
        side_effect=[
            ToolResult(tool_name="pricing", tool_call_id="p1", success=True, data=pricing_sub),
            ToolResult(tool_name="pricing", tool_call_id="p2", success=True, data=pricing_imp),
        ]
    )

    mock_roi = MagicMock()
    roi_result = ROIResult(
        inputs=ROIInputs(
            current_cost=240000.0,
            expected_savings_pct=0.30,
            implementation_cost=15000.0,
            time_period_years=3,
            ongoing_cost=21600.0,
        ),
        annual_savings=72000.0,
        net_benefit=136200.0,
        roi_percentage=170.68,
        payback_period_years=0.30,
        three_year_benefit=136200.0,
    )
    mock_roi.calculate_roi = AsyncMock(
        return_value=ToolResult(tool_name="roi", tool_call_id="r1", success=True, data=roi_result)
    )

    agent = ProposalAgent(
        crm_tool=mock_crm,
        rag_tool=mock_rag,
        pricing_tool=mock_pricing,
        roi_tool=mock_roi,
    )

    proposal = await agent.generate_proposal(
        query="Prepare sales reporting proposal for LEAD-001",
        lead_id="LEAD-001",
        requested_seats=20,
    )

    assert isinstance(proposal, Proposal)
    assert proposal.proposal_id.startswith("prop_")
    assert proposal.customer_information["company_name"] == "Apex Logistics"
    assert proposal.total_investment == 36600.0  # 21,600 + 15,000
    assert proposal.approval_status == ApprovalStatus.PENDING
    assert proposal.roi is not None
    assert proposal.roi.annual_savings == 72000.0
    assert len(proposal.solution_components) == 2
    assert len(proposal.evidence) == 1
    assert proposal.evidence[0].evidence_id == "ev_sales_rep"
