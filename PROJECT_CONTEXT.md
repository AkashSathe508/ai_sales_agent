# AI Sales Intelligence & Proposal Automation Platform — Project Context

## 1. System Overview

This platform is a production-oriented enterprise SaaS solution integrating a multi-agent Python backend (LangGraph + LiteLLM + Hybrid RAG + MCP) with a modern React.js frontend. The platform automates lead qualification, sales intelligence analysis, and enterprise proposal generation with strict deterministic calculation guarantees (no LLM hallucination of pricing or ROI).

```
USER
  │
  ▼
React.js Frontend (Vite + Tailwind CSS + Lucide React + TanStack Query + Recharts)
  │
  ▼ (HTTP / REST)
FastAPI Integration Layer (fastapi_app.py on Port 8000)
  │
  ▼
Supervisor Agent (LangGraph StateGraph Router)
  ├── Qualification Agent (CRM Tool + BANT audit)
  ├── Sales Intelligence Agent (Hybrid RAG + Document Store)
  └── Proposal Agent (Deterministic ROI Engine + Catalog Pricing)
  │
  ▼
CRM / RAG / ROI / Pricing / Presentation Adapters
  │
  ▼
PostgreSQL / InMemory Document Store + LiteLLM Gateway
```

---

## 2. Frontend Technology Stack

Strictly aligned with enterprise requirements (JavaScript JSX only, no TypeScript, no Next.js):

| Tool / Library | Role | Version |
| :--- | :--- | :--- |
| **React.js** | Core UI library | ^18.3.1 |
| **JavaScript (JSX)** | Language & syntax | ES2022+ |
| **Vite** | Build tool & dev server | ^6.0.3 |
| **Tailwind CSS** | Styling & utility design system | ^3.4.16 |
| **Lucide React** | Enterprise icon system | ^0.468.0 |
| **React Router DOM** | Client-side routing & navigation | ^6.28.0 |
| **TanStack Query** | Server state management | ^5.62.0 |
| **Axios** | Centralized API client | ^1.7.9 |
| **React Hook Form + Zod** | Form handling & validation | ^7.54.0 / ^3.24.1 |
| **Recharts** | Data visualization & charts | ^2.15.0 |
| **Framer Motion** | Micro-interactions & animations | ^11.15.0 |

---

## 3. Implementation Status Across All 10 Phases

### ✅ Phase 1: Foundation & Shell (COMPLETED)
- [x] Project initialized in `frontend/` with Vite and React (JavaScript JSX).
- [x] Tailwind CSS configured with an enterprise color palette (Indigo, Slate, Neutral), custom scrollbars, and CSS variables.
- [x] Light and Dark theme foundation (`ThemeContext`) with local storage persistence and system preference support.
- [x] Reusable UI components library built in `src/components/ui/` (`Button`, `Badge`, `Card`, `Input`, `Avatar`, `Skeleton`, `Tooltip`).
- [x] Collapsible Sidebar navigation in `src/components/layout/Sidebar.jsx` with Agent System Telemetry Box and mobile drawer.
- [x] Top Navigation bar in `src/components/layout/TopNavbar.jsx` with breadcrumbs, `⌘K` search shortcut, active supervisor pill, notification bell, and theme switch.
- [x] Dashboard Layout Shell in `src/layouts/DashboardLayout.jsx` hosting `<Outlet />`.
- [x] React Router DOM configuration in `src/routes/index.jsx` with routes for all 13 required pages.
- [x] API client and service layer scaffolded in `src/services/`.

### ✅ Phase 2: Dashboard Analytics & Charts (COMPLETED)
- [x] **MetricCardsGrid (`MetricCardsGrid.jsx`)**: 6 KPI cards with trend indicators and tooltips ($1,850,000 Pipeline Value, 42 Total Leads, 28 Qualified, 14 Active Opportunities, 18 Proposals Generated, 3 Pending Approvals).
- [x] **MonthlyLeadGenerationChart (`MonthlyLeadGenerationChart.jsx`)**: Multi-series Recharts AreaChart with 6m/12m switch.
- [x] **LeadDistributionChart (`LeadDistributionChart.jsx`)**: Donut chart with Industry / Source toggles.
- [x] **OpportunityPipelineChart (`OpportunityPipelineChart.jsx`)**: Horizontal Funnel/Bar chart with conversion stages.
- [x] **AgentExecutionStatusWidget (`AgentExecutionStatusWidget.jsx`)**: Multi-agent telemetry widget monitoring Supervisor, Qualification, Intelligence, and Proposal agents.
- [x] **RecentProposalsTable (`RecentProposalsTable.jsx`)**: Proposals table with verified ROI and approval gates.
- [x] **RecentActivitiesFeed (`RecentActivitiesFeed.jsx`)**: Telemetry stream with category filtering.
- [x] **Quick Agent Workflows**: Prompt trigger cards dispatching to AI Workspace.

