"""
CLI entry point for the AI Sales Intelligence & Proposal Automation Platform.

Usage:
    python -m app.main
    python -m app.main "Analyze LEAD-001 and prepare a proposal for improving their sales reporting."

This is the ONLY public interface at this layer. A FastAPI backend or other
consumer can later call run_agent_workflow() directly as a Python API.
"""
from __future__ import annotations

import asyncio
import sys
from typing import Any

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

from app.observability.logging import setup_logging, get_logger
from app.observability.correlation import initialize_request_context
from app.config.settings import get_settings

console = Console()
logger = get_logger(__name__)


def _print_banner() -> None:
    console.print(
        Panel.fit(
            "[bold cyan]AI Sales Intelligence & Proposal Automation Platform[/bold cyan]\n"
            "[dim]Agent Layer — Production-Oriented Multi-Agent System[/dim]",
            border_style="cyan",
        )
    )


def _print_result(result: dict[str, Any]) -> None:
    """Render the final result to the console in a structured format."""
    console.print("\n[bold green]═══ WORKFLOW RESULT ═══[/bold green]\n")

    # Intent
    if intent := result.get("intent"):
        console.print(f"[bold]Detected Intent:[/bold] [cyan]{intent}[/cyan]")

    if decision := result.get("supervisor_decision"):
        console.print(f"[bold]Routing Reason:[/bold] {decision.get('reason', 'N/A')}")
        console.print(
            f"[bold]Confidence:[/bold] {decision.get('confidence', 0):.0%}"
        )

    console.print()

    # Tool execution summary
    if tool_results := result.get("tool_results"):
        table = Table(title="Tool Execution Summary", show_header=True)
        table.add_column("Tool", style="cyan")
        table.add_column("Status")
        table.add_column("Latency (ms)")
        for tr in tool_results:
            status = "[green]✓[/green]" if tr.get("success") else "[red]✗[/red]"
            latency = f"{tr.get('latency_ms', 0):.1f}" if tr.get("latency_ms") else "—"
            table.add_row(tr.get("tool_name", "?"), status, latency)
        console.print(table)
        console.print()

    # Evidence summary
    if evidence := result.get("retrieved_evidence"):
        console.print(
            f"[bold]Evidence Retrieved:[/bold] {len(evidence)} document chunks"
        )
        for ev in evidence[:3]:
            console.print(
                f"  • [dim]{ev.get('title', 'Untitled')} "
                f"(score: {ev.get('relevance_score', 0):.2f})[/dim]"
            )
        if len(evidence) > 3:
            console.print(f"  [dim]... and {len(evidence) - 3} more[/dim]")
        console.print()

    # ROI
    if roi := result.get("roi_result"):
        console.print("[bold]ROI Calculation (Deterministic):[/bold]")
        console.print(f"  Annual Savings:     ${roi.get('annual_savings', 0):,.0f}")
        console.print(f"  ROI:               {roi.get('roi_percentage', 0):.1f}%")
        console.print(
            f"  Payback Period:    {roi.get('payback_period_years', '?')} years"
        )
        console.print()

    # Pricing
    if pricing := result.get("pricing_result"):
        console.print("[bold]Pricing (Validated):[/bold]")
        if isinstance(pricing, list):
            for p in pricing:
                console.print(
                    f"  • {p.get('product_name', '?')}: "
                    f"${p.get('total_price', 0):,.2f} {p.get('currency', 'USD')}"
                )
        console.print()

    # Proposal summary
    if proposal := result.get("proposal"):
        console.print(
            Panel(
                f"[bold]Proposal ID:[/bold] {proposal.get('proposal_id', 'N/A')}\n"
                f"[bold]Summary:[/bold] {proposal.get('executive_summary', 'N/A')[:300]}...\n"
                f"[bold]Approval Status:[/bold] {proposal.get('approval_status', 'N/A')}",
                title="[bold green]Generated Proposal[/bold green]",
                border_style="green",
            )
        )

    # Qualification
    if qual := result.get("qualification_result"):
        console.print(
            Panel(
                f"[bold]Lead:[/bold] {qual.get('lead_id', 'N/A')}\n"
                f"[bold]Recommendation:[/bold] {qual.get('recommendation', 'N/A')}\n"
                f"[bold]Risks:[/bold] {', '.join(qual.get('risks', ['None identified']))}\n"
                f"[bold]Missing Info:[/bold] {', '.join(qual.get('missing_information', ['None']))}",
                title="[bold yellow]Qualification Result[/bold yellow]",
                border_style="yellow",
            )
        )

    # Intelligence
    if intel := result.get("intelligence_result"):
        console.print("[bold]Sales Intelligence:[/bold]")
        for insight in (intel.get("insights") or [])[:5]:
            console.print(
                f"  [{insight.get('source_type', '?')}] "
                f"{insight.get('insight', '')[:120]}"
            )
        console.print()

    # Approval
    if approval := result.get("approval_state"):
        status = approval.get("status", "unknown")
        color = {
            "approved": "green",
            "rejected": "red",
            "pending": "yellow",
        }.get(status, "white")
        console.print(
            f"[bold]Approval Status:[/bold] [{color}]{status.upper()}[/{color}]"
        )
        if approval.get("reason"):
            console.print(f"[bold]Reason:[/bold] {approval['reason']}")

    # Errors
    if errors := result.get("errors"):
        console.print("\n[bold red]Errors:[/bold red]")
        for err in errors:
            console.print(f"  [red]✗[/red] {err}")

    if warnings := result.get("warnings"):
        console.print("\n[bold yellow]Warnings:[/bold yellow]")
        for warn in warnings:
            console.print(f"  [yellow]⚠[/yellow] {warn}")

    # Request IDs
    console.print(
        f"\n[dim]Request ID: {result.get('request_id', 'N/A')} | "
        f"Agent Run: {result.get('agent_run_id', 'N/A')}[/dim]"
    )


