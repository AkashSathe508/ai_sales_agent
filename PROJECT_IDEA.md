# AI Sales Intelligence & Proposal Automation Platform

> A production-oriented, multi-agent AI system that automates lead qualification, sales intelligence analysis, and enterprise proposal generation using LangGraph, LiteLLM (Gemini), RAG, and MCP.

---

# 1. Project Overview

## What It Is

The **AI Sales Intelligence & Proposal Automation Platform** is a backend multi-agent AI system that takes a natural language sales request as input and autonomously routes it through a specialized agent pipeline to produce one of three outputs:

1. **Lead Qualification Report** — structured assessment of a CRM lead's readiness to buy
2. **Sales Intelligence Analysis** — evidence-grounded insights combining CRM data and document retrieval
3. **Enterprise Proposal** — fully validated proposal with verified pricing, deterministic ROI, and an optional PPTX presentation deck

## What Problem It Solves

Sales teams spend enormous time on manual, repetitive work:
- Reviewing CRM records and qualifying leads one-by-one
- Gathering competitive and product intelligence from scattered documents
- Writing proposals from scratch while manually calculating ROI and pricing

These tasks are time-consuming, error-prone, and inconsistent across reps. Existing CRM platforms do not generate proposals or perform deep intelligence synthesis.

## Why It Matters

The system introduces a strict **tool-first, data-verified** design philosophy: no pricing figure, ROI number, or customer fact is invented by the LLM. Every claim is either retrieved from a validated tool (CRM, Pricing Catalog) or grounded in a retrieved document with a traceable evidence ID. This makes AI-generated outputs suitable for real customer-facing use.

## Target Users

- Sales representatives preparing proposals and qualifying pipelines
- Sales managers reviewing intelligence summaries
- Revenue operations teams automating repetitive sales workflows

## Main Objective

Produce a fully testable, production-oriented agent layer that can be consumed by a FastAPI backend or any other interface, with complete observability, guardrails, typed data models, and human-in-the-loop approval gates.

---

# 2. Problem Statement

## Current Challenges

| Challenge | Impact |
|-----------|--------|
| Manual proposal creation | 4–8 hours per proposal, inconsistent quality |
| Spreadsheet-based ROI modeling | Calculation errors, no audit trail |
| Fragmented intelligence gathering | Reps consult 5+ tools to understand a prospect |
| Pricing inconsistency | Reps use outdated or incorrectly discounted prices |
| No evidence traceability | Claims in proposals cannot be audited back to sources |
| LLM hallucination risk | Standard LLM chatbots invent numbers, pricing, and facts |

## Limitations of Existing Approaches

- **Standard CRM tools** (Salesforce, HubSpot) do not generate proposals or run intelligence synthesis
- **Generic LLM chatbots** (ChatGPT, Gemini) hallucinate specific numbers including pricing and ROI
- **Template-based proposal tools** produce static documents with no dynamic personalization

## Why the Problem Is Difficult

- Proposal accuracy requires cross-system data integration (CRM + Pricing + Documents)
- ROI calculations must be deterministic, not probabilistic
- Multi-agent orchestration must prevent agents from bypassing tool constraints
- Human approval must be enforced before customer-facing documents are dispatched

## What This Project Addresses

- Strict tool-enforced data retrieval — no LLM-generated numbers
- Hybrid RAG with evidence citations for every document-based claim
- Human-in-the-loop approval checkpoint before presentation generation
- Fully typed Pydantic models flowing through the entire graph state

---

# 3. Proposed Solution

## System Summary

The system accepts a natural language query (e.g., *"Analyze LEAD-001 and prepare a proposal for improving their sales reporting"*), routes it through input guardrails, classifies intent via a Supervisor agent, delegates to a specialized agent, and returns a structured, validated result.

## Main Components

| Component | Role |
|-----------|------|
| **Input Guardrails** | Validate user input, detect prompt injection |
| **Supervisor Agent** | Classify intent and route to the correct specialist |
| **Qualification Agent** | Score and assess a CRM lead |
| **Intelligence Agent** | Produce CRM + RAG grounded insights |
| **Proposal Agent** | Generate a validated proposal with verified data |
| **RAG Pipeline** | Retrieve, fuse, and evaluate document evidence |
| **CRM Tool** | Read leads, customers, deals, interactions |
| **Pricing Tool** | Retrieve authorized prices from a catalog |
| **ROI Tool** | Deterministically calculate investment return metrics |
| **Presentation Tool** | Generate a PPTX slide deck via MCP adapter |
| **Approval Checkpoint** | Pause graph for human review before dispatch |
| **Output Guardrails** | Format and validate the final structured response |

## What Makes It Different

- **No hallucinated numbers**: Pricing and ROI are computed by Python tools, not LLMs
- **Full evidence traceability**: Every document claim has an `evidence_id` traceable to a source chunk
- **Self-RAG quality gate**: Retrieved evidence is evaluated for sufficiency before use
- **Protocol-based tool layer**: All tools implement strict Protocols, enabling mock substitution for testing
- **Offline-capable**: System operates fully deterministically without an LLM API key — useful for CI/CD and demos

---

# 4. Core Features

### 4.1 Intent Classification & Routing

- **Purpose**: Route natural language queries to the correct specialist agent
- **How it works**: The Supervisor Agent uses LLM structured output to classify the intent as `qualification`, `intelligence`, or `proposal`
- **Input**: Free-text user query
- **Output**: `SupervisorDecision` — intent, reason, confidence, sub-intents
- **Consideration**: Intent is determined once; agents never re-route each other

### 4.2 Lead Qualification

- **Purpose**: Assess a CRM lead's readiness using verified data only
- **How it works**: CRM Tool retrieves the lead + interaction history → LLM synthesizes qualification assessment
- **Input**: `lead_id`, `organization_id`, optional user guidance
- **Output**: `QualificationResult` — score, risks, missing information, recommendation
- **Consideration**: Missing CRM fields are recorded explicitly in `missing_information`, never invented

### 4.3 Sales Intelligence Analysis

- **Purpose**: Produce structured insights combining CRM facts and RAG-retrieved evidence
- **How it works**: Parallel CRM retrieval + RAG search → LLM synthesizes classified insights
- **Input**: Natural language query, optional `lead_id` or `customer_id`
- **Output**: `IntelligenceResult` — insights with `source_type` (CRM / Document / Derived), evidence citations
- **Consideration**: All document-derived insights must reference valid `evidence_id` values

### 4.4 Proposal Generation

