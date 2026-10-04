"""
Unit tests for Reciprocal Rank Fusion (RRF).
"""
import pytest

from app.rag.retrieval.rrf import fuse_results
from app.rag.schemas import RetrievedChunk
from app.schemas import RetrievalMethod


def make_chunk(cid: str, score: float, method: RetrievalMethod = RetrievalMethod.SEMANTIC) -> RetrievedChunk:
    return RetrievedChunk(
        chunk_id=cid,
        document_id=f"doc_{cid}",
        document_version_id="v1",
        source="test_source",
        title="Test Title",
        content=f"Content for {cid}",
        score=score,
        retrieval_method=method,
    )


def test_rrf_combines_and_ranks_documents():
    # doc_A is rank 1 in semantic and rank 1 in keyword -> should be top ranked
    # doc_B is rank 2 in semantic only
    # doc_C is rank 2 in keyword only
    semantic = [make_chunk("doc_A", 0.95), make_chunk("doc_B", 0.80)]
    keyword = [
        make_chunk("doc_A", 5.0, RetrievalMethod.KEYWORD),
        make_chunk("doc_C", 4.0, RetrievalMethod.KEYWORD),
    ]

    fused = fuse_results(semantic, keyword, k=60)

    assert len(fused) == 3
    # doc_A should have the highest RRF score because it appeared in both lists
    assert fused[0].chunk_id == "doc_A"
    assert fused[0].retrieval_method == RetrievalMethod.HYBRID
    # doc_A RRF score should be 1/(60+1) + 1/(60+1) = 2/61 ≈ 0.03278
    assert fused[0].score == pytest.approx(2 / 61, rel=1e-3)

    # doc_B and doc_C each appeared at rank 2: 1/(60+2) = 1/62 ≈ 0.0161
    assert fused[1].score == pytest.approx(1 / 62, rel=1e-3)
    assert fused[2].score == pytest.approx(1 / 62, rel=1e-3)


def test_rrf_empty_lists():
    assert fuse_results([], []) == []
    semantic = [make_chunk("doc_1", 0.9)]
    fused = fuse_results(semantic, [])
    assert len(fused) == 1
    assert fused[0].chunk_id == "doc_1"
