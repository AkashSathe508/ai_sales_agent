"""
Pricing Tool — controlled boundary for retrieving validated prices.

Architecture:
    Proposal Agent → Pricing Tool → Pricing Service → Pricing Repository → Validated Price
"""
from __future__ import annotations

import time

from app.exceptions import PricingError, PricingUnavailableError
from app.observability.correlation import new_tool_call_id
from app.observability.logging import get_logger
from app.observability.metrics import tool_calls_total, tool_latency_seconds
from app.schemas import PricingResult, ToolResult
from app.services.pricing_service import PricingService

logger = get_logger(__name__)

TOOL_NAME = "pricing_tool"


class PricingTool:
    """Controlled tool providing verified catalog pricing to agents."""

    def __init__(self, pricing_service: PricingService | None = None) -> None:
        self._service = pricing_service or PricingService()

    async def get_price(
        self,
        product_id: str,
        quantity: int = 1,
        discount_pct: float = 0.0,
        organization_id: str = "org-default",
    ) -> ToolResult:
        """
        Fetch verified price for product SKU and quantity.

        Args:
            product_id: Catalog SKU (e.g. 'PROD-REP-01')
            quantity: Number of licenses/units
            discount_pct: Optional custom discount percentage
            organization_id: Multi-tenant scope

        Returns:
            ToolResult containing PricingResult
        """
        call_id = new_tool_call_id()
        start = time.time()
        logger.info(
            "Pricing query initiated",
            tool_call_id=call_id,
            product_id=product_id,
            quantity=quantity,
        )

        try:
            result: PricingResult = await self._service.calculate_price(
                product_id=product_id,
                quantity=quantity,
                discount_pct=discount_pct,
                organization_id=organization_id,
            )

            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="pricing", status="success").inc()
            tool_latency_seconds.labels(tool_name=TOOL_NAME).observe(latency_ms / 1000)

            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=True,
                data=result,
                latency_ms=latency_ms,
            )

        except PricingUnavailableError as exc:
            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="pricing", status="error").inc()
            logger.warning("Pricing unavailable", product_id=product_id)
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=False,
                error=f"Pricing unavailable for product: {product_id}",
                latency_ms=latency_ms,
            )
        except Exception as exc:
            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="pricing", status="error").inc()
            logger.error("Pricing tool failure", error=str(exc))
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=False,
                error=f"Pricing error: {exc}",
                latency_ms=latency_ms,
            )

    async def list_products(self, organization_id: str = "org-default") -> ToolResult:
        """List all active products in catalog."""
        call_id = new_tool_call_id()
        start = time.time()
        try:
            products = await self._service.list_available_products(organization_id)
            latency_ms = (time.time() - start) * 1000
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=True,
                data=products,
                latency_ms=latency_ms,
            )
        except Exception as exc:
            latency_ms = (time.time() - start) * 1000
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=False,
                error=str(exc),
                latency_ms=latency_ms,
            )
