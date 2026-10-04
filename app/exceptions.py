"""
Structured exception hierarchy for the Sales AI Agent system.

Every failure is typed so callers can handle them specifically and
observability tooling can classify errors accurately.

Never raise generic Exception — always raise a typed subclass.
"""
from __future__ import annotations

from typing import Any


class SalesAgentError(Exception):
    """Root exception for the entire system."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(message={self.message!r}, details={self.details})"


# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────


class ConfigurationError(SalesAgentError):
    """Raised when required configuration is missing or invalid."""


# ─────────────────────────────────────────────────────────────────────────────
# LLM
# ─────────────────────────────────────────────────────────────────────────────


class LLMError(SalesAgentError):
    """Raised when an LLM call fails."""


class LLMTimeoutError(LLMError):
    """Raised when an LLM call times out."""


class LLMRateLimitError(LLMError):
    """Raised when the LLM rate limit is exceeded."""


class StructuredOutputError(LLMError):
    """Raised when structured output cannot be parsed from LLM response."""


# ─────────────────────────────────────────────────────────────────────────────
# Tool Execution
# ─────────────────────────────────────────────────────────────────────────────


class ToolExecutionError(SalesAgentError):
    """Raised when a tool call fails."""

    def __init__(
        self,
        message: str,
        tool_name: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details)
        self.tool_name = tool_name


class ToolNotAllowedError(ToolExecutionError):
    """Raised when an agent attempts to call a tool it is not permitted to use."""


class ToolValidationError(ToolExecutionError):
    """Raised when tool arguments fail schema validation."""


# ─────────────────────────────────────────────────────────────────────────────
# CRM
# ─────────────────────────────────────────────────────────────────────────────


class CRMError(SalesAgentError):
    """Root CRM error."""


class CRMNotFoundError(CRMError):
    """Raised when a CRM entity cannot be found."""

    def __init__(self, entity_type: str, entity_id: str) -> None:
        super().__init__(f"{entity_type} not found: {entity_id}")
        self.entity_type = entity_type
        self.entity_id = entity_id


class CRMAccessError(CRMError):
    """Raised when access to a CRM entity is denied."""


# ─────────────────────────────────────────────────────────────────────────────
# RAG / Retrieval
# ─────────────────────────────────────────────────────────────────────────────


class RetrievalError(SalesAgentError):
    """Raised when document retrieval fails."""


class EmbeddingError(RetrievalError):
    """Raised when embedding generation fails."""


class EvidenceInsufficientError(RetrievalError):
    """
    Raised when retrieved evidence is insufficient to ground a response.
    This is NOT a generic error — it triggers controlled retrieval expansion
    or safe fallback behavior.
    """

    def __init__(self, message: str, missing_topics: list[str] | None = None) -> None:
        super().__init__(message)
        self.missing_topics = missing_topics or []


class IngestionError(SalesAgentError):
    """Raised when document ingestion fails."""


# ─────────────────────────────────────────────────────────────────────────────
# ROI
# ─────────────────────────────────────────────────────────────────────────────


class ROIError(SalesAgentError):
    """Root ROI error."""


class ROIInputError(ROIError):
    """Raised when required ROI inputs are missing or invalid."""

    def __init__(self, message: str, missing_fields: list[str] | None = None) -> None:
        super().__init__(message)
        self.missing_fields = missing_fields or []


class ROICalculationError(ROIError):
    """Raised when ROI calculation produces an invalid result."""


# ─────────────────────────────────────────────────────────────────────────────
# Pricing
# ─────────────────────────────────────────────────────────────────────────────


class PricingError(SalesAgentError):
    """Root pricing error."""


class PricingUnavailableError(PricingError):
    """Raised when pricing information is not available for a product."""

    def __init__(self, product_id: str) -> None:
        super().__init__(f"Pricing unavailable for product: {product_id}")
        self.product_id = product_id


class PricingValidationError(PricingError):
    """Raised when pricing data fails validation."""


# ─────────────────────────────────────────────────────────────────────────────
# Proposal
# ─────────────────────────────────────────────────────────────────────────────


class ProposalError(SalesAgentError):
    """Root proposal error."""


class ProposalValidationError(ProposalError):
    """Raised when a proposal fails Pydantic validation."""


# ─────────────────────────────────────────────────────────────────────────────
# MCP
# ─────────────────────────────────────────────────────────────────────────────


class MCPError(SalesAgentError):
    """Root MCP gateway error."""


class MCPNotAllowedError(MCPError):
    """Raised when an MCP tool call is not on the allowlist."""

    def __init__(self, tool_name: str) -> None:
        super().__init__(f"MCP tool not allowed: {tool_name}")
        self.tool_name = tool_name


class MCPTimeoutError(MCPError):
    """Raised when an MCP call times out."""


class MCPValidationError(MCPError):
    """Raised when MCP arguments or response fail schema validation."""


class MCPConnectionError(MCPError):
    """Raised when the MCP server is unreachable."""


# ─────────────────────────────────────────────────────────────────────────────
# Guardrails
# ─────────────────────────────────────────────────────────────────────────────


class GuardrailError(SalesAgentError):
    """Root guardrail error."""


class InputValidationError(GuardrailError):
    """Raised when user input fails input guardrail checks."""


class OutputValidationError(GuardrailError):
    """Raised when agent output fails output guardrail checks."""


class PromptInjectionError(GuardrailError):
    """
    Raised when potential prompt injection is detected in retrieved content.
    The content is treated as untrusted data, not as an instruction.
    """


class UnsupportedClaimError(GuardrailError):
    """Raised when a claim is detected without supporting evidence."""


# ─────────────────────────────────────────────────────────────────────────────
# Approval
# ─────────────────────────────────────────────────────────────────────────────


class ApprovalError(SalesAgentError):
    """Root approval error."""


class ApprovalRequiredError(ApprovalError):
    """
    Raised when a sensitive action requires human approval before proceeding.
    This is a controlled pause, not a failure.
    """

    def __init__(self, action: str, proposal_id: str | None = None) -> None:
        super().__init__(f"Human approval required for: {action}")
        self.action = action
        self.proposal_id = proposal_id


class ApprovalRejectedError(ApprovalError):
    """Raised when a human reviewer rejects an action."""

    def __init__(self, action: str, reason: str | None = None) -> None:
        super().__init__(f"Action rejected by reviewer: {action}")
        self.action = action
        self.reason = reason


# ─────────────────────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────────────────────


class DatabaseError(SalesAgentError):
    """Root database error."""


class EntityNotFoundError(DatabaseError):
    """Raised when a database entity is not found."""

    def __init__(self, entity_type: str, entity_id: str) -> None:
        super().__init__(f"{entity_type} not found: {entity_id}")
        self.entity_type = entity_type
        self.entity_id = entity_id


# ─────────────────────────────────────────────────────────────────────────────
# Supervisor / Routing
# ─────────────────────────────────────────────────────────────────────────────


class SupervisorError(SalesAgentError):
    """Root supervisor error."""


class RoutingError(SupervisorError):
    """Raised when the supervisor cannot determine a valid routing intent."""


class AgentError(SalesAgentError):
    """Raised when an agent execution encounters an unrecoverable failure."""


__all__ = [
    "SalesAgentError",
    "AgentError",
    "RoutingError",
    "ConfigurationError",
    "LLMError",
    "LLMTimeoutError",
    "LLMRateLimitError",
    "StructuredOutputError",
    "ToolExecutionError",
    "ToolNotAllowedError",
    "ToolValidationError",
    "CRMError",
    "CRMNotFoundError",
    "CRMAccessError",
    "RetrievalError",
    "EmbeddingError",
    "EvidenceInsufficientError",
    "IngestionError",
    "ROIError",
    "ROIInputError",
    "ROICalculationError",
    "PricingError",
    "PricingUnavailableError",
    "PricingValidationError",
    "ProposalError",
    "ProposalValidationError",
    "MCPError",
    "MCPNotAllowedError",
    "MCPTimeoutError",
    "MCPValidationError",
    "MCPConnectionError",
    "GuardrailError",
    "InputValidationError",
    "OutputValidationError",
    "PromptInjectionError",
    "UnsupportedClaimError",
    "ApprovalError",
    "ApprovalRequiredError",
    "ApprovalRejectedError",
    "DatabaseError",
    "EntityNotFoundError",
    "SupervisorError",
    "RoutingError",
]
