"""
Evidence Guardrails.

Verifies that document-derived claims reference valid evidence IDs
and flags ungrounded assertions.
"""
from __future__ import annotations

from app.exceptions import UnsupportedClaimError
from app.observability.logging import get_logger
from app.schemas import Evidence, SalesInsight, SourceType

logger = get_logger(__name__)


class EvidenceGuardrails:
    """Verifies that all citations and evidence references are grounded in the retrieved evidence set."""

    @staticmethod
    def validate_insight_citations(
        insights: list[SalesInsight],
        available_evidence: list[Evidence],
    ) -> list[SalesInsight]:
        """
        Verify that insights citing documents have valid, existing evidence IDs.

        Raises:
            UnsupportedClaimError: If a document claim cites nonexistent evidence.
        """
        valid_ids = {e.evidence_id for e in available_evidence}

        for insight in insights:
            if insight.source_type == SourceType.DOCUMENT:
                if not insight.evidence_ids:
                    logger.warning("Document insight missing evidence ID", insight=insight.insight[:80])
                    raise UnsupportedClaimError(
                        f"Document insight '{insight.insight[:60]}...' lacks supporting evidence_id."
                    )
                missing = [eid for eid in insight.evidence_ids if eid not in valid_ids]
                if missing:
                    logger.warning("Insight cites non-existent evidence IDs", missing=missing)
                    raise UnsupportedClaimError(
                        f"Insight cites non-existent evidence IDs: {', '.join(missing)}"
                    )

        return insights
