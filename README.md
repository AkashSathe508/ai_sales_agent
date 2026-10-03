# AI Sales Intelligence & Proposal Automation Platform

> A production-oriented, multi-agent AI backend that automates lead qualification, sales intelligence analysis, and enterprise proposal generation using LangGraph, LiteLLM (Gemini), hybrid RAG, and MCP.

---

## Overview

This system accepts a natural language query and autonomously routes it through a specialized agent pipeline to produce one of three outputs:

1. **Lead Qualification Report** — CRM-grounded assessment of a lead's readiness to buy
2. **Sales Intelligence Analysis** — Insights combining CRM data and document evidence (hybrid RAG)
3. **Enterprise Proposal** — Validated proposal with deterministic ROI, verified pricing, and optional PPTX deck

**Key design principle**: No pricing figure, ROI number, or customer fact is invented by the LLM. All values are retrieved from tools (CRM, Pricing Catalog) or grounded in traceable document evidence.

---

## Requirements

- **Python** >= 3.12
- **Google API Key** (for Gemini LLM + text-embedding-004) — optional; system runs fully offline with deterministic fallbacks
- No external database required — uses `InMemoryDocumentStore` for RAG

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd sales-ai-agents

# Create a virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate      # Linux/macOS
# .venv\Scripts\activate       # Windows

pip install -e ".[dev]"
```

---

## Configuration

Copy the example environment file and fill in actual values:

```bash
cp .env.example .env
```

**Required variables** (only if using live LLM):

```env
GOOGLE_API_KEY=your_google_api_key_here
LITELLM_MODEL=gemini/gemini-1.5-pro
LITELLM_FALLBACK_MODEL=gemini/gemini-1.5-flash
```

**Offline / demo mode** (no API key needed):  
Leave `GOOGLE_API_KEY` unset or as `your_google_api_key_here`. The system uses deterministic offline fallbacks for all agents — all tests pass and all workflows complete without external API calls.

**Other notable settings**:

```env
MCP_USE_MOCK=true          # Use mock presentation adapter (default: true)
APPROVAL_REQUIRED=true     # Human approval gate before PPTX generation
LOG_FORMAT=json            # JSON structured logs (json | console)
```

---

## Running the CLI

```bash
# Lead qualification
python -m app.main "Qualify LEAD-001 for our enterprise solution"

# Sales intelligence analysis
python -m app.main "What competitive advantages do we have for financial sector clients?"

# Proposal generation (requires explicit approval)
python -m app.main "Analyze LEAD-001 and prepare a proposal for improving their sales reporting"

# Proposal with auto-approval (generates PPTX immediately — demo mode)
python -m app.main "Prepare a proposal for LEAD-001" --auto-approve

# With explicit organization and user
python -m app.main "Qualify LEAD-001" --org-id my-org --user-id user-123

# Help
python -m app.main --help
```

---

## Running Tests

All 29 tests pass without any external API key or database:

```bash
python -m pytest tests/ -v
```

**Test coverage summary:**

| Module | Tests |
|--------|-------|
| `tests/agents/` | 6 — Supervisor, Qualification, Intelligence, Proposal agents |
| `tests/guardrails/` | 6 — Input validation, injection defense, evidence, output guardrails |
| `tests/integration/` | 2 — End-to-end qualification and proposal workflows |
| `tests/rag/` | 5 — RAG ingestion, hybrid search, RRF, reranker, self-RAG |
| `tests/tools/` | 10 — Pricing, ROI, Presentation/MCP tools |

---

## Architecture

```
User Query
    → Input Guardrails (length, entity ID format, injection detection)
    → Supervisor Agent (intent classification: qualification / intelligence / proposal)
    → [Qualification | Intelligence | Proposal] Agent
    → Approval Checkpoint (auto_approve=False by default)
    → Presentation Tool via MCP Gateway (if approved)
    → Output Guardrails (assemble structured response)
    → Structured AgentState result
```

### Agents

| Agent | Intent | Tools Used |
|-------|--------|-----------|
| `SupervisorAgent` | Route all queries | None (classify only) |
| `QualificationAgent` | `qualification` | CRM Tool |
| `SalesIntelligenceAgent` | `intelligence` | CRM Tool + RAG Tool |
| `ProposalAgent` | `proposal` | CRM Tool + RAG Tool + Pricing Tool + ROI Tool |

### Tools

| Tool | Description |
|------|-------------|
| `CRMTool` | Read leads, deals, interactions from `MockCRMAdapter` |
| `PricingTool` | Fetch validated prices from `MockPricingRepository` |
| `ROITool` | Deterministic Python calculator (zero LLM involvement) |
| `RAGTool` | Hybrid semantic + BM25-like search with RRF fusion and reranking |
| `PresentationTool` | Generate PPTX via `MCPGateway` → `LocalPresentationAdapter` (or mock) |

### RAG Pipeline

```
Documents (Markdown, .txt) → Loader → Chunker (512-token, 64-token overlap)
    → MockEmbeddingService (offline) / Google text-embedding-004 (live)
    → InMemoryDocumentStore
    → Parallel: Semantic Search (cosine) + Keyword Search (BM25-like TF)
    → Reciprocal Rank Fusion (RRF, k=60)
    → SimpleReranker (term coverage + phrase bonus)
    → SelfRAGEvaluator (ACCEPT / RETRIEVE_MORE / INSUFFICIENT_EVIDENCE)
    → Evidence list with traceable evidence_id per chunk
