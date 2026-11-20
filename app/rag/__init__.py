"""RAG package."""
from __future__ import annotations

from typing import TYPE_CHECKING
from app.rag.embeddings import MockEmbeddingService, create_embedding_service
from app.rag.ingestion.pipeline import IngestionPipeline
from app.rag.retrieval.hybrid_search import HybridSearchService
from app.rag.retrieval.vector_store import InMemoryDocumentStore, PostgreSQLDocumentStore
from app.config.settings import get_settings
from app.rag.self_rag.evaluator import SelfRAGEvaluator

if TYPE_CHECKING:
    from app.tools.rag.tool import RAGTool

_SHARED_STORES: dict[str, InMemoryDocumentStore] = {}
_INGESTED: set[str] = set()


async def get_initialized_rag_tool(sample_docs_dir: str = "data/sample_documents", organization_id: str | None = None) -> RAGTool:
    """Returns a ready-to-use RAGTool with sample documents ingested."""
    from app.observability.logging import current_organization_id
    from app.tools.rag.tool import RAGTool
    settings = get_settings()
    organization_id = organization_id or current_organization_id()
    embeddings = create_embedding_service()
    if settings.rag.storage_backend == "postgres":
        if settings.is_production and not settings.llm.google_api_key:
            raise RuntimeError("Production PostgreSQL RAG requires a configured embedding provider")
        store = PostgreSQLDocumentStore(organization_id)
        if not settings.is_production and organization_id not in _INGESTED:
            pipeline = IngestionPipeline(store=store, embedding_service=embeddings, organization_id=organization_id)
            results = await pipeline.ingest_directory(sample_docs_dir)
            failures = [r for r in results if not r.success]
            if failures:
                raise RuntimeError(f"Sample RAG ingestion failed: {failures[0].errors}")
            _INGESTED.add(organization_id)
    else:
        if settings.is_production:
            raise RuntimeError("RAG_STORAGE_BACKEND=memory is not allowed in production")
        store = _SHARED_STORES.setdefault(organization_id, InMemoryDocumentStore())
        if organization_id not in _INGESTED:
            pipeline = IngestionPipeline(store=store, embedding_service=embeddings, organization_id=organization_id)
            await pipeline.ingest_directory(sample_docs_dir)
            _INGESTED.add(organization_id)

    search_service = HybridSearchService(store=store, embedding_service=embeddings)
    evaluator = SelfRAGEvaluator()
    return RAGTool(hybrid_search=search_service, evaluator=evaluator)


__all__ = [
    "get_initialized_rag_tool",
    "HybridSearchService",
    "SelfRAGEvaluator",
    "InMemoryDocumentStore",
]