- **Purpose**: Create a fully validated enterprise proposal
- **How it works**: CRM → RAG → Pricing → ROI → Proposal construction → Pydantic validation
- **Input**: Query, `lead_id`, `organization_id`, requested seat count
- **Output**: `Proposal` — executive summary, solution components, implementation plan, ROI, pricing, evidence
- **Consideration**: Pricing and ROI values are tool-derived and overwrite any LLM-generated values post-construction

### 4.5 Hybrid RAG Retrieval

- **Purpose**: Retrieve the most relevant document chunks to ground agent reasoning
- **How it works**: Parallel semantic (cosine) + keyword (BM25-like) search → RRF fusion → SimpleReranker
- **Input**: Free-text search query
- **Output**: Ranked `RetrievedChunk` list with scores, source, title, section, content
- **Consideration**: Chunks appearing in both semantic and keyword results are boosted by RRF

### 4.6 Self-RAG Evidence Evaluation

- **Purpose**: Quality gate to prevent hallucination from insufficient evidence
- **How it works**: Evaluator LLM assesses retrieved chunks for relevance and sufficiency
- **Input**: Query + retrieved chunks
- **Output**: `EvidenceEvaluation` — recommended action (`ACCEPT`, `RETRIEVE_MORE`, `INSUFFICIENT_EVIDENCE`)
- **Consideration**: Has a deterministic fallback mode for offline operation

### 4.7 Deterministic ROI Calculation

- **Purpose**: Produce auditable, formula-based ROI metrics
- **How it works**: Python calculator with documented formulas, no LLM involvement
- **Input**: Current cost, implementation cost, expected savings %, time period, ongoing cost
- **Output**: `ROIResult` — annual savings, ROI %, payback period, 3-year and 5-year benefit, formula audit trail
- **Consideration**: All formulas are stored in `ROIResult.formulas` for auditability

### 4.8 Pricing Catalog Retrieval

- **Purpose**: Enforce that only authorized prices appear in proposals
- **How it works**: Tool fetches from `MockPricingRepository` (or PostgreSQL catalog in production)
- **Input**: `product_id`, `quantity`, `organization_id`
- **Output**: `PricingResult` — validated unit price, quantity, discount, total, currency, version
- **Consideration**: LLMs are completely excluded from price generation

### 4.9 Presentation Generation via MCP

- **Purpose**: Automatically produce a PPTX slide deck from an approved proposal
- **How it works**: `PresentationTool` calls the `MCPGateway`, which dispatches to an allowlisted adapter
- **Input**: `Proposal` object
- **Output**: `PresentationResult` — file path, slide count, status
- **Consideration**: Only runs after proposal passes the human approval checkpoint

### 4.10 Human Approval Checkpoint

- **Purpose**: Enforce human review before customer-facing outputs are dispatched
- **How it works**: LangGraph conditional edge checks `ApprovalState.status`; if pending, routes to output guardrails instead of presentation
- **Input**: `ApprovalState` in graph state
- **Output**: Route decision — `approved` (→ presentation) or `pending` (→ output guardrails)
- **Consideration**: `auto_approve=True` flag bypasses checkpoint for demos and automated pipelines

### 4.11 Input & Output Guardrails

- **Purpose**: Protect the system from invalid input, injection attacks, and malformed outputs
- **Input Guardrails**: Query length limits, entity ID format validation, organization context validation
- **Injection Defense**: Regex pattern matching for prompt injection signatures; untrusted document text is XML-wrapped before being sent to LLM
- **Output Guardrails**: Assemble the human-readable final response from validated state

---

# 5. System Architecture

```
┌─────────────────────────────────────────────┐
│               User / CLI / API               │
│          (natural language query)            │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   Input Guardrails    │
        │   (LangGraph Node)    │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │   Supervisor Agent    │
        │   (LangGraph Node)    │
        └─────┬─────┬─────┬────┘
              │     │     │
   ┌──────────▼┐  ┌─▼──────────┐  ┌──────────▼──┐
   │Qualification│  │Intelligence│  │  Proposal   │
   │   Agent    │  │   Agent    │  │   Agent     │
   └──────┬─────┘  └─────┬──────┘  └──────┬──────┘
          │              │                │
          │         ┌────┴───┐     ┌──────▼──────────────┐
          │         │  RAG   │     │ CRM + RAG + Pricing  │
          │         │ Tool   │     │ + ROI Tools          │
          │         └────────┘     └──────┬───────────────┘
          │                               │
          │               ┌───────────────▼──────────┐
          │               │  Approval Checkpoint     │
          │               └──────┬──────────┬────────┘
          │                      │          │
          │              [approved]    [pending]
          │                      │          │
          │          ┌───────────▼──┐       │
          │          │ Presentation │       │
          │          │ Tool (MCP)   │       │
          │          └───────┬──────┘       │
          │                  │              │
        ┌─▼──────────────────▼──────────────▼─┐
        │         Output Guardrails            │
        └─────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │    Structured Result  │
        │    (AgentState dict)  │
        └───────────────────────┘
```

## Architectural Components

| Component | Implementation | Description |
|-----------|----------------|-------------|
| **LangGraph StateGraph** | `app/graph/workflow.py` | Orchestrates all nodes and edges with typed `AgentState` |
| **MemorySaver** | LangGraph built-in | Per-thread conversation memory via checkpointer |
| **Agent Layer** | `app/agents/` | Four specialized agents with strict tool access |
| **Tool Layer** | `app/tools/` | CRM, Pricing, ROI, RAG, Presentation tools with Protocol interfaces |
| **Service Layer** | `app/services/` | Business logic between tools and repositories |
| **Repository Layer** | `app/database/repositories/` | Data access — currently Mock adapters, PostgreSQL ORM defined |
| **RAG Pipeline** | `app/rag/` | Ingestion, hybrid search, RRF, reranking, self-RAG evaluation |
| **MCP Gateway** | `app/mcp/` | Secure, allowlisted gateway to external MCP tool adapters |
| **LLM Service** | `app/llm/service.py` | Single LiteLLM abstraction for all agents |
| **Guardrails** | `app/guardrails/` | Input validation, injection defense, output assembly, tool permissions |
| **Observability** | `app/observability/` | Structlog, Prometheus metrics, OpenTelemetry tracing, correlation IDs |
| **Configuration** | `app/config/settings.py` | Pydantic Settings — all configuration from environment variables |

---

# 6. Detailed Workflow

## Standard Proposal Workflow (Most Complex Path)

