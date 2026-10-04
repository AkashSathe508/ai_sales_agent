"""
Unit tests for Sales Intelligence Agent.
Verifies separation of CRM facts, document facts, and evidence IDs.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.agents.intelligence.agent import SalesIntelligenceAgent
from app.schemas import (
    CRMData,
    Evidence,
    LeadData,
    RetrievalMethod,
    SourceType,
    ToolResult,
)


@pytest.mark.asyncio
async def test_sales_intelligence_distinguishes_sources():
    mock_crm = MagicMock()
    lead = LeadData(
        lead_id="LEAD-001",
        company_name="Apex Logistics",
        industry="Logistics",
        pain_points=["Slow sales reports"],
    )
    mock_crm.get_full_lead_context = AsyncMock(
        return_value=ToolResult(
            tool_name="crm_tool",
            tool_call_id="c1",
            success=True,
            data=CRMData(lead=lead),
        )
    )

    mock_rag = MagicMock()
    ev = Evidence(
        evidence_id="ev_test_123",
        document_id="doc_1",
        chunk_id="chk_1",
        source="product_overview.md",
        title="SalesFlow Overview",
        content="Automates sales reporting reducing manual spreadsheets.",
        relevance_score=0.9,
        retrieval_method=RetrievalMethod.HYBRID,
    )
    mock_rag.search = AsyncMock(
        return_value=ToolResult(
            tool_name="rag_tool",
            tool_call_id="c2",
            success=True,
            data={"evidence": [ev], "evaluation": None},
        )
    )

    agent = SalesIntelligenceAgent(crm_tool=mock_crm, rag_tool=mock_rag)
    res = await agent.analyze("Analyze reporting needs", lead_id="LEAD-001")

    assert res.lead_id == "LEAD-001"
    assert len(res.insights) >= 2
    # Verify CRM insight has SourceType.CRM
    crm_insights = [i for i in res.insights if i.source_type == SourceType.CRM]
    assert len(crm_insights) > 0
    assert "Apex Logistics" in crm_insights[0].insight

    # Verify Document insight has SourceType.DOCUMENT and valid evidence_id
    doc_insights = [i for i in res.insights if i.source_type == SourceType.DOCUMENT]
    assert len(doc_insights) > 0
    assert "ev_test_123" in doc_insights[0].evidence_ids
