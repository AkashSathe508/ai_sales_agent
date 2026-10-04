"""
Unit tests for Supervisor Agent routing.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.agents.supervisor.agent import SupervisorAgent
from app.schemas import IntentType, SupervisorDecision


@pytest.fixture
def mock_llm():
    return MagicMock()


@pytest.mark.asyncio
async def test_supervisor_routes_qualification(mock_llm):
    mock_llm.structured_generate = AsyncMock(
        return_value=SupervisorDecision(
            intent=IntentType.QUALIFICATION,
            reason="User wants to qualify lead LEAD-001",
            confidence=0.95,
        )
    )
    agent = SupervisorAgent(llm_service=mock_llm)
    decision = await agent.route("Qualify lead LEAD-001 for us")
    assert decision.intent == IntentType.QUALIFICATION
    assert decision.confidence == 0.95


@pytest.mark.asyncio
async def test_supervisor_routes_proposal(mock_llm):
    mock_llm.structured_generate = AsyncMock(
        return_value=SupervisorDecision(
            intent=IntentType.PROPOSAL,
            reason="User requested a full sales proposal",
            confidence=0.92,
        )
    )
    agent = SupervisorAgent(llm_service=mock_llm)
    decision = await agent.route("Prepare a proposal for LEAD-001")
    assert decision.intent == IntentType.PROPOSAL