1. **User provides input** — natural language query with optional `lead_id`, `organization_id`
2. **Input Guardrails** — validate query length, entity ID formats, detect prompt injection; auto-extract IDs from query text using regex
3. **Supervisor Agent** — LLM classifies intent as `proposal`; produces `SupervisorDecision` with confidence score
4. **Conditional Routing** — LangGraph routes to `proposal` node based on intent
5. **Proposal Agent — CRM retrieval** — `CRMTool.get_full_lead_context()` returns lead + deal + interactions; result validated into `CRMData` model
6. **Proposal Agent — RAG retrieval** — `RAGTool.search()` runs hybrid search; returns `Evidence` list with relevance scores and source citations
7. **Proposal Agent — Pricing retrieval** — `PricingTool.get_price()` fetches from catalog for each product SKU; returns validated `PricingResult`
8. **Proposal Agent — ROI calculation** — `ROITool.calculate_roi()` runs deterministic Python calculation; returns `ROIResult` with explicit formulas
9. **Proposal Agent — Proposal construction** — assembles `Proposal` Pydantic model from all tool outputs; LLM generates prose if API key is configured
10. **Approval Checkpoint node** — logs checkpoint; conditional edge checks `ApprovalState.status`
11. **If approved** → `Presentation Tool` calls `MCPGateway` to generate PPTX from `Proposal` object
12. **Output Guardrails** — assemble human-readable `final_response` from validated state fields
13. **Return structured `AgentState`** — all typed outputs available to caller

## Qualification Workflow

1. Input Guardrails → Supervisor (intent: `qualification`) → Qualification Agent
2. CRM Tool retrieves full lead context → LLM synthesizes `QualificationResult`
3. Post-validation: missing CRM fields explicitly recorded; no invented values allowed
4. Output Guardrails → Return

## Intelligence Workflow

1. Input Guardrails → Supervisor (intent: `intelligence`) → Intelligence Agent
2. Parallel: CRM Tool retrieves lead facts + RAG Tool retrieves document evidence
3. LLM synthesizes `IntelligenceResult` with classified insights and evidence references
4. Post-validation: document insight evidence IDs verified against actual retrieved chunks
5. Output Guardrails → Return

---

# 7. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| CLI | Click + Rich | Human-readable CLI entry point with formatted output |
| Agent Orchestration | LangGraph 0.2+ | Stateful multi-agent graph with conditional edges and checkpoints |
| LLM Abstraction | LiteLLM 1.44+ | Provider-agnostic LLM calls with retries, fallbacks, and timeout |
| Primary LLM | Google Gemini 1.5 Pro | Structured output generation via `response_format: json_object` |
| Fallback LLM | Google Gemini 1.5 Flash | Automatic fallback on rate limit or primary model failure |
| Embeddings | Google `text-embedding-004` (768d) | Document and query embedding for semantic search |
| Data Validation | Pydantic v2 | All agent inputs, outputs, and tool results typed and validated |
| Configuration | Pydantic Settings | Environment-variable-driven configuration with `.env` support |
| Database ORM | SQLAlchemy 2.0 async | ORM models for all entities; async sessions via asyncpg |
| Vector DB (planned) | PostgreSQL + pgvector | Cosine similarity search on 768-dim embeddings |
| Keyword Search (planned) | PostgreSQL FTS (TSVECTOR) | BM25-style lexical search; currently in-memory BM25-like scoring |
| Current Vector Store | `InMemoryDocumentStore` | Fully functional in-memory semantic + keyword store (no DB required) |
| Database Migrations | Alembic | Schema migration management for production |
| Document Parsing | Markdown + text loaders | Load product guides, case studies, pricing sheets |
| Presentation Gen | python-pptx | PPTX slide deck generation from proposal data |
| Logging | structlog + stdlib | JSON-structured logs with correlation IDs per request |
| Metrics | Prometheus Client | LLM call counts, latency histograms, tool call metrics |
| Tracing (planned) | OpenTelemetry | Distributed trace export (toggle via `OTEL_ENABLED`) |
| LangSmith (optional) | LangSmith | LangChain trace visualization (toggle via `LANGCHAIN_TRACING_V2`) |
| HTTP Client | httpx | Async HTTP for external API calls |
| Testing | pytest + pytest-asyncio | Async test suite; 29 tests covering all layers |
| Code Quality | ruff + black + mypy | Linting, formatting, type checking |
| Python Version | Python >= 3.12 | Required for `match` statements, `TypedDict`, `from __future__ import annotations` |

---

# 8. AI / Agent Architecture

## 8.1 Supervisor Agent

| Property | Detail |
|----------|--------|
| **File** | `app/agents/supervisor/agent.py` |
| **Responsibility** | Classify intent and determine routing decision |
| **Input** | User query, optional `lead_id` context |
| **Output** | `SupervisorDecision` — intent, reason, confidence, sub-intents |
| **Tools** | None — reads only the user query |
| **LLM** | `structured_generate()` → `SupervisorDecision` Pydantic model |
| **Decision logic** | Keyword and semantic reasoning over query; falls back to `proposal` if uncertain |
| **Communicates with** | LangGraph routing (conditional edges based on intent value) |

## 8.2 Qualification Agent

| Property | Detail |
|----------|--------|
| **File** | `app/agents/qualification/agent.py` |
| **Responsibility** | Score a CRM lead's readiness based strictly on verified CRM data |
| **Input** | `lead_id`, `organization_id`, `user_query` |
| **Output** | `QualificationResult` — summary, pain points, budget, timeline, risks, missing info, recommendation |
| **Tools** | `CRMTool.get_full_lead_context()` only |
| **LLM** | `structured_generate()` → `QualificationResult` |
| **Critical constraint** | Missing CRM fields must appear in `missing_information`; no invention allowed |
| **Post-validation** | Agent code programmatically enforces grounding after LLM output |
| **Dependencies** | CRMTool → CRMService → MockCRMAdapter |

## 8.3 Sales Intelligence Agent

| Property | Detail |
|----------|--------|
| **File** | `app/agents/intelligence/agent.py` |
| **Responsibility** | Synthesize CRM + RAG evidence into strategic insights |
| **Input** | Query, optional `lead_id` / `customer_id`, `organization_id` |
| **Output** | `IntelligenceResult` — insights classified by `SourceType`, CRM facts, document facts, recommended actions |
| **Tools** | `CRMTool.get_full_lead_context()`, `RAGTool.search()` |
| **LLM** | `structured_generate()` → `IntelligenceResult` (offline: deterministic fallback) |
| **Post-validation** | Evidence IDs in insights are verified against actual retrieved chunk IDs |
| **Dependencies** | CRMTool, RAGTool (optional) |

