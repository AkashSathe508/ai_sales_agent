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
- PostgreSQL with pgvector for persistent RAG retrieval (`RAG_STORAGE_BACKEND=memory` is available for offline development only)

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
Leave `GOOGLE_API_KEY` unset or as `your_google_api_key_here` and set `RAG_STORAGE_BACKEND=memory`. The system uses deterministic mock embeddings and offline LLM fallbacks. Mock vectors are for development and tests, not production relevance.

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

## Running the Frontend and API

Install backend dependencies from the repository root, then start FastAPI:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn fastapi_app:app --host 127.0.0.1 --port 8000 --reload
```

In another terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The Vite app uses `http://localhost:8000` by default. To change it, set `VITE_API_BASE_URL` in `frontend/.env.local` and restart Vite. The backend CORS allowlist defaults to the localhost Vite origins; set `CORS_ORIGINS` to a comma-separated list when hosting the frontend elsewhere.

You can verify the run endpoint with the checked-in sample payload:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/agent/run -ContentType 'application/json' -InFile data/sample_requests/agent_run.json
```

The sample targets seeded `LEAD-001` (Meridian Financial Group). Other seeded workflow IDs include `LEAD-002`, `CUSTOMER-001`, and `DEAL-001`. Use `GET /api/v1/leads` and `GET /api/v1/customers` to inspect the CRM seed records. The API returns HTTP 422 for invalid request data and HTTP 503 if an accepted request cannot execute because of workflow errors or missing dependencies; inspect backend logs for the underlying exception.

---

## Running Tests

Run the offline unit and agent suite with:

```bash
python -m pytest tests/ -v
```

PostgreSQL integration tests require a dedicated test database. See [docs/database_setup.md](docs/database_setup.md); do not run destructive fixtures against a developer database.

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

Persistent RAG setup, migration, safe sample seeding, verification, and limitations are documented in [docs/database_setup.md](docs/database_setup.md) and [docs/rag_architecture.md](docs/rag_architecture.md).

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
Documents → Loader → Existing Chunker → Embedding Service
    → PostgreSQL (pgvector + JSONB + TSVECTOR)
    → Semantic Search + PostgreSQL FTS → RRF (k=60)
    → SimpleReranker → Self-RAG → Existing RAG Tool → Evidence
```

`InMemoryDocumentStore` and deterministic embeddings are for offline development and tests. Production requires PostgreSQL; see the database and RAG guides linked above.

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
├── tests/                       # Unit, agent, RAG, tool, and integration tests
├── data/sample_documents/       # Synthetic sample documents for safe RAG seeding
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
| `POSTGRES_HOST` / `POSTGRES_PORT` | `localhost` / `5432` | PostgreSQL connection settings |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | `sales_ai` / `postgres` / — | PostgreSQL database credentials |
| `DATABASE_URL` | empty | Optional SQLAlchemy URL override |
| `RAG_STORAGE_BACKEND` | `postgres` in `.env.example` | `postgres` or offline development `memory` |
| `RAG_CHUNK_SIZE` | `512` | Character chunk size for RAG ingestion |
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
| PostgreSQL + pgvector repository and migrations | ✅ Implemented; live DB verification required |
| PostgreSQL integration tests | ⚠️ Not run without an isolated PostgreSQL test database |
| FastAPI REST backend | 🔲 Planned |
| Alembic migrations | 🔲 Planned |

---

## Planned Extensions

- **FastAPI REST API**: Wrap `run_agent_workflow()` as `POST /api/v1/agent/run`
- **Web UI**: React dashboard for proposal review and approval workflow
- **Real CRM integration**: Bidirectional Salesforce/HubSpot sync


# Run all tests
.venv/bin/python -m pytest tests/ -v

# Run CLI (offline mode, no API key required)
.venv/bin/python -m app.main "Qualify LEAD-001 for our enterprise solution"
.venv/bin/python -m app.main "Prepare a proposal for LEAD-001" --auto-approve

