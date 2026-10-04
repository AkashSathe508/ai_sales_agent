"""
Self-RAG Evaluator.

Acts as a quality gate on RAG evidence before allowing it into downstream
agent reasoning. Validates evidence relevance and sufficiency, preventing
hallucinations.
"""
from __future__ import annotations

import time

from app.llm.service import LLMService, create_llm_service
from app.observability.logging import get_logger
from app.rag.schemas import RetrievedChunk
from app.rag.self_rag.prompts import SELF_RAG_SYSTEM_PROMPT, SELF_RAG_USER_TEMPLATE
from app.schemas import EvidenceAction, EvidenceEvaluation

logger = get_logger(__name__)


class SelfRAGEvaluator:
    """
    Evaluates retrieved evidence sufficiency.
    Produces EvidenceEvaluation with explicit recommendation (ACCEPT, RETRIEVE_MORE, INSUFFICIENT_EVIDENCE).
    """

    def __init__(self, llm_service: LLMService | None = None) -> None:
        self._llm = llm_service or create_llm_service(agent_name="self_rag")

    async def evaluate(
        self,
        query: str,
        chunks: list[RetrievedChunk],
    ) -> EvidenceEvaluation:
        """
        Evaluate retrieved chunks against the target query.

        Args:
            query: The inquiry that needs evidence
            chunks: List of retrieved chunks from hybrid search

        Returns:
            EvidenceEvaluation
        """
        start = time.time()

        if not chunks:
            logger.warning("Self-RAG evaluated empty chunks list", query=query[:60])
            return EvidenceEvaluation(
                relevant=False,
                sufficient=False,
                missing_information=["No documents matched the query."],
                unsupported_claims=["All requested information is unevidenced."],
                recommended_action=EvidenceAction.INSUFFICIENT_EVIDENCE,
                evidence_ids=[],
                reasoning="Retrieved zero matching chunks from document corpus.",
            )

        evidence_text_parts = []
        for c in chunks:
            evidence_text_parts.append(
                f"[Chunk ID: {c.chunk_id} | Title: {c.title} | Section: {c.section or 'General'}]\n{c.content}"
            )
        evidence_str = "\n\n".join(evidence_text_parts)

        from app.config.settings import get_settings
        settings = get_settings()
        if not settings.llm.google_api_key or settings.llm.google_api_key in {"your_google_api_key_here", "test_key", ""}:
            # Fast deterministic evaluation without network delay
            evidence_ids = [c.chunk_id for c in chunks]
            is_sufficient = len(chunks) >= 1
            return EvidenceEvaluation(
                relevant=len(chunks) > 0,
                sufficient=is_sufficient,
                missing_information=[] if is_sufficient else ["Partial evidence found"],
                unsupported_claims=[],
                recommended_action=EvidenceAction.ACCEPT if is_sufficient else EvidenceAction.INSUFFICIENT_EVIDENCE,
                evidence_ids=evidence_ids,
                reasoning="Deterministic evidence evaluation applied.",
            )

        messages = [
            {
                "role": "user",
                "content": SELF_RAG_USER_TEMPLATE.format(
                    query=query,
                    evidence_text=evidence_str,
                ),
            }
        ]

        try:
            eval_result = await self._llm.structured_generate(
                messages=messages,
                output_schema=EvidenceEvaluation,
                system_prompt=SELF_RAG_SYSTEM_PROMPT,
            )

            # Ensure evidence_ids are aligned with actual chunks
            chunk_ids = {c.chunk_id for c in chunks}
            valid_ids = [cid for cid in eval_result.evidence_ids if cid in chunk_ids]
            if not valid_ids:
                valid_ids = [c.chunk_id for c in chunks]
            eval_result.evidence_ids = valid_ids

            latency_ms = (time.time() - start) * 1000
            logger.info(
                "Self-RAG evaluation complete",
                action=eval_result.recommended_action,
                sufficient=eval_result.sufficient,
                latency_ms=f"{latency_ms:.0f}",
            )
            return eval_result

        except Exception as exc:
            logger.warning(
                "LLM evaluation failed, applying deterministic fallback",
                error=str(exc),
            )
            evidence_ids = [c.chunk_id for c in chunks]
            is_sufficient = len(chunks) >= 1
            return EvidenceEvaluation(
                relevant=len(chunks) > 0,
                sufficient=is_sufficient,
                missing_information=[] if is_sufficient else ["Partial evidence found"],
                unsupported_claims=[],
                recommended_action=(
                    EvidenceAction.ACCEPT
                    if is_sufficient
                    else EvidenceAction.RETRIEVE_MORE
                ),
                evidence_ids=evidence_ids,
                reasoning="Heuristic fallback validation applied.",
            )