## 8.4 Proposal Agent

| Property | Detail |
|----------|--------|
| **File** | `app/agents/proposal/agent.py` |
| **Responsibility** | Generate a fully validated enterprise proposal |
| **Input** | Query, `lead_id`, `customer_id`, `organization_id`, `requested_seats` |
| **Output** | `Proposal` — all fields verified by tools |
| **Tools** | `CRMTool`, `RAGTool`, `PricingTool` x2 products, `ROITool` |
| **LLM** | `structured_generate()` for prose (summary, problem, solution); overrides with tool values afterward |
| **Pricing enforcement** | `proposal.pricing` and `proposal.total_investment` are always overwritten with tool results |
| **ROI enforcement** | `proposal.roi` is always the deterministic `ROIResult`, never LLM-generated |
| **Approval** | Produces `ApprovalState.status = PENDING`; `auto_approve=True` overrides for demos |

## 8.5 Agent Communication

All agents communicate exclusively through the **LangGraph `AgentState` TypedDict**. No agent calls another agent directly. Communication happens through shared typed state fields that persist across nodes.

```
Supervisor     → {intent, supervisor_decision}          → LangGraph routing
Proposal Agent → {proposal, roi_result, pricing_result} → Approval Checkpoint
Approval Node  → {approval_state.status}                → Presentation or Output Guardrails
```

## 8.6 Orchestration

- **Framework**: LangGraph `StateGraph` compiled with `MemorySaver` checkpointer
- **Thread isolation**: Each invocation takes a `thread_id`; state is isolated per thread
- **Error propagation**: Exceptions in nodes are caught at the top-level `run_agent_workflow()` and recorded in `state["errors"]`
- **Human-in-the-loop**: The approval checkpoint is a conditional routing node; future enhancement is to use LangGraph `interrupt_before` for true async human approval

---

# 9. RAG Architecture

## Pipeline

```
Source Documents (Markdown, text files)
        |
        v
  Document Loader
  (app/rag/ingestion/loader.py)
  [Reads .md and .txt files from directory]
        |
        v
  Document Chunker
  (app/rag/ingestion/chunker.py)
  [512-token chunks, 64-token overlap, section-aware]
        |
        v
  Embedding Service
  (app/rag/embeddings.py)
  [Google text-embedding-004 -> 768-dim vectors]
  [MockEmbeddingService in offline/test mode]
        |
        v
  Document Store
  [InMemoryDocumentStore (current) / PostgreSQL+pgvector (planned)]
        |
    +---+-----------------------------+
    |                                 |
    v                                 v
Semantic Search                  Keyword Search
(cosine similarity on             (BM25-like TF scoring
 embedding vectors)                with title boost)
    |                                 |
    +-------------+-------------------+
                  |
                  v
        Reciprocal Rank Fusion (RRF)
        (app/rag/retrieval/rrf.py)
        [score = sum(weight / (k + rank))]
        [k = 60, default equal weights]
                  |
                  v
        SimpleReranker
        (app/rag/retrieval/reranker.py)
        [Term coverage + phrase bonus + header alignment]
                  |
                  v
        Self-RAG Evaluator (Quality Gate)
        (app/rag/self_rag/evaluator.py)
        [ACCEPT / RETRIEVE_MORE / INSUFFICIENT_EVIDENCE]
                  |
                  v
        Evidence List (RetrievedChunk -> Evidence)
        [Each with evidence_id, source, title, score]
                  |
                  v
        Agent Reasoning
        [Evidence injected into LLM prompt as grounded context]
```

## RAG Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `RAG_CHUNK_SIZE` | 512 tokens | Maximum tokens per chunk |
| `RAG_CHUNK_OVERLAP` | 64 tokens | Overlap between adjacent chunks |
| `RAG_TOP_K` | 10 | Candidates fetched from each retrieval method |
| `RAG_RERANK_TOP_K` | 5 | Final chunks returned after reranking |
| `RAG_RRF_K` | 60 | RRF hyperparameter |
| `EMBEDDING_MODEL` | `models/text-embedding-004` | Google embedding model |
| `EMBEDDING_DIMENSIONS` | 768 | Vector dimensions |

## Evidence Traceability

Every chunk returned carries:
- `evidence_id` — unique ID traceable through the entire response
- `document_id` + `document_version_id` — document lineage
- `source` — file path or URL
- `chunk_id` — specific chunk within the document
- `retrieval_method` — `semantic`, `keyword`, or `hybrid`
- `score` — RRF or reranker score

## Retrieval Failure Handling

- Empty retrieval → `SelfRAGEvaluator` returns `INSUFFICIENT_EVIDENCE`; agents proceed with empty evidence list
- Embedding failure → `EmbeddingError` raised; RAG disabled gracefully; agent continues without document evidence

---

# 10. Database Design

## ORM Models (SQLAlchemy, PostgreSQL)

### CRM Entities

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `organizations` | `id`, `name`, `domain`, `settings` | Multi-tenant root entity |
| `users` | `id`, `organization_id`, `email`, `role` | Sales rep / manager users |
| `leads` | `id`, `organization_id`, `company_name`, `industry`, `pain_points`, `status`, `score` | Prospect leads |
| `customers` | `id`, `organization_id`, `company_name`, `contract_value`, `products` | Converted customers |
| `contacts` | `id`, `lead_id`, `customer_id`, `name`, `email`, `title` | Named contacts |
| `deals` | `id`, `organization_id`, `stage`, `value`, `probability`, `close_date` | Active deals |
| `interactions` | `id`, `lead_id`, `type`, `subject`, `notes`, `occurred_at` | Call/email/meeting history |

### Documents & RAG

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `documents` | `id`, `organization_id`, `title`, `source`, `doc_type` | Document registry |
| `document_versions` | `id`, `document_id`, `version`, `content_hash` | Version-controlled document snapshots |
| `document_chunks` | `id`, `document_id`, `chunk_index`, `content`, `embedding_json`, `fts_content` | Searchable chunks with embeddings |

> **Note**: `document_chunks.embedding_json` stores the embedding vector as JSON when `pgvector` is unavailable. The planned production schema uses a `VECTOR(768)` column with an HNSW index for ANN search.