### ✅ Phase 3: AI Workspace & Execution Visualization (COMPLETED)
- [x] **WorkspacePromptBox (`WorkspacePromptBox.jsx`)**: Conversational prompt input with suggestion pills, tenant parameters (`org_demo`, `user_demo`), and auto-approve toggle.
- [x] **ExecutionTimeline (`ExecutionTimeline.jsx`)**: 6-stage visual pipeline progression tracker (User Request → Input Validation → Supervisor → Specialized Agent → Tool Execution → Evidence Validation → Final Result).
- [x] **SupervisorRoutingCard (`SupervisorRoutingCard.jsx`)**: Displays detected intent, routing rationale, confidence gauge, and entity badges.
- [x] **ToolExecutionTelemetry (`ToolExecutionTelemetry.jsx`)**: Table of mediated tool calls with latencies and statuses.
- [x] **EvidenceSourcesViewer (`EvidenceSourcesViewer.jsx`)**: Grounded Hybrid RAG document citations.
- [x] **StructuredResultCard (`StructuredResultCard.jsx`)**: Polymorphic card for Proposals, Qualifications, and Intelligence.
- [x] **Workspace Page (`Workspace.jsx`)**: End-to-end orchestration with live backend detection (`:8000`) and deterministic fallback.

### ✅ Phase 4: Leads & Customers Management (COMPLETED)
- [x] **LeadFilterBar (`LeadFilterBar.jsx`)**: Search input, status dropdown, industry dropdown, priority filter, and reset button.
- [x] **LeadTable (`LeadTable.jsx`)**: Leads table with BANT scores, status badges, and actions.
- [x] **Leads Page (`Leads.jsx`)**: KPI summary chips, filter bar, and CRM synchronized lead table (`LEAD-001`, `LEAD-002`, `LEAD-003`).
- [x] **LeadDetails Page (`LeadDetails.jsx`)**: Deep-dive lead dossier (overview, BANT scorecard, CRM timeline, proposal link).
- [x] **CustomerFilterBar (`CustomerFilterBar.jsx`)**: Search input, industry filter, and account tier filter.
- [x] **CustomerTable (`CustomerTable.jsx`)**: Customer accounts table with ARR, health score, and NPS.
- [x] **Customers Page (`Customers.jsx`)**: Top ARR metrics ($685K portfolio ARR, 90% avg health, 118% net retention), filter bar, and customer table.
- [x] **CustomerDetails Page (`CustomerDetails.jsx`)**: Account dossier (ARR, deals, QBR timeline, expansion signals).

### ✅ Phase 5: Sales Intelligence (COMPLETED)
- [x] **EntitySelector (`EntitySelector.jsx`)**: Quick target account switcher (Meridian FG, Apex Mfg) with re-analysis trigger.
- [x] **BusinessNeedsMatching (`BusinessNeedsMatching.jsx`)**: Business needs, pain points, and documented product match with citations.
- [x] **ObjectionPlaybook (`ObjectionPlaybook.jsx`)**: Objections and copyable talk tracks with citations.
- [x] **DiscoveryQuestions (`DiscoveryQuestions.jsx`)**: Persona-targeted discovery questions (Champion, CFO, CTO).
- [x] **RecommendedSalesActions (`RecommendedSalesActions.jsx`)**: Prioritized next best sales actions with execution CTAs.
- [x] **EvidenceCitationDrawer (`EvidenceCitationDrawer.jsx`)**: Traceable Hybrid RAG document citation cards.
- [x] **Intelligence Page (`Intelligence.jsx`)**: Complete assembled Sales Intelligence Workspace.

### ✅ Phase 6: Proposal Management (COMPLETED)
- [x] **ProposalFilterBar (`ProposalFilterBar.jsx`)**: Search by ID/customer/lead and filter by approval status (*Pending*, *Approved*, *Rejected*).
- [x] **ProposalTable (`ProposalTable.jsx`)**: Table displaying Proposal ID, Customer, Lead, Creation Date, Annual Value, Deterministic ROI, Workflow Status, Approval Status, with PPTX download and Gate actions.
- [x] **Proposals Page (`Proposals.jsx`)**: Top KPI summary cards ($935K Total Proposal Value, 2 Pending, 2 Approved, 255% Avg ROI) with Presentation adapter triggers.
- [x] **ProposalROISection (`ProposalROISection.jsx`)**:
  - Deterministic ROI scorecard (240% Annual ROI, $576K annual savings, 6.5mo payback period, $1,488,000 3-year cumulative net benefit).
  - Explicit financial model assumptions and mathematical formula audit strip.
- [x] **ProposalPricingTable (`ProposalPricingTable.jsx`)**:
  - Catalog-grounded pricing breakdown mapping to `PricingResult` (`PROD-REP-01`, `PROD-IMP-01`), unit prices, quantities, and first-year total ($265,000).
- [x] **ProposalImplementationTimeline (`ProposalImplementationTimeline.jsx`)**:
  - 8-Week phased rollout schedule mapping to `ImplementationMilestone` across 4 deliverable milestones.
- [x] **ProposalDraftEditModal (`ProposalDraftEditModal.jsx`)**:
  - Interactive editor allowing sales executives to adjust draft executive summary prose and deal notes before routing for approval.
