"""
Pricing Service — business logic layer between Pricing Tool and Pricing Repository.

Enforces pricing rules, volume discounts, quote validity timestamps, and warnings.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from app.database.repositories.pricing_repository import (
    MockPricingRepository,
    PricingRepositoryProtocol,
)
from app.exceptions import PricingUnavailableError, PricingValidationError
from app.observability.logging import get_logger
from app.schemas import PricingResult

logger = get_logger(__name__)


class PricingService:
    """Business logic service for quote calculation and pricing validation."""

    def __init__(self, repository: PricingRepositoryProtocol | None = None) -> None:
        self._repo = repository or MockPricingRepository()

    async def calculate_price(
        self,
        product_id: str,
        quantity: int = 1,
        discount_pct: float = 0.0,
        organization_id: str = "org-default",
    ) -> PricingResult:
        """
        Validate product and compute official pricing quote.

        Args:
            product_id: Catalog SKU / product code
            quantity: Number of seats or units
            discount_pct: Custom requested discount (0.0 to 1.0)
            organization_id: Multi-tenant scope

        Returns:
            Validated PricingResult
        """
        if quantity <= 0:
            raise PricingValidationError("Quantity must be greater than zero")
        if not 0.0 <= discount_pct <= 1.0:
            raise PricingValidationError("Discount percentage must be between 0.0 and 1.0")

        item = await self._repo.get_product_price(product_id, organization_id)
        if not item:
            logger.warning("Requested product pricing unavailable", product_id=product_id)
            raise PricingUnavailableError(product_id)

        unit_price = float(item["unit_price"])
        min_qty = item.get("min_quantity", 1)
        warnings: list[str] = []

        if quantity < min_qty:
            warnings.append(
                f"Requested quantity ({quantity}) is below minimum requirement ({min_qty})."
            )

        # Apply automatic volume discount if requested discount is 0
        final_discount = discount_pct
        if final_discount == 0.0:
            if quantity >= 100:
                final_discount = 0.20
            elif quantity >= 50:
                final_discount = 0.15
            elif quantity >= 20:
                final_discount = 0.10

        subtotal = unit_price * quantity
        total_price = subtotal * (1.0 - final_discount)

        from datetime import timezone
        valid_until = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d")

        return PricingResult(
            product_id=product_id,
            product_name=item["product_name"],
            quantity=quantity,
            unit_price=unit_price,
            discount_pct=round(final_discount, 4),
            total_price=round(total_price, 2),
            currency=item.get("currency", "USD"),
            pricing_version=item.get("pricing_version", "2026.1"),
            valid_until=valid_until,
            notes=item.get("description"),
            warnings=warnings,
        )

    async def list_available_products(
        self, organization_id: str = "org-default"
    ) -> list[dict[str, Any]]:
        return await self._repo.list_products(organization_id)