### Proposals & Approvals

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `proposals` | `id`, `organization_id`, `lead_id`, `proposal_data`, `status`, `version` | Persisted proposal blobs |
| `approvals` | `id`, `proposal_id`, `action`, `status`, `requested_by`, `reviewed_by` | Human approval audit trail |

### Pricing

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `pricing_catalog` | `product_id`, `product_name`, `unit_price`, `pricing_version`, `is_active` | Authorized product prices |

### Observability

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `agent_runs` | `request_id`, `intent`, `status`, `latency_ms`, `errors` | Per-request agent execution records |
| `tool_calls` | `agent_run_id`, `tool_name`, `status`, `latency_ms`, `input_data`, `output_data` | Individual tool call traces |
| `audit_logs` | `organization_id`, `action`, `entity_type`, `entity_id` | Compliance and security audit trail |

## Relationships

```
Organization --< User
Organization --< Lead --< Interaction
Organization --< Customer --< Interaction
Lead --< Deal
Customer --< Deal
Lead/Customer --< Contact
Organization --< Document --< DocumentVersion --< DocumentChunk
Organization --< ProposalRecord
ProposalRecord --< ApprovalRecord
AgentRun --< ToolCallRecord
```

---

# 11. API / Tool Design

## 11.1 CRM Tool

| Property | Detail |
|----------|--------|
| **File** | `app/tools/crm/tool.py` |
| **Operations** | `get_lead`, `get_customer`, `get_deal`, `get_interactions`, `get_full_lead_context`, `update_lead`, `add_note` |
| **Output** | `ToolResult` with `data` as dict (serialized Pydantic model) |
| **Auth** | Organization scope enforced; protected fields cannot be updated |
| **Error handling** | `CRMNotFoundError` → `success=False`; all errors returned as `ToolResult(success=False)` |

## 11.2 Pricing Tool

| Property | Detail |
|----------|--------|
| **File** | `app/tools/pricing/tool.py` |
| **Operations** | `get_price(product_id, quantity, organization_id)`, `list_products(organization_id)` |
| **Output** | `ToolResult` with `PricingResult` |
| **Error handling** | `PricingUnavailableError` if product not in catalog |

## 11.3 ROI Tool

| Property | Detail |
|----------|--------|
| **File** | `app/tools/roi/tool.py` |
| **Operations** | `calculate_roi(current_cost, expected_savings_pct, implementation_cost, time_period_years, ongoing_cost)` |
| **Output** | `ToolResult` with `ROIResult` including explicit formula descriptions |
| **LLM involvement** | None — pure Python arithmetic |
| **Error handling** | `ROIInputError` for invalid inputs |

## 11.4 RAG Tool

| Property | Detail |
|----------|--------|
| **File** | `app/tools/rag/tool.py` |
| **Operations** | `search(query, limit)` |
| **Output** | `ToolResult` with `{"evidence": [Evidence]}` |
| **Error handling** | `RetrievalError` on search failure; returns empty evidence on no results |

## 11.5 Presentation Tool / MCP Gateway

| Property | Detail |
|----------|--------|
| **File** | `app/tools/presentation/tool.py`, `app/mcp/gateway.py` |
| **Operations** | `create_presentation_from_proposal(proposal)` |
| **MCP tool name** | `create_presentation` |
| **Output** | `ToolResult` with `PresentationResult` — file path, slide count |
| **Security** | MCP gateway enforces allowlist via `MCPSecurityValidator` |
| **Timeout** | Configurable via `MCP_TIMEOUT_SECONDS` (default 30s) |
| **Mock mode** | `MCP_USE_MOCK=true` uses `MockPresentationAdapter` |
| **Error handling** | `MCPNotAllowedError`, `MCPTimeoutError`, `MCPConnectionError`, `MCPValidationError` |

---

# 12. Project Folder Structure

```
sales-ai-agents/
|
+-- app/                          <- All application source code
|   +-- main.py                   <- CLI entry point (Click + Rich)
|   +-- schemas.py                <- Shared Pydantic v2 data models
|   +-- exceptions.py             <- Typed exception hierarchy
|   |
|   +-- agents/                   <- Specialized AI agents
|   |   +-- supervisor/           <- Intent classification & routing
|   |   +-- qualification/        <- Lead qualification
|   |   +-- intelligence/         <- Sales intelligence synthesis
|   |   +-- proposal/             <- Proposal generation
|   |
|   +-- graph/                    <- LangGraph orchestration
|   |   +-- state.py              <- AgentState TypedDict
|   |   +-- workflow.py           <- SalesWorkflowEngine
|   |   +-- graph.py              <- create_sales_agent_graph() factory
|   |
|   +-- tools/                    <- Agent-facing tool interfaces
|   |   +-- crm/                  <- CRM data access tool
|   |   +-- pricing/              <- Pricing catalog tool
|   |   +-- roi/                  <- ROI calculator tool
|   |   +-- rag/                  <- Document retrieval tool
|   |   +-- presentation/         <- PPTX generation tool (via MCP)
|   |
|   +-- services/                 <- Business logic layer
|   +-- database/                 <- Database layer
|   |   +-- base.py               <- SQLAlchemy declarative base
|   |   +-- session.py            <- Async session factory
|   |   +-- models/orm_models.py  <- All SQLAlchemy ORM models
|   |   +-- repositories/         <- Repository protocols + mock adapters
|   |
|   +-- rag/                      <- RAG pipeline
|   |   +-- embeddings.py         <- Embedding service + mock
|   |   +-- ingestion/            <- Loader, chunker, pipeline
|   |   +-- retrieval/            <- vector_store, hybrid_search, rrf, reranker
|   |   +-- self_rag/             <- Evidence quality evaluator + prompts
|   |
|   +-- llm/                      <- LLM abstraction layer (LiteLLM wrapper)
|   +-- mcp/                      <- MCP gateway + adapters
|   +-- guardrails/               <- Input, output, injection, evidence, tool guardrails
|   +-- observability/            <- Logging, correlation IDs, metrics, tracing
|   +-- config/settings.py        <- Pydantic Settings — all configuration
|
+-- tests/                        <- Test suite (29 tests)
|   +-- agents/                   <- Agent unit tests
|   +-- guardrails/               <- Guardrail tests
|   +-- integration/              <- End-to-end workflow tests
|   +-- rag/                      <- RAG pipeline and RRF tests
|   +-- tools/                    <- Tool tests
|
+-- data/sample_documents/        <- Markdown files for RAG ingestion
+-- infrastructure/               <- Deployment configuration (planned)
+-- pyproject.toml                <- Project metadata and dependencies
+-- .env.example                  <- Environment variable template
+-- PROJECT_IDEA.md               <- This document
```

