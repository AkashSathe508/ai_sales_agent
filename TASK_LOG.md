# Task Log — Frontend / Backend Integration and QA

Main task: connect the React frontend to the FastAPI/LangGraph backend, repair defects found in the repo, perform QA checks, and improve production readiness. Updated during implementation.

## Progress

- [x] 2026-11-20 — Repository inventory: React/Vite frontend, FastAPI adapter (`fastapi_app.py`), LangGraph workflow (`app/main.py`), existing pytest suite, no repository `AGENTS.md` found.
- [x] 2026-11-20 — Fixed API run request validation (3–2,000 characters), removed simulated agent success fallback, returned meaningful backend errors, and replaced wildcard credentialed CORS with configurable `CORS_ORIGINS` (safe localhost defaults).
- [x] 2026-11-20 — Workspace now calls `/health` and the live agent endpoint, sends snake_case request fields, unwraps the response, and surfaces errors. Removed fake-run fallback data and corrected actual intent/decision rendering; missing numbers no longer display invented values.
- [x] 2026-11-20 — Leads, customers, proposals, documents, and activities views now load API data with loading/error states. Document upload is clearly disabled because the backend does not implement it.
- [x] 2026-11-20 — Approval queue now reads proposal records from the API and persists approve/reject decisions; “request changes” is identified as unsupported by the current API.
- [x] 2026-11-20 — Activities view reads the activities API; removed unused local activity fixture data.
- [x] 2026-11-20 — `python -m py_compile fastapi_app.py`: passed.
- [x] 2026-11-20 — Final `npm run build`: passed; large-chunk advisory remains.
- [ ] Install the project's Python dependencies in an available environment and rerun the backend suite; current environment lacks `litellm`, `structlog`, and other declared packages.
- [x] 2026-11-20 — Follow-up QA: corrected agent workflow failures that were mislabeled as HTTP 422; only schema validation should return 422, while an accepted request that fails during execution returns 503 and logs the backend error. Frontend now normalizes the request contract and displays FastAPI validation details.
- [x] 2026-11-20 — Follow-up QA: accepted both camelCase and snake_case API fields for compatibility with an already-running/older frontend, declared FastAPI/Uvicorn in both backend dependency manifests, and added a working seeded-lead sample request plus frontend/API setup instructions to README.
- [ ] Replace remaining demo data in dashboard, lead/customer/proposal detail pages, and Intelligence page; these pages remain outside the completed API wiring.

## QA Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| QA-01 | High | Workspace expected an agent result at top level but API wraps it under `result`. | Fixed — response envelope unwrapped |
| QA-02 | High | Agent endpoint returned fabricated success after workflow failures. | Fixed — workflow failures return HTTP errors |
| QA-03 | Medium | `HEAD /docs` with `no-cors` was used as backend health. | Fixed — UI checks `/health` via API client |
| QA-04 | High | CORS allowed every origin together with credentials. | Fixed — configurable allowlist, localhost defaults |
| QA-05 | High | Leads/customers/proposals/activities/approvals used local fixture data. | Fixed — API-backed; unsupported request-changes action is called out |
| QA-06 | Medium | Document upload UI called an endpoint absent from the backend. | Fixed — control disabled and limitation stated |
| QA-07 | Medium | Result panels showed invented metrics when the backend omitted values. | Fixed — render unavailable values without fake metrics |
| QA-08 | Medium | Frontend production bundle exceeds Vite's 500 kB chunk warning threshold. | Open — build succeeds; code splitting recommended |
| QA-09 | High | Dashboard and several detail/intelligence screens still present hard-coded demo data. | Open |
| QA-10 | High | Backend uses process-local dictionaries for run/CRM/proposal state and has no authentication/authorization. | Open — requires infrastructure and identity decisions |
| QA-11 | High | Internal agent exceptions were translated into HTTP 422, obscuring the distinction between invalid input and unavailable workflow dependencies. | Fixed — returns 503 and logs internal error details |
| QA-12 | High | Older clients sending camelCase organization/user/approval fields were not accepted by the request model. | Fixed — request schema accepts both naming styles |

## Test Runs

- 2026-11-20 — Final `npm run build` (frontend): passed; Vite reports a 986.24 kB minified JS chunk (>500 kB advisory).
- 2026-11-20 — `python -m pytest tests/ -q`: blocked during collection (0 tests ran; 11 collection errors) because this environment lacks project dependencies including `litellm` and `structlog`.
- 2026-11-20 — `python -m py_compile fastapi_app.py`: passed.
- 2026-11-20 — Confirmed the frontend submits `query` as a trimmed string with canonical snake_case fields. The agent service catches runtime failures and returns them in `errors`; previously this code mislabeled those failures as 422. Runtime success still depends on installing project backend dependencies.
- 2026-11-20 — Validated the request model accepts the camelCase payload shape too; Python syntax check and frontend production build passed.

## Scope Notes

Production readiness is not yet achieved. External CRM, durable database, authentication/authorization, deployment infrastructure, and live model credentials are not present. API run storage and CRM/proposal stores are in-memory. The dashboard, several detail/intelligence pages, and presentation download remain demo-only/unsupported. Full readiness requires those open items and a passing backend suite in a fully provisioned environment.
