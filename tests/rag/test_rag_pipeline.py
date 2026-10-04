"""
Tests for RAG Ingestion, Hybrid Search, Reranker, and Self-RAG.
"""
import pytest

from app.rag import get_initialized_rag_tool
from app.rag.ingestion.chunker import MarkdownSectionChunker
from app.rag.retrieval.reranker import SimpleReranker
from app.rag.schemas import RetrievedChunk
from app.schemas import EvidenceAction, RetrievalMethod


def test_chunker_preserves_metadata_and_sections():
    chunker = MarkdownSectionChunker(max_chunk_size=200)
    text = """# Pricing Overview

Our pricing is flexible and scales with your business.

## Enterprise Tier

Enterprise includes dedicated support, custom SLAs, and custom integrations.
"""
    chunks = chunker.chunk_document(
        document_id="doc_test",
        document_version_id="v1",
        source="pricing.md",
        title="Pricing Guide",
        text=text,
    )

    assert len(chunks) >= 2
    assert all(c.document_id == "doc_test" for c in chunks)
    assert any("Enterprise" in (c.section or "") for c in chunks)


@pytest.mark.asyncio
async def test_simple_reranker():
    reranker = SimpleReranker()
    doc1 = RetrievedChunk(
        chunk_id="c1",
        document_id="d1",
        document_version_id="v1",
        source="src",
        title="CRM Integration",
        content="General discussion of database systems.",
        score=0.03,
        retrieval_method=RetrievalMethod.HYBRID,
    )
    doc2 = RetrievedChunk(
        chunk_id="c2",
        document_id="d2",
        document_version_id="v1",
        source="src",
        title="Sales Reporting Guide",
        content="Automates weekly sales reporting, reducing rep time by 5 hours.",
        score=0.02,
        retrieval_method=RetrievalMethod.HYBRID,
    )

    reranked = await reranker.rerank("automated sales reporting", [doc1, doc2])
    # doc2 has exact term matches and should be boosted
    assert reranked[0].chunk_id == "c2"


@pytest.mark.asyncio
async def test_end_to_end_rag_tool():
    tool = await get_initialized_rag_tool()
    res = await tool.search("sales reporting product guide", limit=3)
    assert res.success is True
    data = res.data
    assert len(data["evidence"]) > 0
    # Every chunk has valid evidence_id
    assert all(ev.evidence_id.startswith("ev_") for ev in data["evidence"])
    assert data["evaluation"] is not None
