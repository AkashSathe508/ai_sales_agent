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
from tenacity import retry, stop_after_attempt, wait_exponential

logger = get_logger(__name__)


@runtime_checkable
class EmbeddingServiceProtocol(Protocol):
    """Protocol for embedding generation services."""

    async def embed_query(self, text: str) -> list[float]:
        """Generate embedding vector for a search query."""
        ...

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8), reraise=True)
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
        configured = settings.rag.embedding_model
        model_name = configured.removeprefix("models/")
        self._model = model or (configured if "/" in configured else f"gemini/{model_name}")
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
            vectors = [list(data["embedding"]) for data in response.data]
            for vector in vectors:
                if len(vector) != self._dimension:
                    raise EmbeddingError(f"Embedding provider returned dimension {len(vector)}; configured dimension is {self._dimension}")
            if len(vectors) != len(texts):
                raise EmbeddingError("Embedding provider returned a different number of vectors than inputs")
            return vectors
        except Exception as exc:
            logger.error("Embedding generation failed via LiteLLM", error=str(exc))
            raise EmbeddingError(f"Embedding generation failed: {exc}") from exc


def create_embedding_service(use_mock: bool | None = None) -> EmbeddingServiceProtocol:
    """Factory to create the configured embedding service."""
    settings = get_settings()
    if use_mock is None:
        use_mock = not bool(settings.llm.google_api_key and settings.llm.google_api_key not in {"your_google_api_key_here", "test_key"})
    if use_mock:
        return MockEmbeddingService(dimension=settings.rag.embedding_dimensions)
    try:
        return LiteLLMEmbeddingService(dimension=settings.rag.embedding_dimensions)
    except Exception as exc:
        if settings.is_production:
            raise EmbeddingError(f"Could not configure production embedding service: {exc}") from exc
        return MockEmbeddingService(dimension=settings.rag.embedding_dimensions)
