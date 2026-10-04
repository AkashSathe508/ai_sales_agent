"""
Presentation Tool — controlled interface between Proposal Agent and MCP Gateway.

Architecture:
    Proposal Agent → PresentationTool → MCP Gateway → Allowlist → PPTX Adapter
"""
from __future__ import annotations

import time
import uuid
from typing import Any

from app.mcp.gateway import MCPGateway
from app.observability.correlation import new_tool_call_id
from app.observability.logging import get_logger
from app.observability.metrics import tool_calls_total, tool_latency_seconds
from app.schemas import (
    PresentationRequest,
    PresentationResult,
    Proposal,
    ToolResult,
)

logger = get_logger(__name__)

TOOL_NAME = "presentation_tool"


class PresentationTool:
    """
    Controlled tool generating executive sales slide decks via MCP Gateway.
    """

    def __init__(self, mcp_gateway: MCPGateway | None = None) -> None:
        self._gateway = mcp_gateway or MCPGateway()

    async def create_presentation_from_proposal(
        self,
        proposal: Proposal,
    ) -> ToolResult:
        """
        Convert a validated Proposal into an executive PPTX presentation.

        Args:
            proposal: Validated Proposal object

        Returns:
            ToolResult containing PresentationResult
        """
        call_id = new_tool_call_id()
        start = time.time()
        logger.info(
            "Generating presentation from proposal",
            tool_call_id=call_id,
            proposal_id=proposal.proposal_id,
        )

        try:
            pres_id = f"pres_{proposal.proposal_id.replace('prop_', '')}"
            company = proposal.customer_information.get("company_name", "Enterprise Client")

            # 1. Create presentation deck
            await self._gateway.call_tool(
                "create_presentation",
                {
                    "presentation_id": pres_id,
                    "title": f"SalesFlow Intelligence Solution for {company}",
                    "subtitle": "Proposal & Financial Business Case",
                },
                agent_name="proposal",
            )

            # 2. Executive Summary Slide
            await self._gateway.call_tool(
                "add_slide",
                {
                    "presentation_id": pres_id,
                    "title": "Executive Summary & Problem Statement",
                    "content": [
                        proposal.executive_summary,
                        f"Target Problem: {proposal.customer_problem}",
                    ],
                },
                agent_name="proposal",
            )

            # 3. Proposed Solution & Architecture
            solution_bullets = [proposal.proposed_solution]
            for comp in proposal.solution_components:
                solution_bullets.append(f"{comp.product_name}: {comp.description}")

            await self._gateway.call_tool(
                "add_slide",
                {
                    "presentation_id": pres_id,
                    "title": "Proposed Solution & Capabilities",
                    "content": solution_bullets,
                },
                agent_name="proposal",
            )

            # 4. Financial ROI & Business Impact
            roi_bullets = []
            if proposal.roi:
                roi_bullets.extend(
                    [
                        f"Projected Annual Labor Savings: ${proposal.roi.annual_savings:,.2f}",
                        f"Net Cumulative 3-Year Benefit: ${proposal.roi.net_benefit:,.2f}",
                        f"Expected Return on Investment: {proposal.roi.roi_percentage:.1f}%",
                        f"Estimated Payback Period: {proposal.roi.payback_period_years or 'N/A'} years",
                    ]
                )
            roi_bullets.extend(proposal.expected_benefits[:2])

            await self._gateway.call_tool(
                "add_slide",
                {
                    "presentation_id": pres_id,
                    "title": "Financial Business Case & ROI",
                    "content": roi_bullets,
                },
                agent_name="proposal",
            )

            # 5. Implementation Roadmap
            roadmap_bullets = []
            for m in proposal.implementation_plan:
                roadmap_bullets.append(
                    f"{m.milestone} ({m.duration_weeks} wks): {', '.join(m.deliverables)}"
                )

            await self._gateway.call_tool(
                "add_slide",
                {
                    "presentation_id": pres_id,
                    "title": "Implementation Roadmap & Next Steps",
                    "content": roadmap_bullets,
                },
                agent_name="proposal",
            )

            # 6. Export deck
            export_res = await self._gateway.call_tool(
                "export_pptx",
                {"presentation_id": pres_id},
                agent_name="proposal",
            )

            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(
                tool_name=TOOL_NAME, agent="proposal", status="success"
            ).inc()
            tool_latency_seconds.labels(tool_name=TOOL_NAME).observe(latency_ms / 1000)

            result = PresentationResult(
                presentation_id=pres_id,
                status=export_res.get("status", "exported"),
                file_path=export_res.get("file_path"),
                file_size_bytes=export_res.get("file_size_bytes"),
                slide_count=export_res.get("slide_count", 5),
            )

            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=True,
                data=result,
                latency_ms=latency_ms,
            )

        except Exception as exc:
            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(
                tool_name=TOOL_NAME, agent="proposal", status="error"
            ).inc()
            logger.error("Presentation generation failed", error=str(exc))
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=False,
                error=f"Presentation generation error: {exc}",
                latency_ms=latency_ms,
            )