```

---

## Project Structure

```
sales-ai-agents/
├── app/
│   ├── main.py                  # CLI entry point (Click + Rich)
│   ├── schemas.py               # Shared Pydantic v2 models
│   ├── exceptions.py            # Typed exception hierarchy
│   ├── agents/                  # Supervisor, Qualification, Intelligence, Proposal
│   ├── graph/                   # LangGraph StateGraph + AgentState + SalesWorkflowEngine
│   ├── tools/                   # CRM, Pricing, ROI, RAG, Presentation tools
│   ├── services/                # Business logic between tools and repositories
│   ├── database/                # SQLAlchemy ORM models + session + mock repositories
│   ├── rag/                     # RAG ingestion, retrieval, RRF, reranking, self-RAG
│   ├── llm/                     # LiteLLM wrapper with deterministic offline fallbacks
│   ├── mcp/                     # MCPGateway + LocalPresentationAdapter + MockAdapter
│   ├── guardrails/              # Input, output, injection, evidence, tool guardrails
│   ├── observability/           # structlog, Prometheus metrics, correlation IDs
│   └── config/settings.py       # Pydantic Settings (all config from env vars)
├── tests/                       # 29 tests (agents, guardrails, integration, RAG, tools)
├── data/sample_documents/       # Markdown documents loaded into RAG at startup
├── pyproject.toml               # Project metadata and dependencies
└── .env.example                 # Environment variable template
```

---

## Security & Guardrails

### Input Validation
- Query length: 3–2000 characters enforced before agent execution
- Entity ID format: `LEAD-NNN`, `CUST-NNN`, `DEAL-NNN` validated via regex

### Prompt Injection Defense (6 patterns)
- `ignore all previous instructions`
- `disregard the system prompt`
- `system override`
- `DAN mode` (any form)
- `bypass safety filters`
- `reveal passwords / api_keys / credentials`

### Data Integrity
- **Pricing**: Always from `PricingTool`; LLM-generated prices are overwritten post-generation
- **ROI**: Always from deterministic Python calculator; zero LLM involvement
- **Evidence**: `evidence_id` traced from claim → chunk → source document

### MCP Security
- `MCPSecurityValidator` enforces a hardcoded allowlist of permitted MCP tool names
- `MCP_USE_MOCK=true` by default in `.env.example`

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | — | Google AI API key (optional; offline mode if unset) |
| `LITELLM_MODEL` | `gemini/gemini-1.5-pro` | Primary LLM model |
| `LITELLM_FALLBACK_MODEL` | `gemini/gemini-1.5-flash` | Fallback on rate limit/error |
| `LITELLM_TEMPERATURE` | `0.0` | LLM temperature |
| `LITELLM_MAX_TOKENS` | `4096` | Max tokens per LLM call |
| `LITELLM_TIMEOUT` | `60` | LLM call timeout (seconds) |
| `LITELLM_MAX_RETRIES` | `3` | LiteLLM retry count |
| `LOG_LEVEL` | `INFO` | Logging level |
| `LOG_FORMAT` | `json` | `json` or `console` |
| `ENVIRONMENT` | `development` | Environment name |
| `APPROVAL_REQUIRED` | `true` | Human approval gate for proposals |
| `MCP_TIMEOUT_SECONDS` | `30` | MCP gateway call timeout |
| `MCP_USE_MOCK` | `true` | Use mock presentation adapter |
| `RAG_CHUNK_SIZE` | `512` | Token chunk size for RAG ingestion |
| `RAG_CHUNK_OVERLAP` | `64` | Token overlap between adjacent chunks |
| `RAG_TOP_K` | `10` | Retrieval candidates per method |
| `RAG_RERANK_TOP_K` | `5` | Final chunks after reranking |
| `EMBEDDING_MODEL` | `models/text-embedding-004` | Google embedding model (offline: mock) |
| `EMBEDDING_DIMENSIONS` | `768` | Embedding vector dimensions |
| `SECRET_KEY` | — | Application secret key |

---

## Current Status

| Component | Status |
|-----------|--------|
| Project startup | ✅ Working |
| CLI entry point | ✅ Working |
| Input Guardrails (6/6 injection patterns) | ✅ Working |
| Supervisor Agent (offline + live LLM) | ✅ Working |
| Qualification Agent | ✅ Working |
| Intelligence Agent | ✅ Working |
| Proposal Agent | ✅ Working |
| CRM Tool (Mock adapter) | ✅ Working |
| Pricing Tool (Mock catalog) | ✅ Working |
| ROI Tool (deterministic calculator) | ✅ Working |
| RAG Pipeline (hybrid search + RRF + reranking) | ✅ Working |
| Self-RAG Evaluator | ✅ Working |
| MCP Gateway + Presentation Tool | ✅ Working |
| LangGraph workflow (all 8 nodes) | ✅ Working |
| Approval Checkpoint | ✅ Working |
| Output Guardrails | ✅ Working |
| Tests (29/29) | ✅ All passing |
| PostgreSQL + pgvector | 🔲 Planned |
| FastAPI REST backend | 🔲 Planned |
| Alembic migrations | 🔲 Planned |

---

## Planned Extensions

- **FastAPI REST API**: Wrap `run_agent_workflow()` as `POST /api/v1/agent/run`
- **PostgreSQL + pgvector**: Replace `InMemoryDocumentStore` with persistent vector store
- **Alembic migrations**: Auto-generate and apply schema migrations
- **Web UI**: React dashboard for proposal review and approval workflow
- **Real CRM integration**: Bidirectional Salesforce/HubSpot sync


# Run all tests
.venv/bin/python -m pytest tests/ -v

# Run CLI (offline mode, no API key required)
.venv/bin/python -m app.main "Qualify LEAD-001 for our enterprise solution"
.venv/bin/python -m app.main "Prepare a proposal for LEAD-001" --auto-approve

