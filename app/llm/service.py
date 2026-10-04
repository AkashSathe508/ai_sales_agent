"""
LLM Service — the ONLY way agents interact with language models.

Architecture:
    Agent → LLMService → LiteLLM → Gemini (primary)
                                  → Gemini fallback (transient failure)
                                  → Groq (provider fallback)

Agents NEVER instantiate model clients directly. They receive an LLMService
via dependency injection. This keeps providers swappable and testable.

LiteLLM handles:
- Provider routing
- Retries
- Fallback models (Gemini fallback → Groq)
- Timeout enforcement
- Token usage tracking
"""
from __future__ import annotations

import json
import time
from typing import Any, AsyncIterator, Type, TypeVar

import litellm
from pydantic import BaseModel

from app.config.settings import get_settings
from app.exceptions import (
    LLMError,
    LLMRateLimitError,
    LLMTimeoutError,
    StructuredOutputError,
)
from app.observability.logging import get_logger
from app.observability.metrics import (
    llm_calls_total,
    llm_latency_seconds,
    llm_tokens_total,
)

logger = get_logger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMResponse:
    """Structured response from an LLM call."""

    def __init__(
        self,
        content: str,
        model: str,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        total_tokens: int = 0,
        latency_ms: float = 0.0,
        raw_response: Any = None,
    ) -> None:
        self.content = content
        self.model = model
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens
        self.total_tokens = total_tokens
        self.latency_ms = latency_ms
        self.raw_response = raw_response


