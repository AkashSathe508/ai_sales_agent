"""LLM models and capability definitions."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ModelSpec:
    """Describes an LLM model's capabilities and constraints."""

    name: str
    provider: str
    max_context_tokens: int
    supports_json_mode: bool = False
    supports_function_calling: bool = False
    cost_per_1k_input: float = 0.0
    cost_per_1k_output: float = 0.0


SUPPORTED_MODELS: dict[str, ModelSpec] = {
    # ── Google Gemini ──────────────────────────────────────────────────────────
    # Primary model: Gemini 2.5 Flash — fast, high-quality, 1M context
    "gemini/gemini-2.5-flash": ModelSpec(
        name="gemini/gemini-2.5-flash",
        provider="google",
        max_context_tokens=1_048_576,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # Gemini 3.8 Flash — newest model
    "gemini/gemini-3.8-flash": ModelSpec(
        name="gemini/gemini-3.8-flash",
        provider="google",
        max_context_tokens=1_048_576,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # Gemini 2.0 Flash
    "gemini/gemini-2.0-flash": ModelSpec(
        name="gemini/gemini-2.0-flash",
        provider="google",
        max_context_tokens=1_048_576,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # ── Groq ──────────────────────────────────────────────────────────────────
    # Provider fallback: GPT-OSS 120B on Groq — 128k context, JSON mode + tool calling
    "groq/openai/gpt-oss-120b": ModelSpec(
        name="groq/openai/gpt-oss-120b",
        provider="groq",
        max_context_tokens=128_000,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # Groq fast model: GPT-OSS 20B on Groq
    "groq/openai/gpt-oss-20b": ModelSpec(
        name="groq/openai/gpt-oss-20b",
        provider="groq",
        max_context_tokens=128_000,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # Groq Qwen model: Qwen 3.8 27B on Groq
    "groq/qwen/qwen3.8-27b": ModelSpec(
        name="groq/qwen/qwen3.8-27b",
        provider="groq",
        max_context_tokens=128_000,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # Llama 3.3 70B Versatile on Groq
    "groq/llama-3.3-70b-versatile": ModelSpec(
        name="groq/llama-3.3-70b-versatile",
        provider="groq",
        max_context_tokens=128_000,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),

    # Groq lightweight option
    "groq/llama-3.1-8b-instant": ModelSpec(
        name="groq/llama-3.1-8b-instant",
        provider="groq",
        max_context_tokens=128_000,
        supports_json_mode=True,
        supports_function_calling=True,
        cost_per_1k_input=0.0,
        cost_per_1k_output=0.0,
    ),
}