"""
Sales Agent Graph factory.

Provides the ``create_sales_agent_graph`` factory used by ``app.main`` and
any other consumer that wants a ready-to-use, compiled LangGraph runnable
without holding a reference to the full ``SalesWorkflowEngine`` class.
"""
from __future__ import annotations

from langgraph.graph.state import CompiledStateGraph

from app.graph.workflow import SalesWorkflowEngine


def create_sales_agent_graph() -> CompiledStateGraph:
    """
    Construct and return a compiled LangGraph for the sales multi-agent pipeline.

    The compiled graph is stateful (MemorySaver checkpointer) and fully
    async-compatible.  Pass ``{"configurable": {"thread_id": <id>}}`` in
    ``config`` when invoking to enable per-session memory.

    Returns:
        CompiledStateGraph: ready-to-use LangGraph runnable.
    """
    engine = SalesWorkflowEngine()
    return engine._graph
