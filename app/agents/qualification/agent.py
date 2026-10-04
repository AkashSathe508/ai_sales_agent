"""
Qualification Agent.

Responsibilities:
1. Retrieve lead data and interaction history through CRM Tool.
2. Analyze company size, budget, timeline, pain points, and risks.
3. Explicitly detect missing information (zero hallucination).
4. Produce structured QualificationResult.

Critical Rule:
NEVER invent CRM information. If data is missing in CRM, record it in
missing_information and do NOT invent values.
"""
from __future__ import annotations

import time
from typing import Any

from app.agents.qualification.prompts import (
    QUALIFICATION_SYSTEM_PROMPT,
    QUALIFICATION_USER_PROMPT,
)
from app.exceptions import AgentError, CRMNotFoundError
from app.llm.service import LLMService, create_llm_service
from app.observability.logging import get_logger
from app.observability.metrics import agent_run_latency_seconds, agent_runs_total
from app.schemas import CRMData, LeadData, QualificationResult
from app.tools.crm.tool import CRMTool

logger = get_logger(__name__)

AGENT_NAME = "qualification"


class QualificationAgent:
    """
    Evaluates sales leads against qualification criteria using strictly verified CRM data.
    """

    def __init__(
        self,
        crm_tool: CRMTool | None = None,
        llm_service: LLMService | None = None,
    ) -> None:
        self._crm = crm_tool or CRMTool()
        self._llm = llm_service or create_llm_service(agent_name=AGENT_NAME)

    async def qualify_lead(
        self,
        lead_id: str,
        organization_id: str = "org-default",
        user_query: str = "",
    ) -> QualificationResult:
        """
        Qualify a sales lead based strictly on CRM facts.

        Args:
            lead_id: ID of the lead in CRM (e.g., LEAD-001)
            organization_id: Multi-tenant organization scope
            user_query: Optional user context/instruction

        Returns:
            QualificationResult strictly grounded in CRM data.

        Raises:
            CRMNotFoundError: If lead is not found
            AgentError: If qualification execution fails
        """
        start = time.time()
        logger.info(
            "Starting lead qualification",
            lead_id=lead_id,
            organization_id=organization_id,
        )

        # 1. Retrieve full lead context from CRM Tool
        crm_result = await self._crm.get_full_lead_context(
            lead_id=lead_id, organization_id=organization_id
        )

        if not crm_result.success or not crm_result.data:
            err_msg = crm_result.error or f"Lead {lead_id} not found"
            logger.error("Failed to retrieve CRM data for qualification", error=err_msg)
            raise CRMNotFoundError("Lead", lead_id)

        crm_data: CRMData = (
            crm_result.data
            if isinstance(crm_result.data, CRMData)
            else CRMData.model_validate(crm_result.data)
        )
        lead: LeadData | None = crm_data.lead

        if not lead:
            raise CRMNotFoundError("Lead", lead_id)

        # 2. Format interaction summary
        interactions_summary = (
            "\n".join(
                f"- [{i.occurred_at or 'Unknown'}] ({i.type}) {i.subject or ''}: {i.notes or ''}"
                for i in crm_data.interactions
            )
            if crm_data.interactions
            else "No prior interactions logged."
        )

        user_content = QUALIFICATION_USER_PROMPT.format(
            lead_id=lead.lead_id,
            company_name=lead.company_name,
            industry=lead.industry or "Not specified",
            company_size=lead.company_size or "Not specified",
            annual_revenue=(
                f"${lead.annual_revenue:,.2f}" if lead.annual_revenue else "Not specified"
            ),
            contact_name=lead.contact_name or "Not specified",
            contact_title=lead.contact_title or "Not specified",
            contact_email=lead.contact_email or "Not specified",
            current_solution=lead.current_solution or "Not specified",
            pain_points=", ".join(lead.pain_points) if lead.pain_points else "None listed",
            budget_range=lead.budget_range or "Not specified",
            timeline=lead.timeline or "Not specified",
            status=lead.status,
            score=str(lead.score) if lead.score is not None else "Not scored",
            interactions_summary=interactions_summary,
            user_query=user_query or "Standard qualification assessment requested.",
        )

        messages = [{"role": "user", "content": user_content}]

        try:
            result = await self._llm.structured_generate(
                messages=messages,
                output_schema=QualificationResult,
                system_prompt=QUALIFICATION_SYSTEM_PROMPT,
            )

            # 3. Post-validation grounding guard: verify missing CRM fields are in missing_information
            missing_info_set = set(result.missing_information)

            if not lead.budget_range and not result.budget:
                missing_info_set.add("Budget range is not recorded in CRM")
            elif not lead.budget_range and result.budget and result.budget.lower() not in {"unknown", "not specified"}:
                # Override hallucinated budget if lead had None
                result.budget = None
                missing_info_set.add("Budget range is not recorded in CRM (unverified in CRM)")

            if not lead.timeline and not result.timeline:
                missing_info_set.add("Project timeline is not recorded in CRM")
            elif not lead.timeline and result.timeline and result.timeline.lower() not in {"unknown", "not specified"}:
                result.timeline = None
                missing_info_set.add("Project timeline is not recorded in CRM (unverified in CRM)")

            if not lead.company_size:
                missing_info_set.add("Company size is not recorded in CRM")

            result.missing_information = sorted(list(missing_info_set))
            result.lead_id = lead.lead_id

            latency = (time.time() - start) * 1000
            agent_runs_total.labels(
                agent=AGENT_NAME,
                intent="qualification",
                status="success",
            ).inc()
            agent_run_latency_seconds.labels(agent=AGENT_NAME).observe(latency / 1000)

            logger.info(
                "Lead qualification complete",
                lead_id=lead_id,
                recommendation=result.recommendation,
                missing_info_count=len(result.missing_information),
                latency_ms=f"{latency:.0f}",
            )
            return result

        except Exception as exc:
            agent_runs_total.labels(
                agent=AGENT_NAME,
                intent="qualification",
                status="error",
            ).inc()
            logger.error("Lead qualification failed", lead_id=lead_id, error=str(exc))
            raise AgentError(f"Qualification failed for lead {lead_id}: {exc}") from exc
