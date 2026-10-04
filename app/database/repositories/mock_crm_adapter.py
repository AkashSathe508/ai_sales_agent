"""
Mock CRM Adapter — explicitly labeled as a mock/adapter.

This implements CRMRepositoryProtocol with realistic seed data.
It can be replaced by a PostgreSQL implementation or Salesforce/HubSpot
adapter without changing any agent or service code.

Seed entities:
- LEAD-001, LEAD-002 (leads)
- CUSTOMER-001 (customer)
- DEAL-001 (deal)
"""
from __future__ import annotations

import uuid
from copy import deepcopy
from datetime import datetime, timedelta
from typing import Any

from app.database.repositories.crm_repository import CRMRepositoryProtocol
from app.exceptions import CRMNotFoundError
from app.observability.logging import get_logger
from app.schemas import (
    CustomerData,
    DealData,
    InteractionData,
    LeadData,
)

logger = get_logger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Seed Data — deterministic, realistic CRM entities
# ─────────────────────────────────────────────────────────────────────────────

_SEED_LEADS: dict[str, dict[str, Any]] = {
    "LEAD-001": {
        "lead_id": "LEAD-001",
        "company_name": "Meridian Financial Group",
        "industry": "Financial Services",
        "company_size": "500-1000 employees",
        "annual_revenue": 85_000_000.0,
        "contact_name": "Sarah Chen",
        "contact_email": "s.chen@meridianfg.com",
        "contact_title": "VP of Sales Operations",
        "pain_points": [
            "Manual sales reporting taking 3 days per month per rep",
            "No real-time pipeline visibility for leadership",
            "Inconsistent forecast accuracy (±40%)",
            "CRM data quality issues — reps not updating records",
            "Cannot correlate sales activity to revenue outcomes",
        ],
        "budget_range": "$150,000 - $300,000 annually",
        "timeline": "Q1 next year — board mandate for modernization",
        "current_solution": "Excel spreadsheets + Salesforce basic reporting",
        "status": "qualified",
        "score": 82,
        "metadata": {
            "source": "inbound_demo_request",
            "assigned_rep": "Alex Thompson",
            "last_contact": "2024-01-15",
        },
    },
    "LEAD-002": {
        "lead_id": "LEAD-002",
        "company_name": "TechVenture Startup",
        "industry": "SaaS",
        "company_size": "10-50 employees",
        "annual_revenue": 2_500_000.0,
        "contact_name": "Marcus Rivera",
        "contact_email": "marcus@techventure.io",
        "contact_title": "CEO",
        "pain_points": [
            "No formal sales process",
            "Using spreadsheets for deal tracking",
        ],
        "budget_range": None,  # Budget unknown
        "timeline": None,  # Timeline unknown
        "current_solution": "Google Sheets + Gmail",
        "status": "new",
        "score": 41,
        "metadata": {
            "source": "cold_outreach",
            "assigned_rep": "Jordan Kim",
            "last_contact": "2024-01-08",
        },
    },
}

_SEED_CUSTOMERS: dict[str, dict[str, Any]] = {
    "CUSTOMER-001": {
        "customer_id": "CUSTOMER-001",
        "company_name": "Apex Manufacturing Corp",
        "industry": "Manufacturing",
        "contract_value": 220_000.0,
        "contact_name": "David Park",
        "contact_email": "d.park@apexmfg.com",
        "account_manager": "Alex Thompson",
        "products": ["SalesReportPro", "PipelineAnalytics", "ForecastAI"],
        "metadata": {
            "renewal_date": "2024-12-01",
            "health_score": 87,
            "nps": 9,
        },
    },
}

_SEED_DEALS: dict[str, dict[str, Any]] = {
    "DEAL-001": {
        "deal_id": "DEAL-001",
        "name": "Meridian Financial Group — Sales Intelligence Platform",
        "stage": "proposal",
        "value": 240_000.0,
        "currency": "USD",
        "lead_id": "LEAD-001",
        "customer_id": None,
        "probability": 0.65,
        "close_date": "2024-03-31",
        "metadata": {
            "next_step": "Present proposal to CTO and VP Sales",
            "competitors": ["Tableau", "Power BI", "Clari"],
            "champion": "Sarah Chen",
        },
    },
}

