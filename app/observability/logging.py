"""
Structured logging using structlog.

Produces machine-readable JSON logs in production and
human-readable console logs in development.

Correlation IDs and agent run IDs are automatically bound
to log records via context variables.
"""
from __future__ import annotations

import logging
import sys
from contextvars import ContextVar
from typing import Any

import structlog
from structlog.types import EventDict, WrappedLogger

from app.config.settings import get_settings

# ── Context variables injected into every log record ─────────────────────────
_request_id_var: ContextVar[str] = ContextVar("request_id", default="")
_agent_run_id_var: ContextVar[str] = ContextVar("agent_run_id", default="")
_organization_id_var: ContextVar[str] = ContextVar("organization_id", default="")
_user_id_var: ContextVar[str] = ContextVar("user_id", default="")


def set_log_context(
    request_id: str = "",
    agent_run_id: str = "",
    organization_id: str = "",
    user_id: str = "",
) -> None:
    """Bind correlation IDs to the current async context."""
    if request_id:
        _request_id_var.set(request_id)
    if agent_run_id:
        _agent_run_id_var.set(agent_run_id)
    if organization_id:
        _organization_id_var.set(organization_id)
    if user_id:
        _user_id_var.set(user_id)


def _inject_context(
    logger: WrappedLogger, method: str, event_dict: EventDict
) -> EventDict:
    """structlog processor — injects correlation IDs from context vars."""
    if rid := _request_id_var.get():
        event_dict["request_id"] = rid
    if arid := _agent_run_id_var.get():
        event_dict["agent_run_id"] = arid
    if oid := _organization_id_var.get():
        event_dict["organization_id"] = oid
    if uid := _user_id_var.get():
        event_dict["user_id"] = uid
    return event_dict


def setup_logging() -> None:
    """Configure structlog — called once at startup."""
    settings = get_settings()
    level = getattr(logging, settings.app.log_level, logging.INFO)

    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        _inject_context,
        structlog.stdlib.add_log_level,
        # Note: add_logger_name is omitted — PrintLogger has no .name attribute.
        # The logger name is injected via get_logger(name) bound context instead.
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.app.log_format == "json":
        processors: list[Any] = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]
    else:
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        cache_logger_on_first_use=True,
    )

    # Also configure stdlib logging so third-party libs emit structured logs.
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
    )


def get_logger(name: str) -> structlog.BoundLogger:
    """Return a named structlog logger."""
    return structlog.get_logger(name)
