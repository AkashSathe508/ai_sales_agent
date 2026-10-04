"""
RAG Tool — controlled interface between agents and hybrid retrieval pipeline.

Architecture:
    Agent → RAG Tool → HybridSearchService → [Semantic + FTS] → RRF → Reranker → Self-RAG → Evidence

Agents call methods on this tool.
No agent accesses raw vector stores or database tables directly.
"""
from __future__ import annotations

import time
from typing import Any

from app.observability.correlation import new_tool_call_id
from app.observability.logging import get_logger
from app.observability.metrics import tool_calls_total, tool_latency_seconds
from app.rag.retrieval.hybrid_search import HybridSearchService
from app.rag.schemas import RetrievedChunk
from app.rag.self_rag.evaluator import SelfRAGEvaluator
from app.schemas import Evidence, EvidenceAction, EvidenceEvaluation, ToolResult

logger = get_logger(__name__)

TOOL_NAME = "rag_tool"


class RAGTool:
    """
    Controlled tool providing evidence-grounded document search to agents.
    Enforces hybrid retrieval, reciprocal rank fusion, reranking, and self-RAG evaluation.
    """

    def __init__(
        self,
        hybrid_search: HybridSearchService | None = None,
        evaluator: SelfRAGEvaluator | None = None,
    ) -> None:
        self._search_service = hybrid_search or HybridSearchService()
        self._evaluator = evaluator or SelfRAGEvaluator()

    async def search(
        self,
        query: str,
        limit: int = 5,
        min_relevance: float = 0.0,
        run_self_rag: bool = True,
    ) -> ToolResult:
        """
        Execute full RAG pipeline returning validated evidence.

        Args:
            query: User or agent question/topic
            limit: Maximum evidence chunks to return
            min_relevance: Minimum score cutoff
            run_self_rag: Whether to evaluate evidence with Self-RAG

        Returns:
            ToolResult containing dict with:
                - evidence: list[Evidence]
                - evaluation: EvidenceEvaluation | None
                - raw_chunks: list[RetrievedChunk]
        """
        call_id = new_tool_call_id()
        start = time.time()
        logger.info("RAG Tool search initiated", tool_call_id=call_id, query=query[:80])

        try:
            # 1. Hybrid Search (Semantic + Lexical + RRF + Reranker)
            chunks: list[RetrievedChunk] = await self._search_service.search(
                query=query,
                limit=limit,
            )

            # Filter by relevance threshold if needed
            if min_relevance > 0.0:
                chunks = [c for c in chunks if c.score >= min_relevance]

            # 2. Self-RAG Quality Gate
            evaluation: EvidenceEvaluation | None = None
            if run_self_rag:
                evaluation = await self._evaluator.evaluate(query=query, chunks=chunks)

            # 3. Convert accepted chunks to Evidence schemas
            evidence_list: list[Evidence] = [c.to_evidence() for c in chunks]

            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="rag", status="success").inc()
            tool_latency_seconds.labels(tool_name=TOOL_NAME).observe(latency_ms / 1000)

            result_data = {
                "evidence": evidence_list,
                "evaluation": evaluation,
                "chunks_count": len(chunks),
                "is_sufficient": evaluation.sufficient if evaluation else True,
            }

            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=True,
                data=result_data,
                latency_ms=latency_ms,
            )

        except Exception as exc:
            latency_ms = (time.time() - start) * 1000
            tool_calls_total.labels(tool_name=TOOL_NAME, agent="rag", status="error").inc()
            logger.error("RAG Tool search failed", error=str(exc), query=query[:80])

            return ToolResult(
                tool_name=TOOL_NAME,
                tool_call_id=call_id,
                success=False,
                error=f"RAG search error: {exc}",
                latency_ms=latency_ms,
            )
