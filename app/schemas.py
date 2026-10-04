"""
Core shared schemas used throughout the system.

These are the canonical Pydantic v2 data models that flow through
the agent graph state. Each agent produces typed outputs;
no raw LLM prose is propagated unvalidated.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


# ─────────────────────────────────────────────────────────────────────────────
# Enumerations
# ─────────────────────────────────────────────────────────────────────────────


class IntentType(str, Enum):
    """Supervisor-determined intent types."""

    QUALIFICATION = "qualification"
    PROPOSAL = "proposal"
    INTELLIGENCE = "intelligence"
    UNKNOWN = "unknown"


class ApprovalStatus(str, Enum):
    """Lifecycle states of a human approval request."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class RetrievalMethod(str, Enum):
    """How a document chunk was retrieved."""

    SEMANTIC = "semantic"
    KEYWORD = "keyword"
    HYBRID = "hybrid"


class EvidenceAction(str, Enum):
    """Self-RAG recommended action after evidence evaluation."""

    ACCEPT = "accept"
    RETRIEVE_MORE = "retrieve_more"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"


class SourceType(str, Enum):
    """Origin of a piece of information in an insight."""

    CRM = "crm"
    DOCUMENT = "document"
    DERIVED = "derived"


# ─────────────────────────────────────────────────────────────────────────────
# Evidence
# ─────────────────────────────────────────────────────────────────────────────


class Evidence(BaseModel):
    """
    A traceable piece of evidence from a retrieved document chunk.

    Every important document-derived claim must reference an evidence_id
    so the entire answer can be audited back to source documents.
    """

    evidence_id: str = Field(default_factory=lambda: f"ev_{uuid.uuid4().hex[:10]}")
    document_id: str
    chunk_id: str
    source: str  # file path, URL, or document title
    title: str
    content: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    retrieval_method: RetrievalMethod
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"use_enum_values": True}


# ─────────────────────────────────────────────────────────────────────────────
# Supervisor
# ─────────────────────────────────────────────────────────────────────────────


class SupervisorDecision(BaseModel):
    """
    Structured output from the Supervisor Agent.

    The supervisor only classifies intent and routes — it does NOT
    retrieve data, calculate ROI, or generate proposals.
    """

    intent: IntentType
    reason: str = Field(description="Explanation for the routing decision")
    confidence: float = Field(ge=0.0, le=1.0)
    sub_intents: list[IntentType] = Field(
        default_factory=list,
        description="Secondary intents when multiple workflows are needed",
    )

    model_config = {"use_enum_values": True}


# ─────────────────────────────────────────────────────────────────────────────
# CRM Data Transfer Objects
# ─────────────────────────────────────────────────────────────────────────────


class LeadData(BaseModel):
    """Lead entity returned by CRM Tool."""

    lead_id: str
    company_name: str
    industry: str | None = None
    company_size: str | None = None
    annual_revenue: float | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    contact_title: str | None = None
    pain_points: list[str] = Field(default_factory=list)
    budget_range: str | None = None
    timeline: str | None = None
    current_solution: str | None = None
    status: str = "new"
    score: int | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class CustomerData(BaseModel):
    """Customer entity returned by CRM Tool."""

    customer_id: str
    company_name: str
    industry: str | None = None
    contract_value: float | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    account_manager: str | None = None
    products: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class DealData(BaseModel):
    """Deal entity returned by CRM Tool."""

    deal_id: str
    name: str
    stage: str
    value: float | None = None
    currency: str = "USD"
    lead_id: str | None = None
    customer_id: str | None = None
    probability: float | None = None
    close_date: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class InteractionData(BaseModel):
    """Interaction record returned by CRM Tool."""

    interaction_id: str
    type: str  # call, email, meeting
    subject: str | None = None
    notes: str | None = None
    occurred_at: str | None = None
    lead_id: str | None = None
    customer_id: str | None = None


