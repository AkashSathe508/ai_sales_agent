"""
RAG system shared schemas.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.schemas import Evidence, RetrievalMethod


class ChunkMetadata(BaseModel):
    """Metadata preserved through chunking."""

    document_id: str
    document_version_id: str
    chunk_id: str
    source: str
    title: str
    section: str | None = None
    page: int | None = None
    doc_type: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)


class RetrievedChunk(BaseModel):
    """A retrieved document chunk with its retrieval metadata."""

    chunk_id: str
    document_id: str
    document_version_id: str
    source: str
    title: str
    section: str | None = None
    content: str
    score: float = Field(ge=0.0)
    retrieval_method: RetrievalMethod
    rank: int | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"use_enum_values": True}

    def to_evidence(self, relevance_score: float | None = None) -> Evidence:
        """Convert to Evidence schema for agent consumption."""
        from app.schemas import Evidence

        return Evidence(
            document_id=self.document_id,
            chunk_id=self.chunk_id,
            source=self.source,
            title=self.title,
            content=self.content,
            relevance_score=relevance_score if relevance_score is not None else self.score,
            retrieval_method=self.retrieval_method,
            metadata=self.metadata,
        )


class IngestionResult(BaseModel):
    """Result of a document ingestion run."""

    document_id: str
    document_version_id: str
    chunk_count: int
    success: bool
    errors: list[str] = Field(default_factory=list)
