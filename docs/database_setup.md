# PostgreSQL and pgvector setup

The RAG repository uses SQLAlchemy 2.x async sessions with Psycopg 3, PostgreSQL JSONB, `TSVECTOR`, and pgvector. Installing the Python `pgvector` package does **not** install the PostgreSQL extension; install a pgvector package compatible with your PostgreSQL server first (for example the pgvector packages provided by your OS or managed database).

## Local setup

1. Create a PostgreSQL database, for example `createdb sales_ai` (or `CREATE DATABASE sales_ai;`).
2. Install pgvector on the PostgreSQL server and make it available to that database. The migration runs `CREATE EXTENSION IF NOT EXISTS vector`; the database role needs extension creation permission.
3. Copy `.env.example` to `.env`, set `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. An optional `DATABASE_URL` overrides these values. URLs are parsed by SQLAlchemy and are never logged.
4. Install project dependencies: `python -m pip install -e '.[dev]'`.
5. Apply migrations: `alembic upgrade head`.
6. Set `RAG_STORAGE_BACKEND=postgres`; choose `EMBEDDING_DIMENSIONS` to exactly match the embedding model. The default 768 is for Google `text-embedding-004`.
7. Seed the synthetic sample corpus (safe to rerun): `python -m scripts.rag_db seed`.
8. Verify connection, extension, tables, dimension, and sample hybrid queries: `python -m scripts.rag_db verify`.

The `seed` command embeds outside the database transaction and atomically replaces each source's chunks. Organization plus source is the document idempotency key; unchanged content updates the same record and changed content reindexes it. Repeated seed runs do not accumulate copies.

## Checks and agent workflow

`python -m scripts.rag_db verify` runs semantic and PostgreSQL full-text retrieval, then RRF and the configured reranker. Run an agent query with a tenant that has the seeded corpus using `python -m app.main "What are our sales reporting capabilities?" --org-id org_demo`. The normal Sales Intelligence and Proposal agents keep calling the existing RAG tool.

Integration tests must use a dedicated test database and `RAG_STORAGE_BACKEND=postgres`. Never point destructive test fixtures at a developer database. Unit tests and offline demos may select `RAG_STORAGE_BACKEND=memory`; production explicitly rejects that backend. Set a valid Google API key for live Google embeddings; without one, development uses deterministic mock embeddings, and those vectors are not suitable for production relevance.

HNSW cosine indexing requires a pgvector server version that supports HNSW (pgvector 0.5 or newer). The migration intentionally does not drop or rewrite existing application tables. `rag_documents` and `rag_document_chunks` are additive tables.
