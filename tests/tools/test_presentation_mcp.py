"""
Unit tests for Presentation Tool, MCP Gateway, and MCP Allowlist Security.
"""
import pytest

from app.exceptions import MCPNotAllowedError, MCPValidationError
from app.mcp.adapters.presentation_adapter import LocalPresentationAdapter, MockPresentationAdapter
from app.mcp.gateway import MCPGateway
from app.mcp.security import MCPSecurityValidator
from app.schemas import (
    ApprovalStatus,
    ImplementationMilestone,
    PresentationResult,
    Proposal,
    ROIInputs,
    ROIResult,
    SolutionComponent,
)
from app.tools.presentation.tool import PresentationTool


def test_mcp_security_rejects_unauthorized_tool():
    with pytest.raises(MCPNotAllowedError):
        MCPSecurityValidator.validate_tool_call(
            "delete_all_files",
            {"path": "/"},
        )


def test_mcp_security_validates_required_args():
    with pytest.raises(MCPValidationError):
        # Missing 'title'
        MCPSecurityValidator.validate_tool_call(
            "create_presentation",
            {"subtitle": "Missing title"},
        )


@pytest.mark.asyncio
async def test_mcp_gateway_with_mock_adapter():
    mock_adapter = MockPresentationAdapter()
    gateway = MCPGateway(presentation_adapter=mock_adapter)

    create_res = await gateway.call_tool(
        "create_presentation",
        {"title": "Test Pitch", "presentation_id": "pres_test1"},
    )
    assert create_res["status"] == "created"

    add_res = await gateway.call_tool(
        "add_slide",
        {"presentation_id": "pres_test1", "title": "Overview", "content": ["Point A", "Point B"]},
    )
    assert add_res["slide_index"] == 0

    export_res = await gateway.call_tool(
        "export_pptx",
        {"presentation_id": "pres_test1"},
    )
    assert export_res["status"] == "exported"
    assert export_res["slide_count"] == 1


@pytest.mark.asyncio
async def test_presentation_tool_end_to_end_from_proposal():
    mock_adapter = MockPresentationAdapter()
    gateway = MCPGateway(presentation_adapter=mock_adapter)
    tool = PresentationTool(mcp_gateway=gateway)

    roi = ROIResult(
        inputs=ROIInputs(
            current_cost=100000,
            expected_savings_pct=0.3,
            implementation_cost=10000,
            time_period_years=3,
        ),
        annual_savings=30000.0,
        net_benefit=50000.0,
        roi_percentage=125.0,
        payback_period_years=0.33,
        three_year_benefit=50000.0,
    )

    proposal = Proposal(
        customer_information={"company_name": "Acme Global"},
        executive_summary="Executive summary for Acme",
        customer_problem="Manual reporting problems",
        proposed_solution="Sales Reporting Pro deployment",
        solution_components=[
            SolutionComponent(
                product_id="PROD-REP-01",
                product_name="Sales Reporting Pro",
                description="Automated reports",
            )
        ],
        implementation_plan=[
            ImplementationMilestone(
                milestone="Phase 1",
                duration_weeks=2,
                deliverables=["Setup"],
            )
        ],
        expected_benefits=["Save 5 hrs/week"],
        roi=roi,
        total_investment=25000.0,
        approval_status=ApprovalStatus.PENDING,
    )

    result = await tool.create_presentation_from_proposal(proposal)
    assert result.success is True
    pres: PresentationResult = result.data
    assert pres.status == "exported"
    assert pres.slide_count >= 4
