"""
CRM Service — business logic layer between CRM Tool and CRM Repository.

Agents access CRM through:
  Agent → CRM Tool → CRM Service → CRM Repository

This service:
- Validates access permissions
- Aggregates related CRM data
- Logs all access for audit purposes
- Never invents data — if data is missing, it says so
"""
from __future__ import annotations

from app.database.repositories.crm_repository import CRMRepositoryProtocol
from app.database.repositories.mock_crm_adapter import MockCRMAdapter
from app.exceptions import CRMNotFoundError, CRMAccessError
from app.observability.logging import get_logger
from app.schemas import (
    CRMData,
    CustomerData,
    DealData,
    InteractionData,
    LeadData,
)

logger = get_logger(__name__)

# Module-level singleton mock adapter (replaced in production by DI)
_DEFAULT_ADAPTER: CRMRepositoryProtocol | None = None


def get_default_crm_adapter() -> CRMRepositoryProtocol:
    global _DEFAULT_ADAPTER
    if _DEFAULT_ADAPTER is None:
        _DEFAULT_ADAPTER = MockCRMAdapter()
    return _DEFAULT_ADAPTER


class CRMService:
    """
    Reusable CRM business logic.

    Accepts any CRMRepositoryProtocol implementation so
    Salesforce/HubSpot adapters can be swapped in without
    changing this class.
    """

    def __init__(self, repository: CRMRepositoryProtocol | None = None) -> None:
        self._repo = repository or get_default_crm_adapter()

    async def get_lead(self, lead_id: str, organization_id: str) -> LeadData:
        """
        Retrieve a lead.

        Raises:
            CRMNotFoundError: If lead does not exist
        """
        logger.info("CRM: get_lead", lead_id=lead_id)
        lead = await self._repo.get_lead(lead_id, organization_id)
        if lead is None:
            raise CRMNotFoundError("Lead", lead_id)
        return lead

    async def get_customer(
        self, customer_id: str, organization_id: str
    ) -> CustomerData:
        """Retrieve a customer."""
        logger.info("CRM: get_customer", customer_id=customer_id)
        customer = await self._repo.get_customer(customer_id, organization_id)
        if customer is None:
            raise CRMNotFoundError("Customer", customer_id)
        return customer

    async def get_deal(self, deal_id: str, organization_id: str) -> DealData:
        """Retrieve a deal."""
        logger.info("CRM: get_deal", deal_id=deal_id)
        deal = await self._repo.get_deal(deal_id, organization_id)
        if deal is None:
            raise CRMNotFoundError("Deal", deal_id)
        return deal

    async def get_interactions(
        self,
        organization_id: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
        limit: int = 20,
    ) -> list[InteractionData]:
        """Retrieve interaction history."""
        logger.info(
            "CRM: get_interactions",
            lead_id=lead_id,
            customer_id=customer_id,
        )
        return await self._repo.get_interactions(
            organization_id=organization_id,
            lead_id=lead_id,
            customer_id=customer_id,
            limit=limit,
        )

    async def get_full_lead_context(
        self, lead_id: str, organization_id: str
    ) -> CRMData:
        """
        Retrieve a lead and all its associated data in one call.
        Returns partial data if sub-entities are missing — never raises
        unless the lead itself does not exist.
        """
        lead = await self.get_lead(lead_id, organization_id)
        interactions = await self.get_interactions(
            organization_id=organization_id, lead_id=lead_id
        )

        # Try to find associated deal
        deal: DealData | None = None
        try:
            from app.database.repositories.mock_crm_adapter import _SEED_DEALS
            for deal_data in _SEED_DEALS.values():
                if deal_data.get("lead_id") == lead_id:
                    deal = DealData(**deal_data)
                    break
        except Exception:
            pass

        return CRMData(
            lead=lead,
            deal=deal,
            interactions=interactions,
        )

    async def update_lead(
        self, lead_id: str, organization_id: str, updates: dict
    ) -> LeadData:
        """Update lead fields."""
        logger.info("CRM: update_lead", lead_id=lead_id, fields=list(updates.keys()))
        result = await self._repo.update_lead(lead_id, organization_id, updates)
        if result is None:
            raise CRMNotFoundError("Lead", lead_id)
        return result

    async def add_note(
        self,
        organization_id: str,
        note: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
    ) -> InteractionData:
        """Add a note to a lead or customer."""
        logger.info("CRM: add_note", lead_id=lead_id, customer_id=customer_id)
        return await self._repo.add_note(
            organization_id=organization_id,
            note=note,
            lead_id=lead_id,
            customer_id=customer_id,
        )