---

# 13. Security and Guardrails

## Implemented

### Input Validation
- **Query length limits**: 3–2000 character bounds enforced before agent execution
- **Entity ID format validation**: `LEAD-NNN`, `CUST-NNN`, `DEAL-NNN`, `prop_XXXXXXXX` validated via regex
- **Organization context validation**: `organization_id` must match `[a-zA-Z0-9_\-\.]+`, max 64 chars

### Prompt Injection Defense
- **User input scanning**: Six injection signatures detected via regex
  - `ignore all previous instructions`, `disregard the system prompt`, `system override`
  - `DAN mode`, `bypass safety filters`, `reveal passwords/api_keys`
- **Untrusted document isolation**: Retrieved document text is wrapped in `<untrusted_document_data>` XML tags before being sent to the LLM
- **Raises**: `PromptInjectionError` — stops the workflow immediately

### Tool Access Control
- **Agent isolation**: Agents can only call the tools they are initialized with
- **Protected field enforcement**: CRM `update_lead` rejects writes to `lead_id` and `organization_id`
- **MCP allowlist**: `MCPSecurityValidator` enforces a hardcoded allowlist of permitted MCP tool names

### Data Integrity
- **Pricing enforcement**: Agent code overwrites any LLM-generated pricing with tool-retrieved values post-generation
- **ROI enforcement**: Agent code overwrites any LLM-generated ROI with deterministic calculator results
- **Evidence ID validation**: Post-generation checks verify that `evidence_ids` in insights match actual retrieved chunk IDs

### Observability & Audit
- **Correlation IDs**: Every request gets a unique `request_id` and `agent_run_id` bound to all log lines
- **Structured logging**: JSON log format in production via structlog
- **Prometheus metrics**: LLM call counts, latency histograms, tool call counts by status

### Secrets Management
- All API keys and credentials are environment-variable-driven; no hardcoded secrets
- `.env` excluded from git via `.gitignore`

## Planned

| Feature | Description |
|---------|-------------|
| Authentication | JWT-based auth for any future API/frontend layer |
| Authorization | Role-based access control (RBAC) per organization |
| Rate limiting | Per-user and per-organization LLM call quotas |
| Output PII detection | Scan final responses for sensitive data before dispatch |
| Agent permission registry | Declarative per-agent tool allowlist from configuration |

---

# 14. Error Handling

## Exception Hierarchy

```
SalesAgentError (root)
+-- ConfigurationError
+-- LLMError
|   +-- LLMTimeoutError
|   +-- LLMRateLimitError
|   +-- StructuredOutputError
+-- ToolExecutionError
|   +-- ToolNotAllowedError
|   +-- ToolValidationError
+-- CRMError
|   +-- CRMNotFoundError
|   +-- CRMAccessError
+-- RetrievalError
|   +-- EmbeddingError
|   +-- EvidenceInsufficientError
|   +-- IngestionError
+-- ROIError
|   +-- ROIInputError
|   +-- ROICalculationError
+-- PricingError
|   +-- PricingUnavailableError
|   +-- PricingValidationError
+-- ProposalError
|   +-- ProposalValidationError
+-- MCPError
|   +-- MCPNotAllowedError
|   +-- MCPTimeoutError
|   +-- MCPValidationError
|   +-- MCPConnectionError
+-- GuardrailError
|   +-- InputValidationError
|   +-- OutputValidationError
|   +-- PromptInjectionError
|   +-- UnsupportedClaimError
+-- ApprovalError
|   +-- ApprovalRequiredError
|   +-- ApprovalRejectedError
+-- DatabaseError
|   +-- EntityNotFoundError
+-- SupervisorError
    +-- RoutingError
    +-- AgentError
```

## Handling Strategy by Failure Type

| Failure | Behavior |
|---------|----------|
| Invalid user input | `InputValidationError` raised; workflow stops |
| Prompt injection detected | `PromptInjectionError` raised immediately |
| CRM entity not found | `CRMNotFoundError` → `ToolResult(success=False)`; agent handles missing data |
| LLM timeout | `LLMTimeoutError`; LiteLLM retries up to `LITELLM_MAX_RETRIES`; fallback model tried |
| LLM rate limit | `LLMRateLimitError`; retried with exponential backoff via LiteLLM |
| Structured output parse failure | `StructuredOutputError`; retry without `response_format`; re-raise if still fails |
| Pricing unavailable | `PricingUnavailableError` → `ToolResult(success=False)`; proposal continues with available items |
| ROI input invalid | `ROIInputError` → `ToolResult(success=False)`; `roi_result = None` in proposal |
| RAG retrieval failure | `RetrievalError`; evidence list empty; agents proceed without document grounding |
| Insufficient evidence | `EvidenceInsufficientError`; Self-RAG returns `INSUFFICIENT_EVIDENCE` |
| MCP timeout | `MCPTimeoutError` → warning added to state |
| MCP not allowed | `MCPNotAllowedError`; raised immediately by gateway |
| Agent execution error | `AgentError`; caught at top-level; recorded in `state["errors"]` |

---

# 15. Development Phases

### Phase 1 — Project Foundation ✅ Complete
Python project setup, Pydantic v2 data model design, typed exception hierarchy, Pydantic Settings configuration, structlog + Prometheus + OpenTelemetry observability setup.

### Phase 2 — Database Layer ✅ Schema Complete / Migrations Pending
SQLAlchemy ORM models for all entities (CRM, Documents, Proposals, Pricing, Observability), async session factory, MockCRMAdapter for offline development.

### Phase 3 — Service & Tool Layer ✅ Complete
`CRMService` + `CRMTool`, `PricingService` + `PricingTool`, `ROICalculator` + `ROITool`, tool result wrapping in `ToolResult` with observability.

### Phase 4 — Agent Development ✅ Complete
`SupervisorAgent`, `QualificationAgent`, `SalesIntelligenceAgent`, `ProposalAgent`, `LLMService` via LiteLLM, offline deterministic fallbacks for all agents.

### Phase 5 — RAG Pipeline ✅ Complete
Document loader, token-aware chunker, embedding service (Google + Mock), `InMemoryDocumentStore` with cosine + BM25-like search, RRF, `SimpleReranker`, `SelfRAGEvaluator`, `HybridSearchService`.

