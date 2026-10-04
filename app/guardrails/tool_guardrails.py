"""
Tool Guardrails.

Enforces allowed operations and parameter bounds on all tool invocations.
"""
from __future__ import annotations

from typing import Any

from app.exceptions import ToolNotAllowedError, ToolValidationError
from app.observability.logging import get_logger

logger = get_logger(__name__)

# Permitted tools per agent role
AGENT_TOOL_PERMISSIONS: dict[str, set[str]] = {
    "supervisor": set(),  # Supervisor never calls data tools directly
    "qualification": {"crm_tool"},
    "intelligence": {"crm_tool", "rag_tool"},
    "proposal": {"crm_tool", "rag_tool", "pricing_tool", "roi_tool", "presentation_tool"},
}


class ToolGuardrails:
    """Enforces role-based tool execution boundaries and argument validation."""

    @staticmethod
    def validate_permission(agent_name: str, tool_name: str) -> None:
        """
        Verify that agent has permission to invoke tool.

        Raises:
            ToolNotAllowedError: If agent is not authorized.
        """
        allowed = AGENT_TOOL_PERMISSIONS.get(agent_name, set())
        if tool_name not in allowed:
            logger.error("Unauthorized tool call attempt", agent=agent_name, tool=tool_name)
            raise ToolNotAllowedError(
                f"Agent '{agent_name}' is not authorized to use tool '{tool_name}'.",
                tool_name=tool_name,
            )

    @staticmethod
    def validate_numeric_bounds(
        tool_name: str,
        param_name: str,
        value: float | int,
        min_val: float | None = None,
        max_val: float | None = None,
    ) -> None:
        """Verify numeric parameter bounds."""
        if min_val is not None and value < min_val:
            raise ToolValidationError(
                f"{param_name} for tool '{tool_name}' must be >= {min_val}, got {value}",
                tool_name=tool_name,
            )
        if max_val is not None and value > max_val:
            raise ToolValidationError(
                f"{param_name} for tool '{tool_name}' must be <= {max_val}, got {value}",
                tool_name=tool_name,
            )