_SEED_INTERACTIONS: list[dict[str, Any]] = [
    {
        "interaction_id": "INT-001",
        "type": "meeting",
        "subject": "Discovery Call — Meridian Financial Group",
        "notes": (
            "Met with Sarah Chen and her team. Key pain points: manual reporting, "
            "no pipeline visibility. They currently spend 3 days/month per rep on "
            "Excel-based reports. Leadership cannot get real-time forecasts. "
            "Budget approved in principle — $150K-$300K range. Timeline: Q1 next year "
            "due to board mandate. Strong champion in Sarah. Technical evaluator is "
            "CTO James Liu."
        ),
        "occurred_at": "2024-01-15",
        "lead_id": "LEAD-001",
        "customer_id": None,
    },
    {
        "interaction_id": "INT-002",
        "type": "email",
        "subject": "Follow-up: Product Demo Scheduled",
        "notes": "Confirmed product demo for Jan 22. Sarah forwarded to James Liu (CTO). Decision expected by Feb 15.",
        "occurred_at": "2024-01-16",
        "lead_id": "LEAD-001",
        "customer_id": None,
    },
    {
        "interaction_id": "INT-003",
        "type": "call",
        "subject": "Technical Evaluation Call with CTO",
        "notes": (
            "James Liu reviewed technical requirements. Main concerns: data security, "
            "GDPR compliance, API integrations with existing Salesforce instance. "
            "Requested security documentation and compliance certificates."
        ),
        "occurred_at": "2024-01-22",
        "lead_id": "LEAD-001",
        "customer_id": None,
    },
]


class MockCRMAdapter:
    """
    Mock CRM adapter with realistic seed data.

    EXPLICITLY LABELED AS MOCK — not production functionality.
    Replace with PostgreSQLCRMAdapter or SalesforceCRMAdapter for production.
    """

    def __init__(self) -> None:
        self._leads: dict[str, dict[str, Any]] = deepcopy(_SEED_LEADS)
        self._customers: dict[str, dict[str, Any]] = deepcopy(_SEED_CUSTOMERS)
        self._deals: dict[str, dict[str, Any]] = deepcopy(_SEED_DEALS)
        self._interactions: list[dict[str, Any]] = deepcopy(_SEED_INTERACTIONS)
        self._notes: list[dict[str, Any]] = []

    async def get_lead(self, lead_id: str, organization_id: str) -> LeadData | None:
        data = self._leads.get(lead_id)
        if not data:
            logger.debug("Lead not found in mock CRM", lead_id=lead_id)
            return None
        return LeadData(**data)

    async def get_customer(
        self, customer_id: str, organization_id: str
    ) -> CustomerData | None:
        data = self._customers.get(customer_id)
        if not data:
            return None
        return CustomerData(**data)

    async def get_deal(self, deal_id: str, organization_id: str) -> DealData | None:
        data = self._deals.get(deal_id)
        if not data:
            return None
        return DealData(**data)

    async def get_interactions(
        self,
        organization_id: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
        limit: int = 20,
    ) -> list[InteractionData]:
        results = []
        for interaction in self._interactions:
            if lead_id and interaction.get("lead_id") == lead_id:
                results.append(InteractionData(**interaction))
            elif customer_id and interaction.get("customer_id") == customer_id:
                results.append(InteractionData(**interaction))
        return results[:limit]

    async def update_lead(
        self,
        lead_id: str,
        organization_id: str,
        updates: dict,
    ) -> LeadData | None:
        if lead_id not in self._leads:
            return None
        self._leads[lead_id].update(updates)
        logger.info("Lead updated in mock CRM", lead_id=lead_id, fields=list(updates.keys()))
        return LeadData(**self._leads[lead_id])

    async def add_note(
        self,
        organization_id: str,
        note: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
    ) -> InteractionData:
        interaction = {
            "interaction_id": f"INT-{uuid.uuid4().hex[:6].upper()}",
            "type": "note",
            "subject": "Agent Note",
            "notes": note,
            "occurred_at": datetime.utcnow().isoformat(),
            "lead_id": lead_id,
            "customer_id": customer_id,
        }
        self._notes.append(interaction)
        self._interactions.append(interaction)
        logger.info("Note added to mock CRM", lead_id=lead_id, customer_id=customer_id)
        return InteractionData(**interaction)
