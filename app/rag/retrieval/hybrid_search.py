"""
Hybrid retrieval coordinator.

Executes semantic search and keyword search in parallel, fuses them via RRF,
and refines candidate ranking with a pluggable Reranker.
"""
from __future__ import annotations

import asyncio
import time

from app.observability.logging import get_logger
from app.rag.embeddings import EmbeddingServiceProtocol, create_embedding_service
from app.rag.retrieval.reranker import Reranker, SimpleReranker
from app.rag.retrieval.rrf import fuse_results
from app.rag.retrieval.vector_store import DocumentStoreProtocol, InMemoryDocumentStore
from app.rag.schemas import RetrievedChunk

logger = get_logger(__name__)


class HybridSearchService:
    """
    Executes production-oriented hybrid retrieval:
    Query → [Semantic Search || Keyword Search] → RRF → Reranker → Candidates
    """

    def __init__(
        self,
        store: DocumentStoreProtocol | None = None,
        embedding_service: EmbeddingServiceProtocol | None = None,
        reranker: Reranker | None = None,
    ) -> None:
        self._store = store or InMemoryDocumentStore()
        self._embeddings = embedding_service or create_embedding_service()
        self._reranker = reranker or SimpleReranker()

    async def search(
        self,
        query: str,
        limit: int = 5,
        semantic_limit: int = 15,
        keyword_limit: int = 15,
        rrf_k: int = 60,
    ) -> list[RetrievedChunk]:
        """
        Perform hybrid search with RRF and reranking.

        Args:
            query: User search query or information need
            limit: Final top-k chunks to return
            semantic_limit: Candidates to fetch via vector search
            keyword_limit: Candidates to fetch via keyword FTS
            rrf_k: Hyperparameter for RRF formula

        Returns:
            Ranked list of RetrievedChunk
        """
        start = time.time()
        logger.debug("Executing hybrid search", query=query[:80])

        # 1. Embed query
        query_vector = await self._embeddings.embed_query(query)

        # 2. Run semantic and keyword searches concurrently
        semantic_task = self._store.search_semantic(
            query_vector=query_vector,
            limit=semantic_limit,
        )
        keyword_task = self._store.search_keyword(
            query_text=query,
            limit=keyword_limit,
        )

        semantic_res, keyword_res = await asyncio.gather(semantic_task, keyword_task)

        # 3. Fuse with Reciprocal Rank Fusion
        fused = fuse_results(
            semantic_results=semantic_res,
            keyword_results=keyword_res,
            k=rrf_k,
        )

        # 4. Apply Reranker
        reranked = await self._reranker.rerank(
            query=query,
            documents=fused,
            top_k=limit,
        )

        latency_ms = (time.time() - start) * 1000
        logger.info(
            "Hybrid search completed",
            query=query[:60],
            semantic_candidates=len(semantic_res),
            keyword_candidates=len(keyword_res),
            fused_total=len(fused),
            returned=len(reranked),
            latency_ms=f"{latency_ms:.0f}",
        )
        return reranked
