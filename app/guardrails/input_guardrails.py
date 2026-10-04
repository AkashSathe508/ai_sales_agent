"""
Input Guardrails.

Validates user input, identifiers, and multi-tenant organization context
before entering agent execution graphs.
"""
from __future__ import annotations

import re

from app.exceptions import InputValidationError
from app.observability.logging import get_logger

logger = get_logger(__name__)

ID_PATTERNS = {
    "lead": re.compile(r"^LEAD-\d{3,8}$", re.IGNORECASE),
    "customer": re.compile(r"^(CUST|CUSTOMER)-\d{3,8}$", re.IGNORECASE),
    "deal": re.compile(r"^DEAL-\d{3,8}$", re.IGNORECASE),
    "proposal": re.compile(r"^prop_[a-f0-9]{8,16}$", re.IGNORECASE),
}


class InputGuardrails:
    """Enforces validation rules on natural language queries and structured IDs."""

    @staticmethod
    def validate_user_query(query: str, min_length: int = 3, max_length: int = 2000) -> str:
        """
        Validate natural language input query.

        Raises:
            InputValidationError: If query is blank, too short, or excessive.
        """
        if not query or not query.strip():
            raise InputValidationError("User query cannot be empty or whitespace.")

        clean_query = query.strip()
        if len(clean_query) < min_length:
            raise InputValidationError(
                f"Query too short ({len(clean_query)} chars); must be at least {min_length} chars."
            )
        if len(clean_query) > max_length:
            raise InputValidationError(
                f"Query exceeds maximum allowed length of {max_length} characters."
            )

        return clean_query

    @staticmethod
    def validate_entity_id(entity_type: str, entity_id: str | None) -> str | None:
        """
        Validate structured entity identifier syntax.

        Raises:
            InputValidationError: If entity_id does not conform to the expected format.
        """
        if not entity_id:
            return None

        pattern = ID_PATTERNS.get(entity_type.lower())
        if pattern and not pattern.match(entity_id):
            raise InputValidationError(
                f"Invalid {entity_type} ID format: '{entity_id}'. Expected format e.g. {entity_type.upper()}-001"
            )
        return entity_id

    @staticmethod
    def validate_organization_context(organization_id: str | None) -> str:
        """Validate multi-tenant scope."""
        if not organization_id or not organization_id.strip():
            return "org-default"
        clean = organization_id.strip()
        if len(clean) > 64 or not re.match(r"^[a-zA-Z0-9_\-\.]+$", clean):
            raise InputValidationError(f"Invalid organization_id context: '{organization_id}'")
        return clean
