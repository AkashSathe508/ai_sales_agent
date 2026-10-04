"""
Reranker interface and implementations.

Reranking refines candidates returned by RRF by scoring query-chunk relevance.
Allows adding a Cross-Encoder or external model later without modifying agents.
"""
from __future__ import annotations

import re
from typing import Protocol, runtime_checkable

from app.rag.schemas import RetrievedChunk


@runtime_checkable
class Reranker(Protocol):
    """Protocol for candidate chunk reranking."""

    async def rerank(
        self,
        query: str,
        documents: list[RetrievedChunk],
        top_k: int | None = None,
    ) -> list[RetrievedChunk]:
        """Rerank candidate documents given the original user query."""
        ...


class BaseReranker:
    """Base class providing default sorting and truncation helpers."""

    def _truncate(
        self, documents: list[RetrievedChunk], top_k: int | None
    ) -> list[RetrievedChunk]:
        if top_k is not None and top_k > 0:
            return documents[:top_k]
        return documents


class SimpleReranker(BaseReranker):
    """
    Lightweight, fast rule-based reranker.

    Calculates exact phrase matches, term density, and section alignment
    to adjust candidate ranks. Does not require GPU or external model inference.
    """

    async def rerank(
        self,
        query: str,
        documents: list[RetrievedChunk],
        top_k: int | None = None,
    ) -> list[RetrievedChunk]:
        if not documents:
            return []

        query_lower = query.lower()
        query_terms = [t for t in re.findall(r"\w+", query_lower) if len(t) > 2]

        scored_docs: list[tuple[float, RetrievedChunk]] = []

        for doc in documents:
            content_lower = doc.content.lower()
            title_lower = doc.title.lower()
            section_lower = (doc.section or "").lower()

            # Base score from RRF
            base_score = doc.score

            # Term overlap score
            term_matches = sum(1 for t in query_terms if t in content_lower)
            term_coverage = term_matches / len(query_terms) if query_terms else 0.0

            # Exact phrase match bonus
            phrase_bonus = 0.5 if query_lower in content_lower else 0.0

            # Title / section alignment bonus
            header_bonus = 0.3 if any(t in title_lower or t in section_lower for t in query_terms) else 0.0

            # Combined reranking score
            new_score = base_score * (1.0 + term_coverage + phrase_bonus + header_bonus)
            scored_docs.append((new_score, doc))

        # Sort descending by updated score
        scored_docs.sort(key=lambda x: x[0], reverse=True)

        reranked: list[RetrievedChunk] = []
        for rank, (score, doc) in enumerate(scored_docs):
            reranked.append(
                RetrievedChunk(
                    chunk_id=doc.chunk_id,
                    document_id=doc.document_id,
                    document_version_id=doc.document_version_id,
                    source=doc.source,
                    title=doc.title,
                    section=doc.section,
                    content=doc.content,
                    score=round(score, 5),
                    retrieval_method=doc.retrieval_method,
                    rank=rank,
                    metadata={**doc.metadata, "rerank_score": score},
                )
            )

        return self._truncate(reranked, top_k)
