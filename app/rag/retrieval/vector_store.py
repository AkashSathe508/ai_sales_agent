"""
Vector and Lexical storage implementations.

Provides:
- DocumentStoreProtocol
- InMemoryDocumentStore (fast deterministic local store for testing/offline)
- PostgreSQLDocumentStore (PostgreSQL pgvector + FTS implementation)
"""
from __future__ import annotations

import math
import re
from typing import Any, Protocol, runtime_checkable

from app.observability.logging import get_logger
from app.rag.ingestion.chunker import DocumentChunk
from app.rag.schemas import RetrievedChunk
from app.schemas import RetrievalMethod

logger = get_logger(__name__)


@runtime_checkable
class DocumentStoreProtocol(Protocol):
    """Protocol for document chunk vector and lexical storage."""

    async def add_chunks(self, chunks: list[DocumentChunk]) -> int:
        """Store document chunks with embeddings."""
        ...

    async def search_semantic(
        self,
        query_vector: list[float],
        limit: int = 10,
        min_similarity: float = 0.0,
    ) -> list[RetrievedChunk]:
        """Perform vector cosine similarity search."""
        ...

    async def search_keyword(
        self,
        query_text: str,
        limit: int = 10,
    ) -> list[RetrievedChunk]:
        """Perform lexical keyword/FTS search."""
        ...


class InMemoryDocumentStore:
    """
    In-memory vector and keyword store.
    Enables fully functional hybrid retrieval and testing without external database dependencies.
    """

    def __init__(self) -> None:
        self._chunks: dict[str, DocumentChunk] = {}

    async def add_chunks(self, chunks: list[DocumentChunk]) -> int:
        for chunk in chunks:
            self._chunks[chunk.chunk_id] = chunk
        return len(chunks)

    def _cosine_similarity(self, v1: list[float], v2: list[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 <= 0 or norm2 <= 0:
            return 0.0
        return max(0.0, min(1.0, dot / (norm1 * norm2)))

    async def search_semantic(
        self,
        query_vector: list[float],
        limit: int = 10,
        min_similarity: float = 0.0,
    ) -> list[RetrievedChunk]:
        results: list[tuple[float, DocumentChunk]] = []
        for chunk in self._chunks.values():
            if not chunk.embedding:
                continue
            sim = self._cosine_similarity(query_vector, chunk.embedding)
            if sim >= min_similarity:
                results.append((sim, chunk))

        # Sort descending by similarity
        results.sort(key=lambda x: x[0], reverse=True)
        retrieved: list[RetrievedChunk] = []

        for rank, (score, chk) in enumerate(results[:limit]):
            retrieved.append(
                RetrievedChunk(
                    chunk_id=chk.chunk_id,
                    document_id=chk.document_id,
                    document_version_id=chk.document_version_id,
                    source=chk.source,
                    title=chk.title,
                    section=chk.section,
                    content=chk.content,
                    score=round(score, 4),
                    retrieval_method=RetrievalMethod.SEMANTIC,
                    rank=rank,
                    metadata=chk.metadata,
                )
            )
        return retrieved

    async def search_keyword(
        self,
        query_text: str,
        limit: int = 10,
    ) -> list[RetrievedChunk]:
        """
        Lexical search matching exact tokens, product codes, and terms.
        Computes BM25-like term frequency score.
        """
        tokens = [t.lower() for t in re.findall(r"\w+", query_text) if len(t) >= 2]
        if not tokens:
            return []

        results: list[tuple[float, DocumentChunk]] = []
        for chunk in self._chunks.values():
            text_lower = f"{chunk.title} {chunk.section or ''} {chunk.content}".lower()
            score = 0.0
            matched_terms = 0

            for tok in tokens:
                count = text_lower.count(tok)
                if count > 0:
                    matched_terms += 1
                    # Give higher weight to matches in title/section
                    title_bonus = 2.0 if tok in chunk.title.lower() else 1.0
                    score += (count / (count + 1.5)) * title_bonus

            # Bonus for matching all or multiple query terms
            if matched_terms > 0:
                coverage_bonus = matched_terms / len(tokens)
                total_score = score * (1.0 + coverage_bonus)
                results.append((total_score, chunk))

        results.sort(key=lambda x: x[0], reverse=True)
        retrieved: list[RetrievedChunk] = []

        for rank, (score, chk) in enumerate(results[:limit]):
            retrieved.append(
                RetrievedChunk(
                    chunk_id=chk.chunk_id,
                    document_id=chk.document_id,
                    document_version_id=chk.document_version_id,
                    source=chk.source,
                    title=chk.title,
                    section=chk.section,
                    content=chk.content,
                    score=round(score, 4),
                    retrieval_method=RetrievalMethod.KEYWORD,
                    rank=rank,
                    metadata=chk.metadata,
                )
            )
        return retrieved
