"""
FastAPI Integration Layer for AI Sales Intelligence & Proposal Automation Platform.

Acts strictly as the HTTP API integration adapter between the React.js
frontend and the underlying Python Multi-Agent LangGraph workflow.

Does NOT modify or duplicate agent business logic.
"""
from __future__ import annotations

import os
import uuid
import logging
from typing import Any, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AliasChoices, BaseModel, ConfigDict, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_app")

app = FastAPI(
    title="AI Sales Intelligence & Proposal Automation API",
    version="1.0.0",
    description="FastAPI Integration Adapter for React.js Frontend",
)

# Enable CORS for Vite frontend
_cors_origins = [origin.strip() for origin in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory execution store for agent runs
_AGENT_RUNS: dict[str, dict[str, Any]] = {}

# Seed CRM data for standalone integration fallback
_SEED_LEADS: dict[str, dict[str, Any]] = {
    "LEAD-001": {
        "lead_id": "LEAD-001",
        "company_name": "Meridian Financial Group",
        "industry": "Financial Services",
        "company_size": "500-1000 employees",
        "annual_revenue": 85000000.0,
        "contact_name": "Sarah Chen",
        "contact_email": "s.chen@meridianfg.com",
        "contact_title": "VP of Sales Operations",
        "pain_points": [
            "Manual sales reporting taking 3 days per month per rep",
            "No real-time pipeline visibility for leadership",
            "Inconsistent forecast accuracy (+/-40%)",
            "CRM data quality issues — reps not updating records",
            "Cannot correlate sales activity to revenue outcomes"
        ],
        "budget_range": "$150,000 - $300,000 annually",
        "timeline": "Q1 next year — board mandate for modernization",
        "current_solution": "Excel spreadsheets + Salesforce basic reporting",
        "status": "qualified",
        "score": 82,
        "assigned_to": "Marcus Vance",
        "created_at": "2024-01-15T08:00:00Z"
    },
    "LEAD-002": {
        "lead_id": "LEAD-002",
        "company_name": "TechVenture Scale",
        "industry": "Enterprise Software",
        "company_size": "150-300 employees",
        "annual_revenue": 22000000.0,
        "contact_name": "David Ross",
        "contact_email": "dross@techventurescale.io",
        "contact_title": "Head of Revenue Operations",
        "pain_points": [
            "Disjointed lead scoring across marketing and SDR teams",
            "SDRs spending 45% of time researching accounts instead of selling"
        ],
        "budget_range": "$50,000 - $100,000 annually",
        "timeline": "Next 60 days",
        "current_solution": "HubSpot CRM Free Tier",
        "status": "unqualified",
        "score": 41,
        "assigned_to": "Elena Rostova",
        "created_at": "2024-01-18T10:30:00Z"
    }
}

_SEED_CUSTOMERS: dict[str, dict[str, Any]] = {
    "CUSTOMER-001": {
        "customer_id": "CUSTOMER-001",
        "company_name": "Apex Manufacturing Corp",
        "industry": "Industrial / Manufacturing",
        "arr": 220000.0,
        "contract_start": "2022-03-01",
        "contract_end": "2025-03-01",
        "tier": "Enterprise Tier 2",
        "health_score": 87,
        "primary_contact": "Robert Kowalski (Director of IT)",
        "active_deals": 1,
        "expansion_potential": "$85,000 ARR (Field Operations Addon)"
    },
    "CUSTOMER-002": {
        "customer_id": "CUSTOMER-002",
        "company_name": "Global Logistics Partners",
        "industry": "Supply Chain & Freight",
        "arr": 465000.0,
        "contract_start": "2021-11-15",
        "contract_end": "2024-11-15",
        "tier": "Strategic Enterprise",
        "health_score": 94,
        "primary_contact": "Amanda Cruz (VP Digital Transformation)",
        "active_deals": 2,
        "expansion_potential": "$120,000 ARR (Multi-Region Global Rollout)"
    }
}

# In-memory proposal store
_PROPOSALS: dict[str, dict[str, Any]] = {
    "PROP-2024-001": {
        "id": "PROP-2024-001",
        "customer": "Meridian Financial Group",
        "leadId": "LEAD-001",
        "createdDate": "2024-01-18",
        "annualValue": 240000,
        "formattedValue": "$240,000 / yr",
        "status": "Pending Review",
        "approvalStatus": "Pending Signoff",
        "requiresGate": "Executive Approval required before PPTX generation",
        "executiveSummary": "Meridian Financial Group is experiencing critical sales inefficiencies due to manual pipeline reporting across 50 sales reps. We propose deploying the AI Sales Intelligence & Reporting Automation Suite with deterministic ROI tracking and automated presentation generation.",
        "solutionComponents": [
            {
                "name": "Automated CRM Sync & Pipeline Health Engine",
                "description": "Continuous telemetry extraction and anomaly detection for pipeline changes.",
                "status": "Production Ready"
            },
            {
                "name": "Deterministic ROI Calculation Service",
                "description": "Strict mathematical modeling of rep labor savings with auditable formulas.",
                "status": "Production Ready"
            },
            {
                "name": "Automated PPTX Presentation Builder",
                "description": "Transforms validated proposal schemas into 8-slide branded client decks.",
                "status": "Requires Human Gate"
            }
        ],
        "roi": {
            "reps": 50,
            "hoursSavedPerMonth": 24,
            "hourlyRate": 125,
            "annualSoftwareCost": 240000,
            "grossAnnualSavings": 816000,
            "netAnnualSavings": 576000,
            "roiPercentage": 240.0,
            "paybackMonths": 6.5
        },
        "pricing": [
            {
                "code": "PROD-REP-01",
                "name": "Sales Reporting Automation Engine",
                "qty": 50,
                "unitPrice": 4000,
                "totalPrice": 200000,
                "billingPeriod": "Annual"
            },
            {
                "code": "PROD-IMP-01",
                "name": "Enterprise Setup & Custom Ingestion",
                "qty": 1,
                "unitPrice": 40000,
                "totalPrice": 40000,
                "billingPeriod": "One-time"
            }
        ],
        "assumptions": [
            "50 sales reps with 24 hours/month saved per rep.",
            "Rep loaded labor cost of $125/hour.",
            "Standard enterprise SLA and support included."
        ],
        "evidence": [
            {"source": "roi_assumptions.md #chunk-2", "relevance": 0.94},
            {"source": "pricing_guide.md #chunk-1", "relevance": 0.91}
        ]
    }
}


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Schemas
# ─────────────────────────────────────────────────────────────────────────────

class AgentRunRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    query: str = Field(..., min_length=3, max_length=2000, description="User prompt or sales action instruction")
    organization_id: Optional[str] = Field(None, validation_alias=AliasChoices("organization_id", "organizationId"), description="Multi-tenant Organization ID")
    user_id: Optional[str] = Field(None, validation_alias=AliasChoices("user_id", "userId"), description="User ID")
    auto_approve: Optional[bool] = Field(False, validation_alias=AliasChoices("auto_approve", "autoApprove"), description="Whether to automatically bypass approval gate")


class ApprovalActionRequest(BaseModel):
    reason: Optional[str] = Field(None, description="Reviewer feedback or notes")
    reviewer: Optional[str] = Field("Executive Reviewer", description="Approver name/title")


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint for integration testing."""
    return {
        "status": "healthy",
        "agent_backend": "LangGraph StateGraph",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/v1/agent/run")
async def run_agent(
    req: AgentRunRequest,
    x_organization_id: Optional[str] = Header("org_demo"),
    x_user_id: Optional[str] = Header("user_demo"),
):
    """
    Execute the Python multi-agent LangGraph workflow.
    Dispatches query through Supervisor Agent -> Specialized Agents -> Tools.
    """
    org_id = req.organization_id or x_organization_id or "org_demo"
    usr_id = req.user_id or x_user_id or "user_demo"

    # Try executing the real Python agent workflow
    try:
        from app.main import run_agent_workflow
        result = await run_agent_workflow(
            query=req.query,
            organization_id=org_id,
            user_id=usr_id,
            approve_automatically=req.auto_approve or False,
        )
        run_id = result.get("agent_run_id") or f"run_{uuid.uuid4().hex[:8]}"
        _AGENT_RUNS[run_id] = result
        if result.get("errors"):
            logger.error("Agent workflow returned errors", errors=result["errors"], run_id=run_id)
            # The request passed schema validation; this is a server/workflow failure,
            # not a client-side 422 validation error.
            raise HTTPException(status_code=503, detail="Agent workflow failed. Check backend logs and dependencies.")
        return {
            "run_id": run_id,
            "status": "completed" if not result.get("errors") else "error",
            "result": result
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Agent workflow invocation failed")
        raise HTTPException(status_code=503, detail="Agent workflow is temporarily unavailable") from exc


@app.get("/api/v1/agent/runs/{run_id}")
async def get_agent_run(run_id: str):
    """Retrieve the execution payload of a specific agent run."""
    run = _AGENT_RUNS.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Agent run {run_id} not found")
    return {"run_id": run_id, "result": run}


@app.get("/api/v1/leads")
async def get_leads(organization_id: Optional[str] = "org_demo"):
    """Retrieve all leads in the CRM repository."""
    leads = list(_SEED_LEADS.values())
    return {"leads": leads, "total": len(leads)}


@app.get("/api/v1/leads/{lead_id}")
async def get_lead_details(lead_id: str, organization_id: Optional[str] = "org_demo"):
    """Retrieve detailed dossier for a specific lead."""
    if lead_id in _SEED_LEADS:
        return {"lead": _SEED_LEADS[lead_id], "interactions": []}
    raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")


@app.get("/api/v1/customers")
async def get_customers(organization_id: Optional[str] = "org_demo"):
    """Retrieve all customers in the CRM repository."""
    customers = list(_SEED_CUSTOMERS.values())
    return {"customers": customers, "total": len(customers)}


@app.get("/api/v1/customers/{customer_id}")
async def get_customer_details(customer_id: str, organization_id: Optional[str] = "org_demo"):
    """Retrieve detailed dossier for a specific customer."""
    if customer_id in _SEED_CUSTOMERS:
        return {"customer": _SEED_CUSTOMERS[customer_id], "interactions": []}
    raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")


@app.get("/api/v1/proposals")
async def get_proposals():
    """Retrieve all proposals."""
    return {"proposals": list(_PROPOSALS.values())}


@app.get("/api/v1/proposals/{proposal_id}")
async def get_proposal(proposal_id: str):
    """Retrieve proposal details."""
    prop = _PROPOSALS.get(proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
    return prop


@app.post("/api/v1/proposals/{proposal_id}/approve")
async def approve_proposal(proposal_id: str, req: ApprovalActionRequest):
    """Approve a proposal, lifting the backend policy gate."""
    prop = _PROPOSALS.get(proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
    
    prop["status"] = "Approved"
    prop["approvalStatus"] = "Approved"
    prop["approvalHistory"] = prop.get("approvalHistory", []) + [{
        "action": "Approved",
        "reviewer": req.reviewer,
        "notes": req.reason,
        "timestamp": datetime.utcnow().isoformat()
    }]
    return {"status": "success", "proposal": prop}


@app.post("/api/v1/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str, req: ApprovalActionRequest):
    """Reject a proposal according to governance rules."""
    prop = _PROPOSALS.get(proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
    
    prop["status"] = "Rejected"
    prop["approvalStatus"] = "Rejected"
    prop["approvalHistory"] = prop.get("approvalHistory", []) + [{
        "action": "Rejected",
        "reviewer": req.reviewer,
        "notes": req.reason,
        "timestamp": datetime.utcnow().isoformat()
    }]
    return {"status": "success", "proposal": prop}


@app.get("/api/v1/documents")
async def get_documents():
    """Retrieve knowledge documents indexed in the Hybrid RAG engine."""
    sample_docs_dir = os.path.join(os.path.dirname(__file__), "data", "sample_documents")
    docs = []
    if os.path.exists(sample_docs_dir):
        for fname in os.listdir(sample_docs_dir):
            if fname.endswith(".md"):
                fpath = os.path.join(sample_docs_dir, fname)
                size = os.path.getsize(fpath)
                docs.append({
                    "name": fname,
                    "type": "Markdown (.md)",
                    "size_bytes": size,
                    "indexed": True,
                    "store": "InMemoryDocumentStore + BM25"
                })
    return {"documents": docs}


@app.get("/api/v1/activities")
async def get_activities():
    """Retrieve audit events and telemetry."""
    return {
        "activities": [
            {
                "id": "ACT-9081",
                "correlationId": "req_b48f912e",
                "agent": "Supervisor Agent",
                "action": "Query intent classified as 'lead_qualification'",
                "entity": "LEAD-001",
                "status": "Success",
                "duration": "420ms",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
    }


if __name__ != "__main__":
    # Keep the API importable without launching a development server.
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
