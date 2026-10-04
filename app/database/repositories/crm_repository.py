"""
CRM Repository Interface.

Defines the contract for CRM data access. The PostgreSQL implementation
and future Salesforce/HubSpot adapters both implement this interface.
Agents NEVER see this interface directly — only CRMService does.
"""
from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.schemas import (
    CRMData,
    CustomerData,
    DealData,
    InteractionData,
    LeadData,
)


@runtime_checkable
class CRMRepositoryProtocol(Protocol):
    """Interface for CRM data access. Implementations are swappable."""

    async def get_lead(self, lead_id: str, organization_id: str) -> LeadData | None:
        """Retrieve a lead by ID."""
        ...

    async def get_customer(
        self, customer_id: str, organization_id: str
    ) -> CustomerData | None:
        """Retrieve a customer by ID."""
        ...

    async def get_deal(self, deal_id: str, organization_id: str) -> DealData | None:
        """Retrieve a deal by ID."""
        ...

    async def get_interactions(
        self,
        organization_id: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
        limit: int = 20,
    ) -> list[InteractionData]:
        """Retrieve interaction history for a lead or customer."""
        ...

    async def update_lead(
        self,
        lead_id: str,
        organization_id: str,
        updates: dict,
    ) -> LeadData | None:
        """Update lead fields."""
        ...

    async def add_note(
        self,
        organization_id: str,
        note: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
    ) -> InteractionData:
        """Add a note/interaction record."""
        ...
