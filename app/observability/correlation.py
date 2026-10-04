"""
Correlation ID management.

Every request gets a unique request_id and agent_run_id so
every log line, tool call, and LLM call can be traced back
to the originating user request.
"""
from __future__ import annotations

import uuid
from contextvars import ContextVar

from app.observability.logging import set_log_context

_correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")


def new_request_id() -> str:
    return f"req_{uuid.uuid4().hex[:12]}"


def new_agent_run_id() -> str:
    return f"run_{uuid.uuid4().hex[:12]}"


def new_tool_call_id() -> str:
    return f"tool_{uuid.uuid4().hex[:8]}"


def initialize_request_context(
    organization_id: str = "",
    user_id: str = "",
    request_id: str | None = None,
) -> tuple[str, str]:
    """
    Create and bind a new request_id and agent_run_id to the current context.

    Returns:
        (request_id, agent_run_id)
    """
    rid = request_id or new_request_id()
    arid = new_agent_run_id()
    set_log_context(
        request_id=rid,
        agent_run_id=arid,
        organization_id=organization_id,
        user_id=user_id,
    )
    return rid, arid
