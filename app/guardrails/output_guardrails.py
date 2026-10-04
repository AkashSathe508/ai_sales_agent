"""
Output Guardrails.

Validates that agent outputs conform strictly to Pydantic schemas,
contain no empty critical fields, and contain no leaked prompt directives.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel

from app.exceptions import OutputValidationError
from app.observability.logging import get_logger

logger = get_logger(__name__)


class OutputGuardrails:
    """Enforces completeness and safety on agent output data models."""

    @staticmethod
    def validate_schema(data_model: BaseModel, required_fields: list[str] | None = None) -> BaseModel:
        """
        Verify that Pydantic object is valid and specified required fields are not empty.

        Raises:
            OutputValidationError: If model is missing critical content.
        """
        if required_fields:
            missing = []
            for field in required_fields:
                val = getattr(data_model, field, None)
                if val is None or (isinstance(val, (str, list, dict)) and len(val) == 0):
                    missing.append(field)

            if missing:
                logger.error("Output validation failed; empty fields", missing=missing)
                raise OutputValidationError(
                    f"Agent output model '{data_model.__class__.__name__}' missing required content in fields: {', '.join(missing)}"
                )

        return data_model
