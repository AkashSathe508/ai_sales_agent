"""LiteLLM proxy gateway configuration."""
from __future__ import annotations

from app.llm.service import LLMService, create_llm_service

__all__ = ["LLMService", "create_llm_service"]
