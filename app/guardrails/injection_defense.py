"""
Prompt Injection Defense and Untrusted Data Isolation.

Enforces containment boundaries around third-party retrieved text.
Documents are treated as raw data payloads, never executable prompt directives.
"""
from __future__ import annotations

import re

from app.exceptions import PromptInjectionError
from app.observability.logging import get_logger

logger = get_logger(__name__)

# Patterns indicative of instruction escape or jailbreak attempts
INJECTION_SIGNATURES: list[re.Pattern] = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(the\s+)?(system\s+)?prompt", re.IGNORECASE),
    re.compile(r"system\s*override", re.IGNORECASE),
    re.compile(r"\bdan\s+mode\b", re.IGNORECASE),
    re.compile(r"bypass\s+(all\s+)?safety\s+filters", re.IGNORECASE),
    re.compile(r"reveal\s+(all\s+)?(internal\s+)?passwords|credentials|api[_\s]keys", re.IGNORECASE),
]


class InjectionDefense:
    """Detects and isolates prompt injection in user queries and untrusted documents."""

    @staticmethod
    def detect_injection(text: str) -> bool:
        """
        Check if text contains explicit prompt-injection or jailbreak patterns.
        """
        for pattern in INJECTION_SIGNATURES:
            if pattern.search(text):
                return True
        return False

    @staticmethod
    def sanitize_untrusted_text(text: str) -> str:
        """
        Sanitize and wrap untrusted document text in inert XML delimiters.
        Ensures LLM interprets it strictly as data, not instructions.
        """
        sanitized = text.replace("<script>", "").replace("</script>", "")
        return f"<untrusted_document_data>\n{sanitized}\n</untrusted_document_data>"

    @staticmethod
    def guard_user_input(query: str) -> None:
        """
        Scan user prompt for hostile injection attacks.

        Raises:
            PromptInjectionError: If hostile instruction override is detected.
        """
        if InjectionDefense.detect_injection(query):
            logger.warning("Prompt injection signature detected in user input", query=query[:100])
            raise PromptInjectionError("Hostile prompt injection signature detected in user input.")
