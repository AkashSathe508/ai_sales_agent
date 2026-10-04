"""
Unit tests for Qualification Agent.
Ensures zero-hallucination, explicit missing_information capture, and CRM grounding.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.agents.qualification.agent import QualificationAgent
from app.exceptions import CRMNotFoundError
from app.schemas import CRMData, LeadData, QualificationResult, ToolResult
from app.tools.crm.tool import CRMTool


@pytest.fixture
def mock_crm_tool():
    tool = MagicMock(spec=CRMTool)
    return tool


@pytest.fixture
def mock_llm_service():
    service = MagicMock()
    return service


@pytest.mark.asyncio
async def test_qualify_lead_success_with_missing_info(mock_crm_tool, mock_llm_service):
    # LEAD-001 has no stated budget and no timeline in CRM
    lead = LeadData(
        lead_id="LEAD-001",
        company_name="Acme Corp",
        industry="Retail",
        company_size="50-200",
        pain_points=["Slow sales reports", "Manual spreadsheets"],
        budget_range=None,
        timeline=None,
    )
    crm_data = CRMData(lead=lead, interactions=[])
    mock_crm_tool.get_full_lead_context = AsyncMock(
        return_value=ToolResult(
            tool_name="crm_tool",
            tool_call_id="call-123",
            success=True,
            data=crm_data,
        )
    )

    llm_returned = QualificationResult(
        lead_id="LEAD-001",
        company_summary="Acme Corp is a mid-market retail company struggling with manual reporting.",
        pain_points=["Slow sales reports", "Manual spreadsheets"],
        budget=None,
        timeline=None,
        qualification_factors={"fit": "high", "need": "urgent"},
        risks=["No budget stated yet"],
        missing_information=[],
        recommendation="NEEDS_DISCOVERY",
        confidence=0.85,
    )
    mock_llm_service.structured_generate = AsyncMock(return_value=llm_returned)

    agent = QualificationAgent(crm_tool=mock_crm_tool, llm_service=mock_llm_service)
    result = await agent.qualify_lead("LEAD-001")

    assert result.lead_id == "LEAD-001"
    assert result.recommendation == "NEEDS_DISCOVERY"
    # Post-validation grounding must ensure budget and timeline missing warnings are added
    assert any("Budget range" in m for m in result.missing_information)
    assert any("timeline" in m.lower() for m in result.missing_information)


@pytest.mark.asyncio
async def test_qualify_lead_not_found(mock_crm_tool, mock_llm_service):
    mock_crm_tool.get_full_lead_context = AsyncMock(
        return_value=ToolResult(
            tool_name="crm_tool",
            tool_call_id="call-404",
            success=False,
            error="Lead LEAD-999 not found",
        )
    )

    agent = QualificationAgent(crm_tool=mock_crm_tool, llm_service=mock_llm_service)
    with pytest.raises(CRMNotFoundError):
        await agent.qualify_lead("LEAD-999")
