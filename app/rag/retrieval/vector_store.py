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
import hashlib
from typing import Any, Protocol, runtime_checkable

from app.observability.logging import get_logger
from app.rag.ingestion.chunker import DocumentChunk
from app.rag.schemas import RetrievedChunk
from app.schemas import RetrievalMethod
from app.config.settings import get_settings

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

    async def search_keyword(self, query_text: str, limit: int = 10) -> list[RetrievedChunk]:
        tokens = [t.lower() for t in re.findall(r"\w+", query_text) if len(t) >= 2]
        results: list[tuple[float, DocumentChunk]] = []
        for chunk in self._chunks.values():
            text_lower = f"{chunk.title} {chunk.section or ''} {chunk.content}".lower()
            matched = [t for t in tokens if t in text_lower]
            if matched:
                score = len(matched) / max(len(tokens), 1)
                results.append((score, chunk))
        results.sort(key=lambda x: x[0], reverse=True)
        return [RetrievedChunk(chunk_id=c.chunk_id, document_id=c.document_id,
            document_version_id=c.document_version_id, source=c.source, title=c.title,
            section=c.section, content=c.content, score=s, retrieval_method=RetrievalMethod.KEYWORD,
            rank=i, metadata=c.metadata) for i, (s, c) in enumerate(results[:limit])]


class PostgreSQLDocumentStore:
    """Tenant-scoped SQLAlchemy repository using pgvector and PostgreSQL FTS."""

    def __init__(self, organization_id: str = "org_demo") -> None:
        self.organization_id = organization_id
        self.dimension = get_settings().rag.embedding_dimensions

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document scoped to this tenant; its chunks cascade in PostgreSQL."""
        from sqlalchemy import delete
        from app.database.models.orm_models import RagDocument
        from app.database.session import get_session_factory
        async with get_session_factory()() as session:
            async with session.begin():
                result = await session.execute(delete(RagDocument).where(
                    RagDocument.organization_id == self.organization_id,
                    (RagDocument.id == document_id) |
                    (RagDocument.meta_data["source_document_id"].astext == document_id)))
                return bool(result.rowcount)

    async def add_chunks(self, chunks: list[DocumentChunk]) -> int:
        from sqlalchemy import delete, func, select
        from sqlalchemy.dialects.postgresql import insert
        from app.database.models.orm_models import RagDocument, RagDocumentChunk
        from app.database.session import get_session_factory

        if not chunks:
            return 0
        for chunk in chunks:
            if len(chunk.embedding) != self.dimension:
                raise ValueError(f"Embedding dimension {len(chunk.embedding)} does not match configured dimension {self.dimension}")
        first = chunks[0]
        if any(c.document_id != first.document_id for c in chunks):
            raise ValueError("add_chunks accepts chunks from exactly one document")
        source = first.source
        content_hash = hashlib.sha256("\n".join(c.content for c in chunks).encode()).hexdigest()
        db_document_id = "ragdoc_" + hashlib.sha256(f"{self.organization_id}\0{source}".encode()).hexdigest()[:32]
        factory = get_session_factory()
        async with factory() as session:
            async with session.begin():
                doc_values = dict(id=db_document_id, organization_id=self.organization_id,
                    title=first.title, source=source,
                    content_type=str(first.metadata.get("doc_type", "markdown")),
                    content_hash=content_hash, meta_data={"source_document_id": first.document_id})
                stmt = insert(RagDocument).values(**doc_values).on_conflict_do_update(
                    index_elements=["organization_id", "source"],
                    set_={"title": first.title, "content_hash": content_hash,
                          "meta_data": {"source_document_id": first.document_id},
                          "updated_at": func.now()},
                ).returning(RagDocument.id)
                doc_id = await session.scalar(stmt)
                await session.execute(delete(RagDocumentChunk).where(
                    RagDocumentChunk.document_id == doc_id,
                    RagDocumentChunk.organization_id == self.organization_id))
                for chunk in chunks:
                    meta = {**chunk.metadata, "source": chunk.source, "title": chunk.title,
                            "section": chunk.section, "document_version_id": chunk.document_version_id,
                            "source_document_id": chunk.document_id, "source_chunk_id": chunk.chunk_id}
                    chunk_index = int(chunk.metadata.get("chunk_index", 0))
                    session.add(RagDocumentChunk(
                        id=f"{doc_id}_{chunk_index:04d}", document_id=doc_id, organization_id=self.organization_id,
                        chunk_index=chunk_index, content=chunk.content,
                        embedding=chunk.embedding, search_vector=func.to_tsvector("simple", f"{chunk.title} {chunk.section or ''} {chunk.content}"),
                        meta_data=meta,
                    ))
        return len(chunks)

    @staticmethod
    def _to_result(row: Any, score: float, method: RetrievalMethod, rank: int) -> RetrievedChunk:
        chunk, document = row
        meta = dict(chunk.meta_data or {})
        return RetrievedChunk(chunk_id=str(meta.get("source_chunk_id", chunk.id)), document_id=str(meta.get("source_document_id", document.id)),
            document_version_id=str(meta.get("document_version_id", "v1")),
            source=document.source, title=document.title, section=meta.get("section"),
            content=chunk.content, score=max(float(score), 0.0), retrieval_method=method,
            rank=rank, metadata=meta)

    async def search_semantic(self, query_vector: list[float], limit: int = 10,
                              min_similarity: float = 0.0) -> list[RetrievedChunk]:
        from sqlalchemy import select
        from app.database.models.orm_models import RagDocument, RagDocumentChunk
        from app.database.session import get_session_factory
        if len(query_vector) != self.dimension:
            raise ValueError(f"Query embedding dimension {len(query_vector)} does not match configured dimension {self.dimension}")
        distance = RagDocumentChunk.embedding.cosine_distance(query_vector)
        stmt = (select(RagDocumentChunk, RagDocument, distance.label("distance"))
            .join(RagDocument, RagDocument.id == RagDocumentChunk.document_id)
            .where(RagDocumentChunk.organization_id == self.organization_id)
            .order_by(distance).limit(limit))
        async with get_session_factory()() as session:
            rows = (await session.execute(stmt)).all()
        return [self._to_result((row[0], row[1]), (2.0 - float(row[2])) / 2.0, RetrievalMethod.SEMANTIC, i)
                for i, row in enumerate(rows) if (2.0 - float(row[2])) / 2.0 >= min_similarity]

    async def search_keyword(self, query_text: str, limit: int = 10) -> list[RetrievedChunk]:
        from sqlalchemy import func, select
        from app.database.models.orm_models import RagDocument, RagDocumentChunk
        from app.database.session import get_session_factory
        tsquery = func.plainto_tsquery("simple", query_text)
        rank = func.ts_rank_cd(RagDocumentChunk.search_vector, tsquery)
        stmt = (select(RagDocumentChunk, RagDocument, rank.label("rank"))
            .join(RagDocument, RagDocument.id == RagDocumentChunk.document_id)
            .where(RagDocumentChunk.organization_id == self.organization_id,
                   RagDocumentChunk.search_vector.op("@@")(tsquery))
            .order_by(rank.desc()).limit(limit))
        async with get_session_factory()() as session:
            rows = (await session.execute(stmt)).all()
        return [self._to_result((row[0], row[1]), float(row[2]), RetrievalMethod.KEYWORD, i)
                for i, row in enumerate(rows)]