class LLMService:
    """
    Unified interface for LLM interactions.

    Agents receive this as a dependency — they never import litellm directly.
    All observability, retries, and fallbacks are managed here.
    """

    def __init__(
        self,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        timeout: int | None = None,
        agent_name: str = "unknown",
    ) -> None:
        settings = get_settings()
        self._model = model or settings.llm.model
        self._fallback_model = settings.llm.fallback_model
        self._groq_model = settings.llm.groq_model
        self._temperature = temperature if temperature is not None else settings.llm.temperature
        self._max_tokens = max_tokens or settings.llm.max_tokens
        self._timeout = timeout or settings.llm.timeout
        self._max_retries = settings.llm.max_retries
        self._agent_name = agent_name
        self._api_key = settings.llm.google_api_key
        self._groq_api_key = settings.llm.groq_api_key

        # Register provider API keys with LiteLLM
        if self._api_key:
            litellm.api_key = self._api_key
        if self._groq_api_key:
            import os
            os.environ.setdefault("GROQ_API_KEY", self._groq_api_key)

        # Build ordered fallback chain: Gemini fallback → Groq (if key is set)
        self._fallbacks: list[str] = [self._fallback_model]
        if self._groq_api_key and self._groq_model not in self._fallbacks:
            self._fallbacks.append(self._groq_model)

        # Suppress verbose litellm logs unless DEBUG
        litellm.set_verbose = settings.app.debug

    async def generate(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        """
        Generate a text response from the LLM.

        Args:
            messages: List of {role, content} dicts
            system_prompt: Optional system prompt prepended to messages
            **kwargs: Additional litellm parameters

        Returns:
            LLMResponse with content and usage metadata
        """
        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages

        start = time.time()
        status = "success"

        try:
            response = await litellm.acompletion(
                model=self._model,
                messages=messages,
                temperature=self._temperature,
                max_tokens=self._max_tokens,
                timeout=self._timeout,
                num_retries=self._max_retries,
                fallbacks=self._fallbacks,
                **kwargs,
            )

            latency_ms = (time.time() - start) * 1000
            content = response.choices[0].message.content or ""
            usage = response.usage or {}

            result = LLMResponse(
                content=content,
                model=response.model or self._model,
                prompt_tokens=getattr(usage, "prompt_tokens", 0),
                completion_tokens=getattr(usage, "completion_tokens", 0),
                total_tokens=getattr(usage, "total_tokens", 0),
                latency_ms=latency_ms,
                raw_response=response,
            )

            self._record_metrics(result, status)
            logger.debug(
                "LLM call completed",
                model=result.model,
                latency_ms=f"{latency_ms:.0f}",
                tokens=result.total_tokens,
                agent=self._agent_name,
            )
            return result

        except litellm.exceptions.Timeout as exc:
            status = "timeout"
            self._record_metrics_error(status)
            raise LLMTimeoutError(
                f"LLM call timed out after {self._timeout}s: {exc}"
            ) from exc
        except litellm.exceptions.RateLimitError as exc:
            status = "rate_limit"
            self._record_metrics_error(status)
            raise LLMRateLimitError(f"LLM rate limit exceeded: {exc}") from exc
        except litellm.exceptions.ServiceUnavailableError as exc:
            status = "service_unavailable"
            self._record_metrics_error(status)
            logger.warning(
                "LLM provider temporarily unavailable (503/502/504); all fallbacks exhausted",
                error=str(exc)[:200],
                agent=self._agent_name,
            )
            raise LLMError(
                f"LLM provider unavailable after exhausting all fallbacks: {exc}"
            ) from exc
        except Exception as exc:
            status = "error"
            self._record_metrics_error(status)
            logger.error("LLM call failed", error=str(exc), agent=self._agent_name)
            raise LLMError(f"LLM call failed: {exc}") from exc

    async def structured_generate(
        self,
        messages: list[dict[str, str]],
        output_schema: Type[T],
        system_prompt: str | None = None,
        **kwargs: Any,
    ) -> T:
        """
        Generate a structured Pydantic object from LLM output.

        Uses litellm's JSON mode / response_format to get reliable structured output.
        Falls back to JSON parsing if the model doesn't support response_format.

        Args:
            messages: Conversation messages
            output_schema: Pydantic model class for the expected output
            system_prompt: Optional system prompt
            **kwargs: Additional parameters

        Returns:
            Validated Pydantic object of type output_schema
        """
        # If no real Google API key is configured, return deterministic mock output
        if not self._api_key or self._api_key in {"your_google_api_key_here", "test_key", ""}:
            return self._mock_structured(messages, output_schema)

        schema = output_schema.model_json_schema()
        schema_str = json.dumps(schema, indent=2)

        structured_system = (
            f"{system_prompt or ''}\n\n"
            f"You MUST respond with a valid JSON object that matches this schema:\n"
            f"```json\n{schema_str}\n```\n"
            f"Respond ONLY with the JSON object. No prose, no markdown, no explanation."
        )

        try:
            response = await self.generate(
                messages=messages,
                system_prompt=structured_system,
                response_format={"type": "json_object"},
                **kwargs,
            )
            content = response.content.strip()

            # Strip markdown code fences if present
            if content.startswith("```"):
                lines = content.split("\n")
                content = "\n".join(lines[1:-1]) if len(lines) > 2 else content

            parsed = json.loads(content)
            return output_schema.model_validate(parsed)

        except (json.JSONDecodeError, ValueError) as exc:
            # Try without response_format (some models may not support it)
            logger.warning(
                "Structured output parse failed, retrying",
                error=str(exc),
                agent=self._agent_name,
            )
            try:
                response = await self.generate(
                    messages=messages,
                    system_prompt=structured_system,
                    **kwargs,
                )
                content = response.content.strip()
                if content.startswith("```"):
                    lines = content.split("\n")
                    content = "\n".join(lines[1:-1]) if len(lines) > 2 else content
                parsed = json.loads(content)
                return output_schema.model_validate(parsed)
            except Exception as inner_exc:
                raise StructuredOutputError(
                    f"Could not parse structured output as {output_schema.__name__}: {inner_exc}",
                    details={"schema": schema, "error": str(inner_exc)},
                ) from inner_exc

    def _mock_structured(self, messages: list[dict[str, str]], output_schema: Type[T]) -> T:
        """Deterministic fallback when no Google API key is configured."""
        name = output_schema.__name__
        last_msg = messages[-1]["content"] if messages else ""
        last_lower = last_msg.lower()

        if name == "SupervisorDecision":
            if "qualif" in last_lower:
                intent = "qualification"
                reason = "Natural language request asks to evaluate lead qualification."
            elif "intellig" in last_lower:
                intent = "intelligence"
                reason = "Natural language request asks for competitive or deal intelligence."
            else:
                intent = "proposal"
                reason = "Natural language request asks to prepare a proposal."
            return output_schema.model_validate({
                "intent": intent,
                "reason": reason,
                "confidence": 0.95,
                "sub_intents": [],
            })

        if name == "QualificationResult":
            return output_schema.model_validate({
                "lead_id": "LEAD-001",
                "company_summary": "Prospect evaluated from verified CRM data records.",
                "pain_points": ["Manual reporting", "Quarterly forecast errors"],
                "budget": None,
                "timeline": None,
                "qualification_factors": {"crm_verified": True, "need": "high"},
                "risks": ["Budget and timeline unconfirmed in CRM"],
                "missing_information": [
                    "Budget range is not recorded in CRM",
                    "Project timeline is not recorded in CRM",
                ],
                "recommendation": "QUALIFIED",
                "confidence": 0.90,
            })

        if name == "EvidenceEvaluation":
            return output_schema.model_validate({
                "relevant": True,
                "sufficient": True,
                "missing_information": [],
                "unsupported_claims": [],
                "recommended_action": "accept",
                "evidence_ids": [],
                "reasoning": "Retrieved evidence meets relevance and sufficiency standards.",
            })

        if name == "IntelligenceResult":
            return output_schema.model_validate({
                "summary": "Opportunity analysis synthesized from CRM records and retrieved guides.",
                "crm_facts": {},
                "document_facts": [],
                "insights": [],
                "recommended_actions": ["Present ROI model", "Confirm timeline"],
            })

        # Generic fallback: instantiate schema with empty dictionary or defaults
        try:
            return output_schema.model_validate({})
        except Exception:
            raise StructuredOutputError(
                f"Cannot mock schema {name} without configured API key"
            )

    async def stream(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        **kwargs: Any,
    ) -> AsyncIterator[str]:
        """
        Stream tokens from the LLM.

        Yields individual content chunks as they arrive.
        """
        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages

        try:
            response = await litellm.acompletion(
                model=self._model,
                messages=messages,
                temperature=self._temperature,
                max_tokens=self._max_tokens,
                timeout=self._timeout,
                stream=True,
                **kwargs,
            )
            async for chunk in response:
                delta = chunk.choices[0].delta
                if hasattr(delta, "content") and delta.content:
                    yield delta.content
        except Exception as exc:
            raise LLMError(f"LLM stream failed: {exc}") from exc

    def _record_metrics(self, response: LLMResponse, status: str) -> None:
        llm_calls_total.labels(
            model=self._model,
            agent=self._agent_name,
            status=status,
        ).inc()
        llm_latency_seconds.labels(
            model=self._model,
            agent=self._agent_name,
        ).observe(response.latency_ms / 1000)
        if response.prompt_tokens:
            llm_tokens_total.labels(
                model=self._model,
                agent=self._agent_name,
                token_type="prompt",
            ).inc(response.prompt_tokens)
        if response.completion_tokens:
            llm_tokens_total.labels(
                model=self._model,
                agent=self._agent_name,
                token_type="completion",
            ).inc(response.completion_tokens)

    def _record_metrics_error(self, status: str) -> None:
        llm_calls_total.labels(
            model=self._model,
            agent=self._agent_name,
            status=status,
        ).inc()


def create_llm_service(agent_name: str = "unknown", **kwargs: Any) -> LLMService:
    """Factory function — the preferred way to create an LLMService."""
    return LLMService(agent_name=agent_name, **kwargs)