### Phase 6 — Graph Orchestration ✅ Complete
LangGraph `StateGraph` with `AgentState` TypedDict, 8 nodes, conditional routing (intent-based + approval-based), `MemorySaver` checkpointer, `create_sales_agent_graph()` factory.

### Phase 7 — MCP Integration ✅ Complete
`MCPGateway` with allowlist enforcement and timeouts, `MCPSecurityValidator`, `LocalPresentationAdapter`, `MockPresentationAdapter`.

### Phase 8 — Guardrails ✅ Complete
`InputGuardrails`, `InjectionDefense`, `OutputGuardrails`, `EvidenceGuardrails`.

### Phase 9 — Testing ✅ 29 Tests Passing
Agent unit tests, guardrail tests, RAG pipeline + RRF tests, tool tests, integration workflow end-to-end tests.

### Phase 10 — FastAPI Backend 🔲 Planned
REST API endpoints wrapping `run_agent_workflow()`, WebSocket streaming, JWT authentication middleware.

### Phase 11 — PostgreSQL + pgvector 🔲 Planned
Alembic migration with `VECTOR(768)` column and HNSW index, `PostgreSQLDocumentStore` implementation, real CRM database queries.

### Phase 12 — Deployment 🔲 Planned
Docker containerization, Docker Compose with PostgreSQL, CI/CD pipeline.

---

# 16. Testing Strategy

## Current Test Coverage (29 tests, all passing)

| Module | Tests | Coverage |
|--------|-------|---------|
| `tests/agents/test_supervisor.py` | 2 | Intent classification, routing decisions |
| `tests/agents/test_qualification.py` | 2 | CRM-grounded qualification, missing info detection |
| `tests/agents/test_intelligence.py` | 1 | CRM + RAG intelligence synthesis |
| `tests/agents/test_proposal.py` | 1 | Full proposal generation with tool verification |
| `tests/guardrails/test_guardrails.py` | 6 | Input validation, injection detection, output guardrails |
| `tests/integration/test_workflow.py` | 2 | End-to-end qualification and proposal workflows |
| `tests/rag/test_rag_pipeline.py` | 3 | Ingestion, hybrid search, self-RAG evaluation |
| `tests/rag/test_rrf.py` | 2 | RRF score calculation, deduplication, ordering |
| `tests/tools/test_pricing.py` | 3 | Price retrieval, validation, catalog listing |
| `tests/tools/test_roi.py` | 3 | ROI formula accuracy, edge cases |
| `tests/tools/test_presentation_mcp.py` | 4 | MCP gateway, allowlist, timeout, PPTX generation |

## Testing Philosophy

- **All agents run deterministically without LLM API key** — tests never require external services
- **Tool mocks use Protocol interfaces** — `MockCRMAdapter` and `MockPricingRepository` implement the same protocols as production adapters
- **Async-first**: All tests use `pytest-asyncio` in `auto` mode

## Planned Testing Additions

| Type | Description |
|------|-------------|
| RAG evaluation | RAGAS metrics: faithfulness, answer relevance, context precision/recall |
| Proposal accuracy | Verify pricing in proposals matches catalog values exactly |
| Injection resistance | Fuzz testing with adversarial prompt inputs |
| Load testing | Concurrent request simulation for throughput/latency profiling |
| Database integration tests | Tests against real PostgreSQL with pgvector |
| LLM regression tests | LangSmith prompt evaluation suite |

---

# 17. Performance Considerations

## Current Profile (Offline / Mock Mode)

- **Workflow latency**: < 5ms per request (no LLM calls, no I/O)
- **RAG search**: < 1ms (in-memory cosine + BM25)
- **Token usage**: 0 (offline fallbacks only)

## Production Profile (LLM API)

| Operation | Estimated Latency |
|-----------|-------------------|
| Supervisor routing (LLM) | 300–600ms |
| Qualification (1 LLM call) | 1–3s |
| Intelligence (1 LLM call + RAG) | 1.5–4s |
| Proposal (4 tool calls + 1 optional LLM) | 2–6s |
| Self-RAG evaluation (1 LLM call) | 500ms–1.5s |
| End-to-end proposal + presentation | 4–10s |

## Optimization Strategies

- **LiteLLM fallback**: Automatic fallback to Gemini Flash on primary model failure
- **Parallel tool calls**: Semantic and keyword searches run concurrently in `HybridSearchService`
- **Settings singleton**: `get_settings()` uses `@lru_cache` to avoid repeated env var parsing
- **LangGraph checkpointer**: `MemorySaver` keeps state in-process; Redis checkpointer planned for production scaling
- **Connection pooling**: PostgreSQL pool size and max overflow configurable via env vars

---

# 18. Deployment Architecture

```
+--------------------------------+
|     User / Frontend / API      |
|  (CLI today; FastAPI planned)  |
+---------------+----------------+
                |
+---------------v----------------+
|         Application Layer      |
|  main.py (CLI) / FastAPI app   |
+---------------+----------------+
                |
+---------------v----------------+
|       Agent Service Layer      |
|  SalesWorkflowEngine (LangGraph|
|  + Supervisor + Agents + Tools)|
+----+----------+----------------+
     |          |
     |  +-------v------------------+
     |  |  LLM Provider (Cloud)    |
     |  |  Gemini via LiteLLM      |
     |  +--------------------------+
     |
+----v---------------------------+
|    Data & Storage Layer        |
|  PostgreSQL + pgvector (prod)  |
|  InMemoryStore (dev/test)      |
+--------------------------------+
```

### Planned Containerized Deployment

```
services:
  app:          # FastAPI + Agent service
  postgres:     # PostgreSQL with pgvector extension
  prometheus:   # Metrics collection
  grafana:      # Metrics dashboard
  otel-collector: # OpenTelemetry trace aggregation
```

---

# 19. Environment Variables

```env
# LLM Configuration
GOOGLE_API_KEY=your_google_api_key_here
LITELLM_MODEL=gemini/gemini-1.5-pro
LITELLM_FALLBACK_MODEL=gemini/gemini-1.5-flash
LITELLM_MAX_TOKENS=4096
LITELLM_TEMPERATURE=0.0
LITELLM_TIMEOUT=60
LITELLM_MAX_RETRIES=3

# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/sales_ai
DATABASE_URL_SYNC=postgresql+psycopg2://postgres:password@localhost:5432/sales_ai
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20
DATABASE_ECHO=false

# Observability
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=sales-ai-agents
LANGCHAIN_TRACING_V2=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_SERVICE_NAME=sales-ai-agents
OTEL_ENABLED=false
PROMETHEUS_PORT=9090

# Application
LOG_LEVEL=INFO
LOG_FORMAT=json
ENVIRONMENT=development
DEBUG=false

# Approval
APPROVAL_REQUIRED=true
APPROVAL_TIMEOUT_SECONDS=3600

# RAG Settings
RAG_CHUNK_SIZE=512
RAG_CHUNK_OVERLAP=64
RAG_TOP_K=10
RAG_RERANK_TOP_K=5
RAG_RRF_K=60
EMBEDDING_MODEL=models/text-embedding-004
EMBEDDING_DIMENSIONS=768

# MCP Settings
MCP_TIMEOUT_SECONDS=30
MCP_USE_MOCK=true

# Security
SECRET_KEY=change_this_secret_key_in_production
```