class CRMData(BaseModel):
    """Aggregated CRM data for an agent run."""

    lead: LeadData | None = None
    customer: CustomerData | None = None
    deal: DealData | None = None
    interactions: list[InteractionData] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Qualification
# ─────────────────────────────────────────────────────────────────────────────


class QualificationResult(BaseModel):
    """
    Structured output from the Qualification Agent.

    NEVER contains invented CRM facts. Missing information is explicitly listed.
    """

    lead_id: str
    company_summary: str
    pain_points: list[str] = Field(default_factory=list)
    budget: str | None = None  # None means unknown, not "no budget"
    timeline: str | None = None
    qualification_factors: dict[str, Any] = Field(default_factory=dict)
    risks: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    recommendation: str
    evidence: list[Evidence] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)


# ─────────────────────────────────────────────────────────────────────────────
# Sales Intelligence
# ─────────────────────────────────────────────────────────────────────────────


class SalesInsight(BaseModel):
    """
    A single structured insight combining CRM facts, document evidence,
    and LLM reasoning.

    source_type distinguishes verified CRM data from document-derived claims.
    """

    insight: str
    category: str  # e.g. "competitive", "pain_point", "opportunity"
    source_type: SourceType
    evidence_ids: list[str] = Field(
        default_factory=list,
        description="Reference to Evidence.evidence_id values",
    )
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str

    model_config = {"use_enum_values": True}


class IntelligenceResult(BaseModel):
    """Structured output from the Sales Intelligence Agent."""

    lead_id: str | None = None
    customer_id: str | None = None
    insights: list[SalesInsight] = Field(default_factory=list)
    crm_facts: dict[str, Any] = Field(default_factory=dict)
    document_facts: list[str] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    summary: str
    recommended_actions: list[str] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# ROI
# ─────────────────────────────────────────────────────────────────────────────


