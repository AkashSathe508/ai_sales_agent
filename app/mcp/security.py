"""
MCP Security and Allowlist Enforcement.

Treats MCP as an external capability boundary.
Enforces strict allowlists, argument validation, and payload sanity checks.
"""
from __future__ import annotations

from typing import Any

from app.exceptions import MCPNotAllowedError, MCPValidationError
from app.observability.logging import get_logger

logger = get_logger(__name__)

ALLOWED_MCP_TOOLS: frozenset[str] = frozenset(
    [
        "create_presentation",
        "add_slide",
        "add_title",
        "add_content",
        "export_pptx",
    ]
)

REQUIRED_TOOL_ARGS: dict[str, set[str]] = {
    "create_presentation": {"title"},
    "add_slide": {"presentation_id", "title"},
    "add_title": {"presentation_id", "title"},
    "add_content": {"presentation_id", "content"},
    "export_pptx": {"presentation_id"},
}


class MCPSecurityValidator:
    """Validates MCP tool execution against strict security policies."""

    @staticmethod
    def validate_tool_call(tool_name: str, arguments: dict[str, Any]) -> None:
        """
        Validate tool name against allowlist and verify argument requirements.

        Raises:
            MCPNotAllowedError: If tool is not on allowlist
            MCPValidationError: If arguments are missing or malformed
        """
        if tool_name not in ALLOWED_MCP_TOOLS:
            logger.error("Unauthorized MCP tool access attempt", tool_name=tool_name)
            raise MCPNotAllowedError(tool_name)

        required_args = REQUIRED_TOOL_ARGS.get(tool_name, set())
        missing = [arg for arg in required_args if arg not in arguments or arguments[arg] is None]
        if missing:
            logger.error(
                "MCP argument validation failed",
                tool_name=tool_name,
                missing_args=missing,
            )
            raise MCPValidationError(
                f"Missing required arguments for MCP tool '{tool_name}': {', '.join(missing)}"
            )