> **Never commit real API keys or secrets to version control. Copy `.env.example` to `.env` and fill in actual values.**

---

# 20. Future Enhancements

## Short-Term

| Enhancement | Description |
|-------------|-------------|
| FastAPI REST API | Wrap `run_agent_workflow()` as POST `/api/v1/agent/run`; stream progress via WebSocket |
| PostgreSQL + pgvector | Replace `InMemoryDocumentStore` with production vector store |
| Alembic migrations | Auto-generate and apply schema migrations |
| LangGraph interrupt | Use `interrupt_before=["presentation"]` for true async human approval |
| Multi-product proposals | Let Proposal Agent query all catalog items and select based on fit |

## Medium-Term

| Enhancement | Description |
|-------------|-------------|
| Web UI | React dashboard for query input, proposal review, and approval workflow |
| CRM sync | Real-time bidirectional Salesforce / HubSpot integration via webhooks |
| RAG document management | Admin UI to upload, version, and manage the document corpus |
| RAGAS evaluation suite | Automated RAG quality metrics |
| Cross-encoder reranker | Replace SimpleReranker with a neural cross-encoder |
| Agent memory | Long-term episodic memory for returning leads |
| Email / Slack dispatch | Send approved proposals directly to leads via integration layer |

## Long-Term

| Enhancement | Description |
|-------------|-------------|
| Multi-tenant SaaS | Fully isolated per-organization data with org-level LLM and RAG configuration |
| Deal coaching agent | Real-time call coaching based on live CRM stage and competitor intelligence |
| Competitive intelligence agent | Monitors competitor websites and product releases via RAG |
| Revenue forecasting | Predictive deal velocity modeling with historical pipeline data |
| Fine-tuned models | Domain-specific fine-tuning on sales documents and proposal corpus |
| Agentic web browsing | Browser-use agent for gathering real-time prospect intelligence |

---

# 21. Risks and Limitations

| Risk | Severity | Mitigation |
|------|----------|------------|
| LLM hallucination | High | Pricing and ROI are tool-computed; evidence must have traceable IDs; post-generation validation |
| Google API dependency | High | Offline deterministic fallbacks implemented for all agents; LiteLLM supports provider switching |
| RAG retrieval accuracy | Medium | Hybrid search + RRF + reranking; Self-RAG quality gate; accuracy improves with real pgvector |
| LLM API cost | Medium | Gemini Flash fallback reduces cost; token counts tracked via Prometheus |
| Latency (LLM API) | Medium | End-to-end target < 10s; LiteLLM retries with timeout enforcement |
| Data quality (CRM) | Medium | Missing CRM fields are recorded explicitly, not hallucinated |
| In-memory vector store | Medium | `InMemoryDocumentStore` has no persistence across restarts; PostgreSQL migration planned |
| Scalability | Medium | `MemorySaver` is in-process only; Redis or PostgreSQL checkpointer needed for horizontal scaling |
| Security (production) | Medium | Auth/authz layer not yet implemented; MCP allowlist and input guardrails are in place |
| Prompt injection | Low | Regex-based detection for known patterns; XML document isolation |
| PII in proposals | Low | No PII scanning on output yet; planned as future enhancement |

---

# 22. Success Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Test coverage | Pytest pass rate | 100% (29/29 currently) |
| Offline operation | Workflow completes without API key | Verified |
| Pricing accuracy | Proposal pricing matches catalog exactly | 100% — enforced programmatically |
| ROI accuracy | ROI formula outputs match reference calculations | 100% — pure Python, no LLM |
| Hallucination rate | Invented numbers in proposals | 0% — all figures tool-derived |
| Evidence traceability | Claims with valid `evidence_id` | 100% — validated post-generation |
| Injection resistance | Known injection signatures blocked | 6/6 patterns detected and blocked |
| End-to-end latency (LLM) | Proposal workflow | < 10 seconds |
| End-to-end latency (offline) | Proposal workflow | < 100ms |
| Type safety | All state fields typed | `AgentState` TypedDict + Pydantic models throughout |

---

# 23. Final Project Summary

## What Is Being Built

An **autonomous multi-agent sales backend** that accepts natural language requests and returns one of three structured, validated outcomes: lead qualification reports, sales intelligence analyses, or enterprise proposals with verified pricing, deterministic ROI, and optional slide decks.

## Why It Matters

The system eliminates the two biggest risks in AI-assisted sales work: **hallucinated numbers** (pricing, ROI, customer facts) and **untraceable claims** (no evidence citation). By enforcing tool-first data retrieval and evidence ID traceability throughout the pipeline, the system produces outputs suitable for real customer-facing use without manual fact-checking.

## Main Technologies

| Category | Technology |
|----------|-----------|
| Agent orchestration | LangGraph |
| LLM | Google Gemini 1.5 Pro / Flash via LiteLLM |
| Data validation | Pydantic v2 |
| RAG | Hybrid semantic + BM25 + RRF + Self-RAG |
| Database | PostgreSQL + pgvector (planned), SQLAlchemy ORM |
| Logging | structlog (JSON structured) |
| Metrics | Prometheus |
| Presentation | python-pptx via MCP gateway |

## Main Architecture

```
User Query
    → Input Guardrails
    → Supervisor Agent (intent classification)
    → [Qualification | Intelligence | Proposal] Agent
    → Approval Checkpoint
    → Presentation (MCP, if approved)
    → Output Guardrails
    → Structured Result
```

## Expected Outcome

A production-oriented, fully testable Python agent system that:
- Runs completely offline in CI/CD without external API dependencies
- Produces zero hallucinated numbers in proposals
- Provides full evidence traceability from claims to source documents
- Is extensible to a FastAPI REST backend, real PostgreSQL persistence, and a web dashboard without architectural changes

