"""RAG package."""
from app.rag.embeddings import MockEmbeddingService, create_embedding_service
from app.rag.ingestion.pipeline import IngestionPipeline
from app.rag.retrieval.hybrid_search import HybridSearchService
from app.rag.retrieval.vector_store import InMemoryDocumentStore
from app.rag.self_rag.evaluator import SelfRAGEvaluator
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.tools.rag.tool import RAGTool

_SHARED_STORE = InMemoryDocumentStore()
_INGESTED = False


async def get_initialized_rag_tool(sample_docs_dir: str = "data/sample_documents") -> RAGTool:
    """Returns a ready-to-use RAGTool with sample documents ingested."""
    global _INGESTED
    from app.tools.rag.tool import RAGTool

    embeddings = create_embedding_service()
    if not _INGESTED:
        pipeline = IngestionPipeline(store=_SHARED_STORE, embedding_service=embeddings)
        await pipeline.ingest_directory(sample_docs_dir)
        _INGESTED = True

    search_service = HybridSearchService(store=_SHARED_STORE, embedding_service=embeddings)
    evaluator = SelfRAGEvaluator()
    return RAGTool(hybrid_search=search_service, evaluator=evaluator)


__all__ = [
    "get_initialized_rag_tool",
    "RAGTool",
    "HybridSearchService",
    "SelfRAGEvaluator",
    "InMemoryDocumentStore",
]