async def run_agent_workflow(
    query: str,
    organization_id: str = "org_demo",
    user_id: str = "user_demo",
    approve_automatically: bool = False,
) -> dict[str, Any]:
    """
    Main entry point for the agent workflow.

    This function is the Python API that a FastAPI backend or
    any other consumer can call without rewriting the agents.

    Args:
        query: Natural language sales request
        organization_id: Organization context for multi-tenancy
        user_id: Requesting user ID
        approve_automatically: Skip human approval (for demos/testing only)

    Returns:
        Structured result dictionary
    """
    request_id, agent_run_id = initialize_request_context(
        organization_id=organization_id,
        user_id=user_id,
    )

    logger.info(
        "Starting agent workflow",
        query=query[:100],
        organization_id=organization_id,
        user_id=user_id,
        request_id=request_id,
    )

    try:
        from app.graph.graph import create_sales_agent_graph

        graph = create_sales_agent_graph()

        initial_state = {
            "request_id": request_id,
            "user_query": query,
            "organization_id": organization_id,
            "user_id": user_id,
            "auto_approve": approve_automatically,
            "intent": None,
            "supervisor_decision": None,
            "lead_id": None,
            "customer_id": None,
            "deal_id": None,
            "crm_data": None,
            "retrieved_evidence": [],
            "qualification_result": None,
            "intelligence_result": None,
            "roi_result": None,
            "pricing_result": None,
            "proposal": None,
            "presentation_request": None,
            "approval_state": None,
            "tool_results": [],
            "errors": [],
            "warnings": [],
            "final_response": None,
        }

        config = {"configurable": {"thread_id": request_id}}
        final_state = await graph.ainvoke(initial_state, config=config)

        logger.info(
            "Agent workflow completed",
            request_id=request_id,
            intent=final_state.get("intent"),
        )

        return {
            **final_state,
            "request_id": request_id,
            "agent_run_id": agent_run_id,
        }

    except Exception as exc:
        logger.error(
            "Agent workflow failed",
            error=str(exc),
            error_type=type(exc).__name__,
            request_id=request_id,
        )
        return {
            "request_id": request_id,
            "agent_run_id": agent_run_id,
            "errors": [f"{type(exc).__name__}: {str(exc)}"],
            "warnings": [],
        }


@click.command()
@click.argument("query", default="Analyze LEAD-001 and prepare a proposal for improving their sales reporting.")
@click.option("--org-id", default="org_demo", help="Organization ID")
@click.option("--user-id", default="user_demo", help="User ID")
@click.option(
    "--auto-approve",
    is_flag=True,
    default=False,
    help="Automatically approve proposals (demo mode)",
)
@click.option("--log-level", default="INFO", help="Log level")
def cli(
    query: str,
    org_id: str,
    user_id: str,
    auto_approve: bool,
    log_level: str,
) -> None:
    """
    AI Sales Intelligence & Proposal Automation Platform — CLI

    \b
    Example:
        python -m app.main "Analyze LEAD-001 and prepare a proposal for improving their sales reporting."
    """
    import os
    os.environ.setdefault("LOG_LEVEL", log_level)
    setup_logging()

    _print_banner()

    console.print(f"\n[bold]Query:[/bold] [italic]{query}[/italic]\n")

    result = asyncio.run(
        run_agent_workflow(
            query=query,
            organization_id=org_id,
            user_id=user_id,
            approve_automatically=auto_approve,
        )
    )

    _print_result(result)


def main() -> None:
    """Entrypoint called by `python -m app.main`."""
    cli()


if __name__ == "__main__":
    main()