- [x] **ProposalDetails Page (`ProposalDetails.jsx`)**:
  - Deep-dive proposal dossier with Executive Summary, Customer Problem, Proposed Architecture, Solution Components, Expected Benefits, ROI Engine, Pricing Table, Implementation Schedule, Traceable Evidence, and PPTX/DOCX export triggers.

### ✅ Phase 7: Approval Center (COMPLETED)
- [x] **ApprovalsFilterTabs (`ApprovalsFilterTabs.jsx`)**: Categorized status tabs (*Pending Signoff*, *Approved*, *Changes Requested*, *Rejected*, *All Requests*) with live badge counts.
- [x] **ApprovalCard (`ApprovalCard.jsx`)**: Displays proposal information, customer, pricing, deterministic ROI summary, evidence citations, calculation assumptions, policy gate reasons, and approval audit history.
- [x] **ApprovalDecisionModal (`ApprovalDecisionModal.jsx`)**: Interactive modal capturing reviewer feedback, decision notes, and policy gate release (`_route_approval` node) before triggering deck compilation.
- [x] **Approvals Page (`Approvals.jsx`)**: Complete human-in-the-loop decision center with state updates, audit recording, and filter logic.

### ✅ Phase 8: Document Library & Activity History (COMPLETED)
- [x] **Documents Page (`Documents.jsx`)**:
  - Displays all 7 sample documents from `data/sample_documents/` (`product_overview.md`, `pricing_guide.md`, `roi_assumptions.md`, `sales_reporting_guide.md`, `case_study.md`, `security_documentation.md`, `implementation_guide.md`).
  - Search by title and category filter tabs.
  - Interactive **Document Chunk Inspector Modal** viewing sample chunk contents and vector indexing store (`InMemoryDocumentStore + BM25`).
- [x] **Activities Page (`Activities.jsx`)**:
  - Full audit trail with correlation IDs (`req_...`), subsystem filter tabs, tool latency metrics (average 210ms), and execution status tags.

### ✅ Phase 9: FastAPI Backend Integration Adapter (COMPLETED)
- [x] **FastAPI Integration Layer (`fastapi_app.py`)**:
  - Created standalone HTTP adapter exposing all 12 requested endpoints without modifying agent core logic.
  - CORS enabled for frontend port `5173`.
  - Routes:
    - `POST /api/v1/agent/run` (executes `run_agent_workflow()`)
    - `GET /api/v1/agent/runs/{run_id}`
    - `GET /api/v1/leads`, `GET /api/v1/leads/{id}`
    - `GET /api/v1/customers`, `GET /api/v1/customers/{id}`
    - `GET /api/v1/proposals`, `GET /api/v1/proposals/{id}`, `POST /approve`, `POST /reject`
    - `GET /api/v1/documents`, `GET /api/v1/activities`, `GET /health`

### ✅ Phase 10: Responsive Testing, Verification & Final Polish (COMPLETED)
- [x] **Production Build Verified**: Executed `npm run build` in `frontend/` — transformed 2,160 modules with 0 errors and generated production bundle.
- [x] **Theme Consistency**: Verified light/dark theme CSS variables across all components.
- [x] **Governance Compliance**: Verified human-in-the-loop approval locks preventing client-side authorization bypass.

---

## 4. Directory Structure

```
ai_sales_agent/
├── app/                              # Existing Python Multi-Agent System (UNTOUCHED)
│   ├── agents/                       # Supervisor, Qualification, Intelligence, Proposal agents
│   ├── graph/                        # LangGraph StateGraph workflow
│   ├── database/                     # CRM repository & mock adapters
│   ├── services/                     # CRM & Pricing services
│   ├── tools/                        # CRM, RAG, ROI, Pricing, Presentation tools
│   └── main.py                       # Python workflow entry point
├── data/
│   └── sample_documents/             # 7 Enterprise RAG sample documents
├── fastapi_app.py                    # Standalone FastAPI integration adapter (Port 8000)
├── frontend/                         # Modern React.js (JSX) Enterprise Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Sidebar.jsx, TopNavbar.jsx
│   │   │   ├── dashboard/            # KPI cards, Recharts charts, Telemetry widgets
│   │   │   ├── agents/               # WorkspacePromptBox, ExecutionTimeline, StructuredResultCard
│   │   │   ├── leads/                # LeadFilterBar, LeadTable
│   │   │   ├── customers/            # CustomerFilterBar, CustomerTable
│   │   │   ├── intelligence/         # EntitySelector, NeedsMatching, ObjectionPlaybook
│   │   │   ├── proposals/            # ProposalTable, ProposalROISection, PricingTable, Timeline
│   │   │   ├── approvals/            # ApprovalsFilterTabs, ApprovalCard, DecisionModal
│   │   │   └── ui/                   # Button, Badge, Card, Input, Avatar, Skeleton, Tooltip
│   │   ├── pages/                    # 13 Complete Enterprise SaaS pages
│   │   ├── services/                 # Axios API clients & React Query hooks
│   │   ├── context/                  # ThemeContext (Light / Dark mode)
│   │   ├── layouts/                  # DashboardLayout shell
│   │   └── routes/                   # React Router DOM config
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── PROJECT_CONTEXT.md
```