class ROIInputs(BaseModel):
    """Validated inputs for deterministic ROI calculation."""

    current_cost: float = Field(gt=0, description="Annual current cost in USD")
    implementation_cost: float = Field(ge=0, description="One-time implementation cost")
    expected_savings_pct: float = Field(
        ge=0.0, le=1.0, description="Expected savings as fraction (e.g. 0.30 = 30%)"
    )
    time_period_years: int = Field(ge=1, le=10, description="Analysis period in years")
    additional_revenue: float = Field(default=0.0, ge=0)
    ongoing_cost: float = Field(default=0.0, ge=0, description="Annual ongoing cost")

    @field_validator("expected_savings_pct")
    @classmethod
    def validate_savings(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("expected_savings_pct must be between 0.0 and 1.0")
        return v


class ROIResult(BaseModel):
    """
    Validated, deterministic ROI result.
    All values are produced by Python calculator — never by LLM.
    """

    inputs: ROIInputs
    annual_savings: float
    net_benefit: float
    roi_percentage: float
    payback_period_years: float | None = None
    three_year_benefit: float
    five_year_benefit: float | None = None
    assumptions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    formulas: dict[str, str] = Field(
        default_factory=dict,
        description="Explicit formula descriptions for auditability",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Pricing
# ─────────────────────────────────────────────────────────────────────────────


class PricingResult(BaseModel):
    """
    Validated pricing result.
    LLMs NEVER generate pricing — only retrieve from repository.
    """

    product_id: str
    product_name: str
    quantity: int = Field(ge=1)
    unit_price: float = Field(ge=0)
    discount_pct: float = Field(ge=0.0, le=1.0, default=0.0)
    total_price: float = Field(ge=0)
    currency: str = "USD"
    pricing_version: str
    valid_until: str | None = None
    notes: str | None = None
    warnings: list[str] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Proposal
# ─────────────────────────────────────────────────────────────────────────────


class SolutionComponent(BaseModel):
    product_id: str
    product_name: str
    description: str
    pricing: PricingResult | None = None


class ImplementationMilestone(BaseModel):
    milestone: str
    duration_weeks: int
    deliverables: list[str] = Field(default_factory=list)


class Proposal(BaseModel):
    """
    Fully validated proposal.

    Built from data → Pydantic → validation → generation.
    Never generated as raw LLM prose first.
    """

    proposal_id: str = Field(default_factory=lambda: f"prop_{uuid.uuid4().hex[:10]}")
    customer_information: dict[str, Any]
    executive_summary: str
    customer_problem: str
    proposed_solution: str
    solution_components: list[SolutionComponent] = Field(default_factory=list)
    implementation_plan: list[ImplementationMilestone] = Field(default_factory=list)
    expected_benefits: list[str] = Field(default_factory=list)
    roi: ROIResult | None = None
    pricing: list[PricingResult] = Field(default_factory=list)
    total_investment: float | None = None
    assumptions: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1

    model_config = {"use_enum_values": True}


# ─────────────────────────────────────────────────────────────────────────────
# Approval
# ─────────────────────────────────────────────────────────────────────────────


class ApprovalState(BaseModel):
    """
    Tracks human approval for sensitive customer-facing actions.
    Used as a LangGraph interrupt checkpoint.
    """

    approval_id: str = Field(default_factory=lambda: f"appr_{uuid.uuid4().hex[:10]}")
    approval_required: bool
    status: ApprovalStatus = ApprovalStatus.PENDING
    action: str
    proposal_id: str | None = None
    requested_by: str | None = None
    reviewed_by: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: datetime | None = None
    reason: str | None = None
    notes: str | None = None

    model_config = {"use_enum_values": True}


# ─────────────────────────────────────────────────────────────────────────────
# Presentation
# ─────────────────────────────────────────────────────────────────────────────


class PresentationRequest(BaseModel):
    """Request to generate a PPTX presentation via MCP gateway."""

    presentation_id: str = Field(
        default_factory=lambda: f"pres_{uuid.uuid4().hex[:10]}"
    )
    title: str
    subtitle: str | None = None
    proposal_id: str | None = None
    slides: list[dict[str, Any]] = Field(default_factory=list)
    template: str = "default"
    output_format: str = "pptx"
    requested_by: str | None = None


class PresentationResult(BaseModel):
    """Result from presentation generation."""

    presentation_id: str
    status: str
    file_path: str | None = None
    file_size_bytes: int | None = None
    slide_count: int = 0
    errors: list[str] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Tool Results
# ─────────────────────────────────────────────────────────────────────────────


class ToolResult(BaseModel):
    """
    Generic wrapper for tool execution results.
    Preserves metadata needed for observability.
    """

    tool_name: str
    tool_call_id: str
    success: bool
    data: Any | None = None
    error: str | None = None
    latency_ms: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


# ─────────────────────────────────────────────────────────────────────────────
# Self-RAG
# ─────────────────────────────────────────────────────────────────────────────


class EvidenceEvaluation(BaseModel):
    """
    Self-RAG evaluation output.

    Determines whether retrieved evidence is sufficient to ground a response.
    This is NOT a business agent — it is a quality gate on the RAG pipeline.
    """

    relevant: bool
    sufficient: bool
    missing_information: list[str] = Field(default_factory=list)
    unsupported_claims: list[str] = Field(default_factory=list)
    recommended_action: EvidenceAction
    evidence_ids: list[str] = Field(default_factory=list)
    reasoning: str

    model_config = {"use_enum_values": True}


__all__ = [
    "IntentType",
    "ApprovalStatus",
    "RetrievalMethod",
    "EvidenceAction",
    "SourceType",
    "Evidence",
    "SupervisorDecision",
    "LeadData",
    "CustomerData",
    "DealData",
    "InteractionData",
    "CRMData",
    "QualificationResult",
    "SalesInsight",
    "IntelligenceResult",
    "ROIInputs",
    "ROIResult",
    "PricingResult",
    "SolutionComponent",
    "ImplementationMilestone",
    "Proposal",
    "ApprovalState",
    "PresentationRequest",
    "PresentationResult",
    "ToolResult",
    "EvidenceEvaluation",
]
