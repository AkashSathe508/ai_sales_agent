"""Add tenant scoped PostgreSQL + pgvector RAG storage."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from pgvector.sqlalchemy import Vector
from app.config.settings import get_settings

revision = "0001_rag_pgvector"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    dim = get_settings().rag.embedding_dimensions
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table("rag_documents",
        sa.Column("id", sa.String(128), primary_key=True),
        sa.Column("organization_id", sa.String(128), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("source", sa.String(1024), nullable=False),
        sa.Column("content_type", sa.String(128), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("metadata", JSONB(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("uq_rag_document_org_source", "rag_documents", ["organization_id", "source"], unique=True)
    op.create_table("rag_document_chunks",
        sa.Column("id", sa.String(256), primary_key=True),
        sa.Column("document_id", sa.String(128), sa.ForeignKey("rag_documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("organization_id", sa.String(128), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(dim), nullable=False),
        sa.Column("search_vector", TSVECTOR(), nullable=False),
        sa.Column("metadata", JSONB(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("uq_rag_chunk_document_index", "rag_document_chunks", ["document_id", "chunk_index"], unique=True)
    op.create_index("ix_rag_chunk_org_doc", "rag_document_chunks", ["organization_id", "document_id"])
    op.create_index("ix_rag_chunk_search_vector", "rag_document_chunks", ["search_vector"], postgresql_using="gin")
    op.execute(f"CREATE INDEX ix_rag_chunk_embedding_cosine ON rag_document_chunks USING hnsw (embedding vector_cosine_ops)")
    op.execute("""
      CREATE FUNCTION rag_chunks_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('simple', coalesce(NEW.metadata->>'title','') || ' ' || coalesce(NEW.metadata->>'section','') || ' ' || NEW.content);
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql
    """)
    op.execute("CREATE TRIGGER trg_rag_chunks_search_vector BEFORE INSERT OR UPDATE OF content, metadata ON rag_document_chunks FOR EACH ROW EXECUTE FUNCTION rag_chunks_search_vector_update()")

def downgrade():
    op.execute("DROP TRIGGER IF EXISTS trg_rag_chunks_search_vector ON rag_document_chunks")
    op.execute("DROP FUNCTION IF EXISTS rag_chunks_search_vector_update()")
    op.drop_table("rag_document_chunks")
    op.drop_table("rag_documents")
