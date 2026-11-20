"""PostgreSQL RAG administration: seed sample docs and verify schema/search."""
from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

from sqlalchemy import func, select

from app.config.settings import get_settings
from app.database.models.orm_models import RagDocument, RagDocumentChunk
from app.database.session import close_engine, get_session_factory, verify_database
from app.rag.embeddings import create_embedding_service
from app.rag.ingestion.pipeline import IngestionPipeline
from app.rag.retrieval.hybrid_search import HybridSearchService
from app.rag.retrieval.vector_store import PostgreSQLDocumentStore


async def seed(directory: Path, organization_id: str) -> None:
    settings = get_settings()
    embeddings = create_embedding_service()
    store = PostgreSQLDocumentStore(organization_id)
    result = await IngestionPipeline(store=store, embedding_service=embeddings,
                                    organization_id=organization_id).ingest_directory(directory)
    failures = [r for r in result if not r.success]
    if failures:
        raise RuntimeError(f"Ingestion failed: {failures}")
    async with get_session_factory()() as session:
        docs = await session.scalar(select(func.count()).select_from(RagDocument).where(RagDocument.organization_id == organization_id))
        chunks = await session.scalar(select(func.count()).select_from(RagDocumentChunk).where(RagDocumentChunk.organization_id == organization_id))
    print(f"Seeded {len(result)} source documents for {organization_id}; database contains {docs} documents and {chunks} chunks.")


async def verify(organization_id: str) -> None:
    print(await verify_database())
    embeddings = create_embedding_service()
    store = PostgreSQLDocumentStore(organization_id)
    service = HybridSearchService(store=store, embedding_service=embeddings)
    query = "sales reporting product guide"
    vector = await embeddings.embed_query(query)
    semantic = await store.search_semantic(vector, limit=5)
    keyword = await store.search_keyword(query, limit=5)
    hybrid = await service.search(query=query, limit=5, organization_id=organization_id)
    for name, chunks in (("semantic", semantic), ("keyword", keyword), ("hybrid", hybrid)):
        print(f"{name}: {len(chunks)} evidence chunks for {query!r}")
        for chunk in chunks[:2]:
            print(f"  {chunk.chunk_id}: {chunk.title} ({chunk.source})")


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("seed", "verify"))
    parser.add_argument("--directory", type=Path, default=Path("data/sample_documents"))
    parser.add_argument("--organization-id", default="org_demo")
    args = parser.parse_args()
    try:
        await verify_database()
        if args.command == "seed":
            await seed(args.directory, args.organization_id)
        else:
            await verify(args.organization_id)
    finally:
        await close_engine()


if __name__ == "__main__":
    asyncio.run(main())
