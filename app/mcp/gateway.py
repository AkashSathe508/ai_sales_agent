"""
MCP Gateway.

Acts as the secure, audited boundary between agent tools and external MCP servers/adapters.
Enforces allowlist, schema validation, timeouts, and metrics.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any

from app.exceptions import MCPConnectionError, MCPError, MCPTimeoutError
from app.mcp.adapters.presentation_adapter import (
    LocalPresentationAdapter,
    MockPresentationAdapter,
    PresentationAdapterProtocol,
)
from app.mcp.security import MCPSecurityValidator
from app.observability.logging import get_logger
from app.observability.metrics import tool_calls_total, tool_latency_seconds

logger = get_logger(__name__)


class MCPGateway:
    """
    Secure gateway routing approved tool requests to allowlisted MCP adapters.
    """

    def __init__(
        self,
        presentation_adapter: PresentationAdapterProtocol | None = None,
        timeout_seconds: float = 10.0,
    ) -> None:
        self._presentation = presentation_adapter or LocalPresentationAdapter()
        self._timeout = timeout_seconds

    async def call_tool(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        agent_name: str = "proposal",
    ) -> dict[str, Any]:
        """
        Execute an allowlisted tool call through the gateway.

        Args:
            tool_name: The MCP tool identifier
            arguments: Operation arguments
            agent_name: Calling agent for audit logs

        Returns:
            Dict containing adapter response

        Raises:
            MCPNotAllowedError: If tool is not permitted
            MCPValidationError: If arguments are invalid
            MCPTimeoutError: If execution exceeds timeout
            MCPError: On adapter failure
        """
        start = time.time()
        logger.info(
            "MCP Gateway call initiated",
            tool_name=tool_name,
            agent=agent_name,
        )

        # 1. Security & Allowlist validation
        MCPSecurityValidator.validate_tool_call(tool_name, arguments)

        # 2. Dispatch with timeout enforcement
        try:
            coro = self._presentation.execute_tool(tool_name, arguments)
            result = await asyncio.wait_for(coro, timeout=self._timeout)

            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(
                tool_name=f"mcp.{tool_name}", agent=agent_name, status="success"
            ).inc()
            tool_latency_seconds.labels(tool_name=f"mcp.{tool_name}").observe(
                latency_ms / 1000
            )

            logger.info(
                "MCP Gateway call succeeded",
                tool_name=tool_name,
                latency_ms=f"{latency_ms:.0f}",
            )
            return result

        except asyncio.TimeoutError as exc:
            tool_calls_total.labels(
                tool_name=f"mcp.{tool_name}", agent=agent_name, status="timeout"
            ).inc()
            logger.error("MCP tool call timed out", tool_name=tool_name, timeout=self._timeout)
            raise MCPTimeoutError(f"MCP tool call '{tool_name}' timed out after {self._timeout}s") from exc

        except Exception as exc:
            tool_calls_total.labels(
                tool_name=f"mcp.{tool_name}", agent=agent_name, status="error"
            ).inc()
            logger.error("MCP tool execution failed", tool_name=tool_name, error=str(exc))
            raise MCPError(f"MCP execution failed: {exc}") from exc
