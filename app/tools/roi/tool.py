"""
ROI Tool — controlled boundary for deterministic financial modeling.

Architecture:
    Proposal Agent → ROI Tool → Python Calculator → Validated ROIResult
"""
from __future__ import annotations

import time

from app.exceptions import ROIError, ROIInputError
from app.observability.correlation import new_tool_call_id
from app.observability.logging import get_logger
from app.observability.metrics import tool_calls_total, tool_latency_seconds
from app.schemas import ROIInputs, ROIResult, ToolResult
from app.tools.roi.calculator import ROICalculator

logger = get_logger(__name__)

TOOL_NAME = "roi_tool"


class ROITool:
    """
    Controlled tool executing deterministic ROI and TCO business case calculations.
    """

    def __init__(self, calculator: ROICalculator | None = None) -> None:
        self._calc = calculator or ROICalculator()

    async def calculate_roi(
        self,
        current_cost: float,
        expected_savings_pct: float,
        implementation_cost: float = 15000.0,
        time_period_years: int = 3,
        ongoing_cost: float = 24000.0,
        additional_revenue: float = 0.0,
    ) -> ToolResult:
        """
        Calculate deterministic ROI and return ToolResult with ROIResult data.

        Args:
            current_cost: Baseline annual cost
            expected_savings_pct: Decimal savings percentage (e.g. 0.30 for 30%)
            implementation_cost: Initial onboarding fee
            time_period_years: Modeling horizon in years (1 to 10)
            ongoing_cost: Annual platform subscription
            additional_revenue: Projected annual revenue boost

        Returns:
            ToolResult containing ROIResult
        """
        call_id = new_tool_call_id()
        start = time.time()
        logger.info(
            "ROI calculation requested",
            tool_call_id=call_id,
            current_cost=current_cost,
            savings_pct=expected_savings_pct,
        )

        try:
            inputs = ROIInputs(
                current_cost=current_cost,
                expected_savings_pct=expected_savings_pct,
                implementation_cost=implementation_cost,
                time_period_years=time_period_years,
                ongoing_cost=ongoing_cost,
                additional_revenue=additional_revenue,
            )

            result: ROIResult = self._calc.calculate(inputs)

            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="proposal", status="success").inc()
            tool_latency_seconds.labels(tool_name=TOOL_NAME).observe(latency_ms / 1000)

            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=True,
                data=result,
                latency_ms=latency_ms,
            )

        except Exception as exc:
            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="proposal", status="error").inc()
            logger.error("ROI calculation failed", error=str(exc))
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=False,
                error=f"ROI calculation error: {exc}",
                latency_ms=latency_ms,
            )
