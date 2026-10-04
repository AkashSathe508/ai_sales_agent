"""
Application configuration using Pydantic Settings.
All values are read from environment variables or .env file.
No secrets are hard-coded.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMSettings(BaseSettings):
    """LLM / LiteLLM configuration."""

    model: str = Field(default="gemini/gemini-2.5-flash", alias="LITELLM_MODEL")
    fallback_model: str = Field(
        default="gemini/gemini-3.8-flash", alias="LITELLM_FALLBACK_MODEL"
    )
    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="groq/openai/gpt-oss-120b", alias="GROQ_MODEL")
    max_tokens: int = Field(default=4096, alias="LITELLM_MAX_TOKENS")
    temperature: float = Field(default=0.0, alias="LITELLM_TEMPERATURE")
    timeout: int = Field(default=60, alias="LITELLM_TIMEOUT")
    max_retries: int = Field(default=3, alias="LITELLM_MAX_RETRIES")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class DatabaseSettings(BaseSettings):
    """PostgreSQL / SQLAlchemy configuration."""

    url: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost:5432/sales_ai",
        alias="DATABASE_URL",
    )
    url_sync: str = Field(
        default="postgresql+psycopg2://postgres:password@localhost:5432/sales_ai",
        alias="DATABASE_URL_SYNC",
    )
    pool_size: int = Field(default=10, alias="DATABASE_POOL_SIZE")
    max_overflow: int = Field(default=20, alias="DATABASE_MAX_OVERFLOW")
    echo: bool = Field(default=False, alias="DATABASE_ECHO")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class RAGSettings(BaseSettings):
    """RAG pipeline configuration."""

    chunk_size: int = Field(default=512, alias="RAG_CHUNK_SIZE")
    chunk_overlap: int = Field(default=64, alias="RAG_CHUNK_OVERLAP")
    top_k: int = Field(default=10, alias="RAG_TOP_K")
    rerank_top_k: int = Field(default=5, alias="RAG_RERANK_TOP_K")
    rrf_k: int = Field(default=60, alias="RAG_RRF_K")
    embedding_model: str = Field(
        default="models/text-embedding-004", alias="EMBEDDING_MODEL"
    )
    embedding_dimensions: int = Field(default=768, alias="EMBEDDING_DIMENSIONS")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class ObservabilitySettings(BaseSettings):
    """Observability configuration."""

    langsmith_api_key: str = Field(default="", alias="LANGSMITH_API_KEY")
    langsmith_project: str = Field(default="sales-ai-agents", alias="LANGSMITH_PROJECT")
    langchain_tracing_v2: bool = Field(default=False, alias="LANGCHAIN_TRACING_V2")

    otel_endpoint: str = Field(
        default="http://localhost:4317", alias="OTEL_EXPORTER_OTLP_ENDPOINT"
    )
    otel_service_name: str = Field(default="sales-ai-agents", alias="OTEL_SERVICE_NAME")
    otel_enabled: bool = Field(default=False, alias="OTEL_ENABLED")

    prometheus_port: int = Field(default=9090, alias="PROMETHEUS_PORT")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class MCPSettings(BaseSettings):
    """MCP gateway configuration."""

    timeout_seconds: int = Field(default=30, alias="MCP_TIMEOUT_SECONDS")
    use_mock: bool = Field(default=True, alias="MCP_USE_MOCK")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class AppSettings(BaseSettings):
    """Top-level application settings."""

    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO", alias="LOG_LEVEL"
    )
    log_format: Literal["json", "console"] = Field(default="console", alias="LOG_FORMAT")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="ENVIRONMENT"
    )
    debug: bool = Field(default=False, alias="DEBUG")
    secret_key: str = Field(default="change_this_in_production", alias="SECRET_KEY")

    approval_required: bool = Field(default=True, alias="APPROVAL_REQUIRED")
    approval_timeout_seconds: int = Field(
        default=3600, alias="APPROVAL_TIMEOUT_SECONDS"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class Settings:
    """Aggregated settings object — single point of truth."""

    def __init__(self) -> None:
        self.app = AppSettings()
        self.llm = LLMSettings()
        self.database = DatabaseSettings()
        self.rag = RAGSettings()
        self.observability = ObservabilitySettings()
        self.mcp = MCPSettings()

    @property
    def is_production(self) -> bool:
        return self.app.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.app.environment == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached Settings singleton."""
    return Settings()
