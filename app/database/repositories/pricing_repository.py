"""
Pricing Repository Protocol and Mock Catalog Adapter.

Provides authorized price sheet records. Agents never access this directly;
only PricingService consumes this repository.
"""
from __future__ import annotations

from typing import Any, Protocol, runtime_checkable

from app.exceptions import PricingUnavailableError


@runtime_checkable
class PricingRepositoryProtocol(Protocol):
    """Protocol for product catalog and pricing retrieval."""

    async def get_product_price(
        self, product_id: str, organization_id: str = "org-default"
    ) -> dict[str, Any] | None:
        """Fetch price record by product SKU/ID."""
        ...

    async def list_products(
        self, organization_id: str = "org-default"
    ) -> list[dict[str, Any]]:
        """List active product catalog items."""
        ...


class MockPricingRepository:
    """
    Deterministic seed pricing catalog implementing PricingRepositoryProtocol.
    """

    CATALOG = {
        "PROD-REP-01": {
            "product_id": "PROD-REP-01",
            "product_name": "Sales Reporting Pro",
            "unit_price": 1200.0,
            "currency": "USD",
            "pricing_version": "2026.1",
            "min_quantity": 5,
            "description": "Automated sales reporting and pipeline velocity analytics per user/year.",
        },
        "PROD-INT-02": {
            "product_id": "PROD-INT-02",
            "product_name": "Sales Intelligence & Proposal Suite",
            "unit_price": 2400.0,
            "currency": "USD",
            "pricing_version": "2026.1",
            "min_quantity": 10,
            "description": "Full platform with deal scoring, RAG intelligence, and automated proposal generation per user/year.",
        },
        "PROD-IMP-01": {
            "product_id": "PROD-IMP-01",
            "product_name": "Enterprise Implementation Package",
            "unit_price": 15000.0,
            "currency": "USD",
            "pricing_version": "2026.1",
            "min_quantity": 1,
            "description": "One-time enterprise CRM integration, schema calibration, and training onboarding.",
        },
    }

    async def get_product_price(
        self, product_id: str, organization_id: str = "org-default"
    ) -> dict[str, Any] | None:
        return self.CATALOG.get(product_id)

    async def list_products(
        self, organization_id: str = "org-default"
    ) -> list[dict[str, Any]]:
        return list(self.CATALOG.values())
