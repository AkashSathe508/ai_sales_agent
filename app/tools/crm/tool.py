"""
CRM Tool — the controlled interface between agents and CRM data.

Architecture:
    Agent → CRM Tool → CRM Service → CRM Repository → Data

Agents call methods on this tool.
This tool validates inputs, delegates to CRM Service, and returns
typed Pydantic results. Agents NEVER bypass this tool.
"""
from __future__ import annotations

import time

from app.exceptions import CRMError, CRMNotFoundError, ToolValidationError
from app.observability.logging import get_logger
from app.observability.metrics import tool_calls_total, tool_latency_seconds
from app.observability.correlation import new_tool_call_id
from app.schemas import (
    CRMData,
    CustomerData,
    DealData,
    InteractionData,
    LeadData,
    ToolResult,
)
from app.services.crm_service import CRMService

logger = get_logger(__name__)

TOOL_NAME = "crm_tool"


class CRMTool:
    """
    Controlled CRM access tool.

    All CRM read/write operations from agents go through this class.
    Validates inputs, enforces access boundaries, logs all calls.
    """

    def __init__(self, crm_service: CRMService | None = None) -> None:
        self._service = crm_service or CRMService()

    async def get_lead(
        self, lead_id: str, organization_id: str
    ) -> ToolResult:
        """Retrieve a lead by ID."""
        return await self._execute(
            operation="get_lead",
            lead_id=lead_id,
            organization_id=organization_id,
        )

    async def get_customer(
        self, customer_id: str, organization_id: str
    ) -> ToolResult:
        """Retrieve a customer by ID."""
        return await self._execute(
            operation="get_customer",
            customer_id=customer_id,
            organization_id=organization_id,
        )

    async def get_deal(
        self, deal_id: str, organization_id: str
    ) -> ToolResult:
        """Retrieve a deal by ID."""
        return await self._execute(
            operation="get_deal",
            deal_id=deal_id,
            organization_id=organization_id,
        )

    async def get_interactions(
        self,
        organization_id: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
        limit: int = 20,
    ) -> ToolResult:
        """Retrieve interaction history."""
        return await self._execute(
            operation="get_interactions",
            organization_id=organization_id,
            lead_id=lead_id,
            customer_id=customer_id,
            limit=limit,
        )

    async def get_full_lead_context(
        self, lead_id: str, organization_id: str
    ) -> ToolResult:
        """Retrieve lead + deal + interactions in one call."""
        return await self._execute(
            operation="get_full_lead_context",
            lead_id=lead_id,
            organization_id=organization_id,
        )

    async def update_lead(
        self,
        lead_id: str,
        organization_id: str,
        updates: dict,
    ) -> ToolResult:
        """Update lead fields."""
        # Validate: don't allow mass-overwrite of protected fields
        protected = {"lead_id", "organization_id"}
        bad_keys = protected.intersection(updates.keys())
        if bad_keys:
            raise ToolValidationError(
                f"Cannot update protected fields: {bad_keys}",
                tool_name=TOOL_NAME,
            )
        return await self._execute(
            operation="update_lead",
            lead_id=lead_id,
            organization_id=organization_id,
            updates=updates,
        )

    async def add_note(
        self,
        organization_id: str,
        note: str,
        lead_id: str | None = None,
        customer_id: str | None = None,
    ) -> ToolResult:
        """Add a note to a lead or customer."""
        if not note or not note.strip():
            raise ToolValidationError("Note cannot be empty", tool_name=TOOL_NAME)
        if not lead_id and not customer_id:
            raise ToolValidationError(
                "Either lead_id or customer_id is required for add_note",
                tool_name=TOOL_NAME,
            )
        return await self._execute(
            operation="add_note",
            organization_id=organization_id,
            note=note,
            lead_id=lead_id,
            customer_id=customer_id,
        )

    async def _execute(self, operation: str, **kwargs) -> ToolResult:
        """Internal dispatcher with timing and metrics."""
        tool_call_id = new_tool_call_id()
        start = time.time()
        status = "success"

        logger.info(
            "CRM tool call",
            operation=operation,
            tool_call_id=tool_call_id,
            **{k: v for k, v in kwargs.items() if k not in ("updates",)},
        )

        try:
            result = await self._dispatch(operation, **kwargs)
            latency_ms = (time.time() - start) * 1000

            tool_calls_total.labels(
                tool_name=f"{TOOL_NAME}.{operation}",
                agent="crm",
                status="success",
            ).inc()
            tool_latency_seconds.labels(tool_name=TOOL_NAME).observe(latency_ms / 1000)

            # Serialize result
            if hasattr(result, "model_dump"):
                data = result.model_dump()
            elif isinstance(result, list):
                data = [
                    item.model_dump() if hasattr(item, "model_dump") else item
                    for item in result
                ]
            else:
                data = result

            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=tool_call_id,
                success=True,
                data=data,
                latency_ms=latency_ms,
            )

        except CRMNotFoundError as exc:
            latency_ms = (time.time() - start) * 1000
            logger.warning("CRM entity not found", error=str(exc), operation=operation)
            tool_calls_total.labels(
                tool_name=f"{TOOL_NAME}.{operation}",
                agent="crm",
                status="not_found",
            ).inc()
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=tool_call_id,
                success=False,
                error=str(exc),
                latency_ms=latency_ms,
            )
        except Exception as exc:
            latency_ms = (time.time() - start) * 1000
            logger.error("CRM tool error", error=str(exc), operation=operation)
            tool_calls_total.labels(
                tool_name=f"{TOOL_NAME}.{operation}",
                agent="crm",
                status="error",
            ).inc()
            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=tool_call_id,
                success=False,
                error=f"{type(exc).__name__}: {exc}",
                latency_ms=latency_ms,
            )

    async def _dispatch(self, operation: str, **kwargs):
        """Route to the correct service method."""
        match operation:
            case "get_lead":
                return await self._service.get_lead(
                    kwargs["lead_id"], kwargs["organization_id"]
                )
            case "get_customer":
                return await self._service.get_customer(
                    kwargs["customer_id"], kwargs["organization_id"]
                )
            case "get_deal":
                return await self._service.get_deal(
                    kwargs["deal_id"], kwargs["organization_id"]
                )
            case "get_interactions":
                return await self._service.get_interactions(
                    organization_id=kwargs["organization_id"],
                    lead_id=kwargs.get("lead_id"),
                    customer_id=kwargs.get("customer_id"),
                    limit=kwargs.get("limit", 20),
                )
            case "get_full_lead_context":
                return await self._service.get_full_lead_context(
                    kwargs["lead_id"], kwargs["organization_id"]
                )
            case "update_lead":
                return await self._service.update_lead(
                    kwargs["lead_id"], kwargs["organization_id"], kwargs["updates"]
                )
            case "add_note":
                return await self._service.add_note(
                    organization_id=kwargs["organization_id"],
                    note=kwargs["note"],
                    lead_id=kwargs.get("lead_id"),
                    customer_id=kwargs.get("customer_id"),
                )
            case _:
                raise ToolValidationError(
                    f"Unknown CRM operation: {operation}", tool_name=TOOL_NAME
                )
