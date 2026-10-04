"""
Embedding service abstraction and implementations.

Provides:
- EmbeddingServiceProtocol (interface)
- MockEmbeddingService (deterministic vector generator for offline/tests)
- LiteLLMEmbeddingService (production embedding client via LiteLLM)
"""
from __future__ import annotations

import hashlib
import math
from typing import Protocol, runtime_checkable

from app.config.settings import get_settings
from app.exceptions import EmbeddingError
from app.observability.logging import get_logger

logger = get_logger(__name__)


@runtime_checkable
class EmbeddingServiceProtocol(Protocol):
    """Protocol for embedding generation services."""

    async def embed_query(self, text: str) -> list[float]:
        """Generate embedding vector for a search query."""
        ...

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for a batch of document texts."""
        ...

    @property
    def dimension(self) -> int:
        """Vector dimension."""
        ...


class MockEmbeddingService:
    """
    Deterministic pseudo-embedding generator.

    Produces normalized, repeatable vector representations from text
    using word hashing and character n-grams. Does not require any external
    API or GPU, making tests and offline local execution 100% reliable.
    """

    def __init__(self, dimension: int = 384) -> None:
        self._dim = dimension

    @property
    def dimension(self) -> int:
        return self._dim

    def _generate_vector(self, text: str) -> list[float]:
        words = text.lower().split()
        vec = [0.0] * self._dim

        if not words:
            vec[0] = 1.0
            return vec

        for word in words:
            # Deterministic bucket hashing
            h = int(hashlib.sha256(word.encode("utf-8")).hexdigest()[:8], 16)
            idx = h % self._dim
            vec[idx] += 1.0

            # Substring features
            if len(word) >= 3:
                h2 = int(hashlib.md5(word[:3].encode("utf-8")).hexdigest()[:8], 16)
                idx2 = h2 % self._dim
                vec[idx2] += 0.5

        # L2 normalize vector
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        else:
            vec[0] = 1.0

        return vec

    async def embed_query(self, text: str) -> list[float]:
        return self._generate_vector(text)

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._generate_vector(t) for t in texts]


class LiteLLMEmbeddingService:
    """
    Production embedding service utilizing LiteLLM.
    Supports OpenAI, Google text-embedding, and HuggingFace endpoints.
    """

    def __init__(
        self,
        model: str | None = None,
        dimension: int = 768,
    ) -> None:
        settings = get_settings()
        self._model = model or settings.llm.model.replace("gemini", "text-embedding-004") if "gemini" in settings.llm.model else "text-embedding-3-small"
        self._dimension = dimension
        self._api_key = settings.llm.google_api_key

    @property
    def dimension(self) -> int:
        return self._dimension

    async def embed_query(self, text: str) -> list[float]:
        results = await self.embed_documents([text])
        return results[0]

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        import litellm

        try:
            response = await litellm.aembedding(
                model=self._model,
                input=texts,
                api_key=self._api_key,
            )
            return [data["embedding"] for data in response.data]
        except Exception as exc:
            logger.error("Embedding generation failed via LiteLLM", error=str(exc))
            raise EmbeddingError(f"Embedding generation failed: {exc}") from exc


def create_embedding_service(use_mock: bool = True) -> EmbeddingServiceProtocol:
    """Factory to create the configured embedding service."""
    if use_mock:
        return MockEmbeddingService()
    try:
        return LiteLLMEmbeddingService()
    except Exception:
        return MockEmbeddingService()
