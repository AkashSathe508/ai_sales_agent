"""
Metrics collection using Prometheus client.

Exposes counters, histograms and gauges for:
- LLM call latency and token usage
- Tool execution
- RAG retrieval
- Agent runs
- Errors

The architecture is compatible with Prometheus/Grafana scraping.
"""
from __future__ import annotations

from prometheus_client import Counter, Gauge, Histogram, start_http_server

from app.config.settings import get_settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

# ── LLM metrics ───────────────────────────────────────────────────────────────
llm_calls_total = Counter(
    "sales_agent_llm_calls_total",
    "Total number of LLM calls",
    ["model", "agent", "status"],
)

llm_latency_seconds = Histogram(
    "sales_agent_llm_latency_seconds",
    "LLM call latency in seconds",
    ["model", "agent"],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0],
)

llm_tokens_total = Counter(
    "sales_agent_llm_tokens_total",
    "Total LLM tokens consumed",
    ["model", "agent", "token_type"],
)

# ── Tool metrics ──────────────────────────────────────────────────────────────
tool_calls_total = Counter(
    "sales_agent_tool_calls_total",
    "Total number of tool calls",
    ["tool_name", "agent", "status"],
)

tool_latency_seconds = Histogram(
    "sales_agent_tool_latency_seconds",
    "Tool call latency in seconds",
    ["tool_name"],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
)

# ── Retrieval metrics ─────────────────────────────────────────────────────────
retrieval_calls_total = Counter(
    "sales_agent_retrieval_calls_total",
    "Total number of RAG retrieval calls",
    ["method", "status"],
)

retrieval_results_count = Histogram(
    "sales_agent_retrieval_results_count",
    "Number of results returned per retrieval call",
    ["method"],
    buckets=[1, 3, 5, 10, 20, 50],
)

# ── Agent run metrics ─────────────────────────────────────────────────────────
agent_runs_total = Counter(
    "sales_agent_runs_total",
    "Total number of agent runs",
    ["agent", "intent", "status"],
)

agent_run_latency_seconds = Histogram(
    "sales_agent_run_latency_seconds",
    "Agent run latency in seconds",
    ["agent"],
    buckets=[1.0, 5.0, 15.0, 30.0, 60.0, 120.0, 300.0],
)

# ── Error metrics ─────────────────────────────────────────────────────────────
errors_total = Counter(
    "sales_agent_errors_total",
    "Total number of errors",
    ["error_type", "agent"],
)

# ── Active runs gauge ─────────────────────────────────────────────────────────
active_runs = Gauge(
    "sales_agent_active_runs",
    "Currently active agent runs",
)


def start_metrics_server() -> None:
    """Start Prometheus HTTP metrics server."""
    settings = get_settings()
    port = settings.observability.prometheus_port
    try:
        start_http_server(port)
        logger.info("Prometheus metrics server started", port=port)
    except Exception as exc:
        logger.warning("Could not start Prometheus metrics server", error=str(exc))
