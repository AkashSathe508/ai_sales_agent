"""
Reciprocal Rank Fusion (RRF) for combining semantic and keyword search results.

RRF does NOT simply add similarity scores. Instead, it uses ranking positions
from independent retrieval runs to produce a unified ranked list.

Formula: RRF_score(d) = Σ 1 / (k + rank(d)) for each result list

Reference:
    Cormack, G.V., Clarke, C.L., & Buettcher, S. (2009).
    Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods.
    SIGIR 2009.
"""
from __future__ import annotations

from collections import defaultdict

from app.rag.schemas import RetrievedChunk
from app.schemas import RetrievalMethod


def fuse_results(
    semantic_results: list[RetrievedChunk],
    keyword_results: list[RetrievedChunk],
    k: int = 60,
    semantic_weight: float = 1.0,
    keyword_weight: float = 1.0,
) -> list[RetrievedChunk]:
    """
    Combine semantic search results and keyword search results using RRF.

    Both result lists are expected to be pre-sorted by their respective scores
    (highest score first). This function assigns a rank to each document in each
    list and computes the fused RRF score.

    Args:
        semantic_results: Results from pgvector semantic search, sorted by score DESC
        keyword_results:  Results from PostgreSQL FTS, sorted by score DESC
        k:                RRF hyperparameter (default=60). Higher k reduces the
                          impact of high-ranked documents.
        semantic_weight:  Weight multiplier for semantic RRF contribution (default=1.0)
        keyword_weight:   Weight multiplier for keyword RRF contribution (default=1.0)

    Returns:
        Unified list of RetrievedChunk, sorted by RRF score DESC.
        Chunks that appear in both lists get a score from both contributions.
    """
    # Map chunk_id → accumulated RRF score and best chunk object
    scores: dict[str, float] = defaultdict(float)
    chunks: dict[str, RetrievedChunk] = {}

    # Process semantic results
    for rank_idx, chunk in enumerate(semantic_results):
        rrf_contribution = semantic_weight / (k + rank_idx + 1)
        scores[chunk.chunk_id] += rrf_contribution
        if chunk.chunk_id not in chunks:
            chunks[chunk.chunk_id] = chunk

    # Process keyword results
    for rank_idx, chunk in enumerate(keyword_results):
        rrf_contribution = keyword_weight / (k + rank_idx + 1)
        scores[chunk.chunk_id] += rrf_contribution
        if chunk.chunk_id not in chunks:
            chunks[chunk.chunk_id] = chunk

    # Sort by RRF score descending
    sorted_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)

    fused: list[RetrievedChunk] = []
    for rank, chunk_id in enumerate(sorted_ids):
        chunk = chunks[chunk_id]
        # Create a new chunk object with the RRF score and hybrid retrieval method
        fused_chunk = RetrievedChunk(
            chunk_id=chunk.chunk_id,
            document_id=chunk.document_id,
            document_version_id=chunk.document_version_id,
            source=chunk.source,
            title=chunk.title,
            section=chunk.section,
            content=chunk.content,
            score=scores[chunk_id],  # RRF score (not cosine similarity)
            retrieval_method=RetrievalMethod.HYBRID,
            rank=rank,
            metadata={
                **chunk.metadata,
                "rrf_score": scores[chunk_id],
                "original_method": chunk.retrieval_method,
            },
        )
        fused.append(fused_chunk)

    return fused


def fuse_multiple(
    result_lists: list[tuple[list[RetrievedChunk], float]],
    k: int = 60,
) -> list[RetrievedChunk]:
    """
    Generalized RRF for more than two result lists.

    Args:
        result_lists: List of (results, weight) tuples
        k: RRF hyperparameter

    Returns:
        Unified ranked list
    """
    scores: dict[str, float] = defaultdict(float)
    chunks: dict[str, RetrievedChunk] = {}

    for results, weight in result_lists:
        for rank_idx, chunk in enumerate(results):
            scores[chunk.chunk_id] += weight / (k + rank_idx + 1)
            if chunk.chunk_id not in chunks:
                chunks[chunk.chunk_id] = chunk

    sorted_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)

    fused: list[RetrievedChunk] = []
    for rank, chunk_id in enumerate(sorted_ids):
        chunk = chunks[chunk_id]
        fused_chunk = RetrievedChunk(
            chunk_id=chunk.chunk_id,
            document_id=chunk.document_id,
            document_version_id=chunk.document_version_id,
            source=chunk.source,
            title=chunk.title,
            section=chunk.section,
            content=chunk.content,
            score=scores[chunk_id],
            retrieval_method=RetrievalMethod.HYBRID,
            rank=rank,
            metadata={
                **chunk.metadata,
                "rrf_score": scores[chunk_id],
            },
        )
        fused.append(fused_chunk)

    return fused
