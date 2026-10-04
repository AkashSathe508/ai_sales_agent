"""
LangGraph strongly typed AgentState.

Contains complete workflow execution memory across all specialized agents.
Uses references and structured DTOs; never embeds raw large documents directly.
"""
from __future__ import annotations

from typing import Any, TypedDict


class AgentState(TypedDict, total=False):
    """Workflow state flowing through all nodes in the sales agent graph."""

    # Context & Identifiers
    request_id: str
    user_query: str
    organization_id: str
    user_id: str | None

    # Routing & Intent
    intent: str | None
    supervisor_decision: dict[str, Any] | None

    # Target Entities
    lead_id: str | None
    customer_id: str | None
    deal_id: str | None

    # Retrieved & Generated Artifacts
    crm_data: dict[str, Any] | None
    retrieved_evidence: list[dict[str, Any]]
    qualification_result: dict[str, Any] | None
    intelligence_result: dict[str, Any] | None
    roi_result: dict[str, Any] | None
    pricing_result: list[dict[str, Any]]
    proposal: dict[str, Any] | None
    presentation_request: dict[str, Any] | None
    presentation_result: dict[str, Any] | None

    # Governance & Checkpoint State
    approval_state: dict[str, Any] | None
    auto_approve: bool | None

    # Audit & Observability
    tool_results: list[dict[str, Any]]
    errors: list[str]
    warnings: list[str]
    final_response: str | None
