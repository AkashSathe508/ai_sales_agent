"""
Supervisor Agent.

Responsibilities:
1. Receive user request.
2. Classify intent (QUALIFICATION / PROPOSAL / INTELLIGENCE).
3. Return structured SupervisorDecision.
4. Provide routing target to the LangGraph orchestrator.

The Supervisor does NOT:
- Query CRM
- Query databases
- Calculate ROI
- Retrieve documents
- Generate proposals
- Call MCP
- Invent facts

It ONLY classifies and routes.
"""
from __future__ import annotations

import time

from app.agents.supervisor.prompts import (
    SUPERVISOR_SYSTEM_PROMPT,
    SUPERVISOR_USER_TEMPLATE,
)
from app.exceptions import RoutingError, StructuredOutputError
from app.llm.service import LLMService, create_llm_service
from app.observability.logging import get_logger
from app.observability.metrics import agent_runs_total, agent_run_latency_seconds
from app.schemas import IntentType, SupervisorDecision

logger = get_logger(__name__)

AGENT_NAME = "supervisor"


class SupervisorAgent:
    """
    Routes user requests to the appropriate specialized agent.

    Accepts an LLMService via dependency injection so the LLM
    provider can be replaced without changing this class.
    """

    def __init__(self, llm_service: LLMService | None = None) -> None:
        self._llm = llm_service or create_llm_service(agent_name=AGENT_NAME)

    async def route(self, query: str, context: dict | None = None) -> SupervisorDecision:
        """
        Classify the user query and return a routing decision.

        Args:
            query: Natural language user request
            context: Optional additional context (organization, user, etc.)

        Returns:
            SupervisorDecision with intent, reason, confidence, and sub_intents

        Raises:
            RoutingError: If intent cannot be determined
        """
        start = time.time()
        logger.info("Supervisor routing request", query_preview=query[:80])

        messages = [
            {
                "role": "user",
                "content": SUPERVISOR_USER_TEMPLATE.format(query=query),
            }
        ]

        try:
            decision = await self._llm.structured_generate(
                messages=messages,
                output_schema=SupervisorDecision,
                system_prompt=SUPERVISOR_SYSTEM_PROMPT,
            )

            # Validate confidence floor
            if decision.confidence < 0.3:
                logger.warning(
                    "Low confidence routing decision",
                    intent=decision.intent,
                    confidence=decision.confidence,
                )

            latency = (time.time() - start) * 1000
            logger.info(
                "Supervisor routing complete",
                intent=decision.intent,
                confidence=f"{decision.confidence:.2f}",
                latency_ms=f"{latency:.0f}",
            )

            agent_runs_total.labels(
                agent=AGENT_NAME,
                intent=decision.intent,
                status="success",
            ).inc()
            agent_run_latency_seconds.labels(agent=AGENT_NAME).observe(
                (time.time() - start)
            )

            return decision

        except StructuredOutputError as exc:
            logger.error("Supervisor failed to parse structured output", error=str(exc))
            agent_runs_total.labels(
                agent=AGENT_NAME, intent="unknown", status="error"
            ).inc()
            # Return a safe default rather than crashing
            return SupervisorDecision(
                intent=IntentType.INTELLIGENCE,
                reason=f"Routing failed due to output parsing error. Defaulting to intelligence. Error: {exc}",
                confidence=0.1,
            )
        except Exception as exc:
            agent_runs_total.labels(
                agent=AGENT_NAME, intent="unknown", status="error"
            ).inc()
            raise RoutingError(
                f"Supervisor agent failed: {exc}",
                details={"query": query[:200]},
            ) from exc
