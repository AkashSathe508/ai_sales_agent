"""
RAG Ingestion Pipeline.

Coordinates:
Document Loader → Chunker → Embeddings → Store
"""
from __future__ import annotations

import os
from pathlib import Path

from app.observability.logging import get_logger
from app.rag.embeddings import EmbeddingServiceProtocol, create_embedding_service
from app.rag.ingestion.chunker import MarkdownSectionChunker
from app.rag.ingestion.loader import DocumentLoader, LoadedDocument
from app.rag.retrieval.vector_store import DocumentStoreProtocol, InMemoryDocumentStore
from app.rag.schemas import IngestionResult

logger = get_logger(__name__)


class IngestionPipeline:
    """Ingests documents into chunk storage with embeddings."""

    def __init__(
        self,
        store: DocumentStoreProtocol | None = None,
        embedding_service: EmbeddingServiceProtocol | None = None,
        chunker: MarkdownSectionChunker | None = None,
    ) -> None:
        self._store = store or InMemoryDocumentStore()
        self._embeddings = embedding_service or create_embedding_service()
        self._chunker = chunker or MarkdownSectionChunker()

    async def ingest_document(
        self,
        doc: LoadedDocument,
        version_id: str = "v1",
    ) -> IngestionResult:
        """Chunk, embed, and store a single document."""
        try:
            chunks = self._chunker.chunk_document(
                document_id=doc.document_id,
                document_version_id=version_id,
                source=doc.source,
                title=doc.title,
                text=doc.content,
                base_metadata=doc.metadata,
            )

            if not chunks:
                return IngestionResult(
                    document_id=doc.document_id,
                    document_version_id=version_id,
                    chunk_count=0,
                    success=True,
                )

            # Generate embeddings in batch
            texts = [c.content for c in chunks]
            embeddings = await self._embeddings.embed_documents(texts)
            for chunk, emb in zip(chunks, embeddings):
                chunk.embedding = emb

            # Store chunks
            await self._store.add_chunks(chunks)
            logger.info(
                "Document ingested successfully",
                document_id=doc.document_id,
                chunk_count=len(chunks),
            )
            return IngestionResult(
                document_id=doc.document_id,
                document_version_id=version_id,
                chunk_count=len(chunks),
                success=True,
            )

        except Exception as exc:
            logger.error("Failed to ingest document", document_id=doc.document_id, error=str(exc))
            return IngestionResult(
                document_id=doc.document_id,
                document_version_id=version_id,
                chunk_count=0,
                success=False,
                errors=[str(exc)],
            )

    async def ingest_directory(
        self,
        directory_path: str | Path,
        version_id: str = "v1",
    ) -> list[IngestionResult]:
        """Load and ingest all documents from a directory."""
        docs = DocumentLoader.load_directory(directory_path)
        results = []
        for doc in docs:
            res = await self.ingest_document(doc, version_id=version_id)
            results.append(res)
        return results
