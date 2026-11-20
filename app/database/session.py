"""
SQLAlchemy 2.x async session factory.

Agents NEVER access this directly.
Only repositories access the database session.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config.settings import get_settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine():
    """Return (or create) the shared async engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database.sqlalchemy_url,
            pool_size=settings.database.pool_size,
            max_overflow=settings.database.max_overflow,
            echo=settings.database.echo,
            future=True,
        )
        logger.info("Database engine created", driver="psycopg")
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return (or create) the shared session factory."""
    global _session_factory
    if _session_factory is None:
        engine = get_engine()
        _session_factory = async_sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
    return _session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async context manager / dependency that provides a database session.

    Usage in repositories:
        async with get_db_session() as session:
            ...
    """
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def close_engine() -> None:
    """Dispose the engine on application shutdown."""
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        logger.info("Database engine disposed")
        _session_factory = None


async def verify_database() -> dict[str, object]:
    """Check connectivity, pgvector, RAG tables and configured vector dimension."""
    from app.config.settings import get_settings
    from app.database.models.orm_models import RagDocumentChunk

    engine = get_engine()
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
            extension = await connection.scalar(text("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='vector')"))
            tables = await connection.scalar(text("SELECT to_regclass('public.rag_documents') IS NOT NULL AND to_regclass('public.rag_document_chunks') IS NOT NULL"))
            dimension = RagDocumentChunk.__table__.c.embedding.type.dim
            expected = get_settings().rag.embedding_dimensions
            if dimension != expected:
                raise RuntimeError(f"pgvector model dimension {dimension} does not match EMBEDDING_DIMENSIONS={expected}")
            if not extension:
                raise RuntimeError("PostgreSQL extension 'vector' is unavailable; install pgvector and apply migrations")
            if not tables:
                raise RuntimeError("RAG tables are missing; apply Alembic migrations")
            actual_type = await connection.scalar(text("""SELECT format_type(a.atttypid, a.atttypmod)
                FROM pg_attribute a WHERE a.attrelid='public.rag_document_chunks'::regclass
                AND a.attname='embedding' AND NOT a.attisdropped"""))
            if actual_type != f"vector({expected})":
                raise RuntimeError(f"Database embedding column is {actual_type}; expected vector({expected}). Update EMBEDDING_DIMENSIONS and migrate a fresh compatible schema.")
            return {"connected": True, "vector_extension": bool(extension), "tables_exist": bool(tables), "embedding_dimensions": dimension}
    except Exception as exc:
        logger.error("Database verification failed", error_type=type(exc).__name__)
        if isinstance(exc, RuntimeError):
            raise
        raise RuntimeError(f"PostgreSQL verification failed ({type(exc).__name__}); check PostgreSQL availability and credentials in the environment.") from exc
