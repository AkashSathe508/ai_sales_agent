"""
SQLAlchemy ORM models for the Sales AI Platform.

All tenant-aware models include organization_id.
Document models include pgvector embeddings.
Audit-sensitive models include created_at/updated_at.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

# We conditionally import pgvector to allow unit tests without a real PG instance
try:
    from pgvector.sqlalchemy import Vector
    VECTOR_AVAILABLE = True
except ImportError:
    Vector = None
    VECTOR_AVAILABLE = False


def _uuid() -> str:
    return str(uuid.uuid4())


# ─────────────────────────────────────────────────────────────────────────────
# Organizations & Users
# ─────────────────────────────────────────────────────────────────────────────


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(256))
    settings: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(256), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[str] = mapped_column(String(64), default="sales_rep")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# CRM Entities
# ─────────────────────────────────────────────────────────────────────────────


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    company_name: Mapped[str] = mapped_column(String(256), nullable=False)
    industry: Mapped[Optional[str]] = mapped_column(String(128))
    company_size: Mapped[Optional[str]] = mapped_column(String(64))
    annual_revenue: Mapped[Optional[float]] = mapped_column(Float)
    contact_name: Mapped[Optional[str]] = mapped_column(String(256))
    contact_email: Mapped[Optional[str]] = mapped_column(String(256))
    contact_title: Mapped[Optional[str]] = mapped_column(String(256))
    pain_points: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    budget_range: Mapped[Optional[str]] = mapped_column(String(128))
    timeline: Mapped[Optional[str]] = mapped_column(String(128))
    current_solution: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(64), default="new")
    score: Mapped[Optional[int]] = mapped_column(Integer)
    meta_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    interactions: Mapped[list["Interaction"]] = relationship(
        back_populates="lead", lazy="select"
    )

    __table_args__ = (
        Index("ix_leads_org_status", "organization_id", "status"),
    )


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    company_name: Mapped[str] = mapped_column(String(256), nullable=False)
    industry: Mapped[Optional[str]] = mapped_column(String(128))
    contract_value: Mapped[Optional[float]] = mapped_column(Float)
    contact_name: Mapped[Optional[str]] = mapped_column(String(256))
    contact_email: Mapped[Optional[str]] = mapped_column(String(256))
    account_manager: Mapped[Optional[str]] = mapped_column(String(256))
    products: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    meta_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False)
    lead_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("leads.id"), nullable=True
    )
    customer_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("customers.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(256))
    title: Mapped[Optional[str]] = mapped_column(String(256))
    phone: Mapped[Optional[str]] = mapped_column(String(64))


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    stage: Mapped[str] = mapped_column(String(64), default="prospecting")
    value: Mapped[Optional[float]] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    lead_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("leads.id"), nullable=True
    )
    customer_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("customers.id"), nullable=True
    )
    probability: Mapped[Optional[float]] = mapped_column(Float)
    close_date: Mapped[Optional[str]] = mapped_column(String(32))
    meta_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False)
    type: Mapped[str] = mapped_column(String(64))  # call, email, meeting
    subject: Mapped[Optional[str]] = mapped_column(String(512))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    occurred_at: Mapped[Optional[str]] = mapped_column(String(32))
    lead_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("leads.id"), nullable=True
    )
    customer_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("customers.id"), nullable=True
    )

    lead: Mapped[Optional["Lead"]] = relationship(back_populates="interactions")


# ─────────────────────────────────────────────────────────────────────────────
# Documents & RAG
# ─────────────────────────────────────────────────────────────────────────────


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    source: Mapped[str] = mapped_column(String(1024))
    doc_type: Mapped[str] = mapped_column(String(64))  # product, case_study, pricing...
    meta_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    versions: Mapped[list["DocumentVersion"]] = relationship(
        back_populates="document", lazy="select"
    )


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("documents.id"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, default=1)
    content_hash: Mapped[Optional[str]] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    document: Mapped["Document"] = relationship(back_populates="versions")
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        back_populates="version", lazy="select"
    )


class DocumentChunk(Base):
    """
    A chunk of a document with pgvector embedding and FTS tsvector.

    Used by both semantic search (pgvector) and keyword search (FTS).
    """

    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    document_version_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("document_versions.id"), nullable=False
    )
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(1024))
    title: Mapped[str] = mapped_column(String(512))
    section: Mapped[Optional[str]] = mapped_column(String(512))
    page: Mapped[Optional[int]] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    meta_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # pgvector embedding — dimension set in migration, not here
    # We store as JSON list when pgvector is unavailable
    embedding_json: Mapped[Optional[list]] = mapped_column(JSON)

    # PostgreSQL FTS tsvector (populated by trigger or application)
    # We store raw for portability; actual TSVECTOR column in migrations
    fts_content: Mapped[Optional[str]] = mapped_column(Text)

    version: Mapped["DocumentVersion"] = relationship(back_populates="chunks")

    __table_args__ = (
        Index("ix_doc_chunks_org_doc", "organization_id", "document_id"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Proposals & Approvals
# ─────────────────────────────────────────────────────────────────────────────


class ProposalRecord(Base):
    __tablename__ = "proposals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    lead_id: Mapped[Optional[str]] = mapped_column(String(64))
    customer_id: Mapped[Optional[str]] = mapped_column(String(64))
    proposal_data: Mapped[Optional[dict]] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(64), default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class ApprovalRecord(Base):
    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False)
    proposal_id: Mapped[Optional[str]] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(256))
    status: Mapped[str] = mapped_column(String(64), default="pending")
    requested_by: Mapped[Optional[str]] = mapped_column(String(256))
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(256))
    reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


# ─────────────────────────────────────────────────────────────────────────────
# Pricing
# ─────────────────────────────────────────────────────────────────────────────


class PricingCatalog(Base):
    __tablename__ = "pricing_catalog"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    product_id: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    product_name: Mapped[str] = mapped_column(String(256), nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    pricing_version: Mapped[str] = mapped_column(String(64), default="v1")
    valid_until: Mapped[Optional[str]] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    meta_data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


# ─────────────────────────────────────────────────────────────────────────────
# Observability
# ─────────────────────────────────────────────────────────────────────────────


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    request_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(64))
    intent: Mapped[Optional[str]] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(64), default="running")
    latency_ms: Mapped[Optional[float]] = mapped_column(Float)
    input_query: Mapped[Optional[str]] = mapped_column(Text)
    errors: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


class ToolCallRecord(Base):
    __tablename__ = "tool_calls"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    agent_run_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("agent_runs.id"), nullable=False, index=True
    )
    tool_name: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(64))
    latency_ms: Mapped[Optional[float]] = mapped_column(Float)
    input_data: Mapped[Optional[dict]] = mapped_column(JSON)
    output_data: Mapped[Optional[dict]] = mapped_column(JSON)
    error: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(64), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(256), nullable=False)
    entity_type: Mapped[Optional[str]] = mapped_column(String(64))
    entity_id: Mapped[Optional[str]] = mapped_column(String(64))
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_audit_logs_org_action", "organization_id", "action"),
    )
