# RAG architecture

```text
Documents → Loader → Existing Markdown Chunker → Embedding Service
  → PostgreSQL rag_documents / rag_document_chunks
  → pgvector cosine search + PostgreSQL FTS (GIN/TSVECTOR)
  → Reciprocal Rank Fusion (k=60) → SimpleReranker → Self-RAG → Evidence
  → Existing RAG tool → Sales Intelligence / Proposal agents
```

Repository and database access stay behind the existing RAG service/tool boundary. PostgreSQL retrieval filters every search by organization. Evidence retains source, title, document ID, and stable chunk ID. The in-memory implementation exists for offline tests and demos only; production requires PostgreSQL. The deterministic mock embedder and `SimpleReranker` are development approximations. Self-RAG's deterministic fallback checks evidence availability and query term coverage, and cannot prove factual correctness. Live structured LLM evidence evaluation remains replaceable behind its current service abstraction.

The PostgreSQL FTS configuration uses `simple` tokenization to preserve product names, identifiers, and domain terms. Search vectors are maintained by a database trigger. Semantic cosine distance is converted to a normalized 0–1 similarity score (`1 - distance / 2`); FTS scores are PostgreSQL `ts_rank_cd` values. RRF uses ranks only and never mixes those raw scores.
