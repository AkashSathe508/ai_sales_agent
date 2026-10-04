"""
OpenTelemetry tracing setup.

Provides distributed tracing across agent runs, tool calls, LLM calls,
and retrieval operations. Compatible with Jaeger, Zipkin, and OTLP backends.
"""
from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Generator

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

from app.config.settings import get_settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

_tracer: trace.Tracer | None = None


def setup_tracing() -> None:
    """Initialize OpenTelemetry tracing. Call once at startup."""
    global _tracer
    settings = get_settings()

    if not settings.observability.otel_enabled:
        logger.info("OpenTelemetry tracing is disabled")
        _tracer = trace.get_tracer(__name__)
        return

    resource = Resource.create(
        {"service.name": settings.observability.otel_service_name}
    )
    provider = TracerProvider(resource=resource)

    try:
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
            OTLPSpanExporter,
        )

        otlp_exporter = OTLPSpanExporter(
            endpoint=settings.observability.otel_endpoint
        )
        provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
        logger.info(
            "OTLP tracing exporter configured",
            endpoint=settings.observability.otel_endpoint,
        )
    except ImportError:
        logger.warning(
            "opentelemetry-exporter-otlp-proto-grpc not installed, "
            "falling back to console exporter"
        )
        provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

    trace.set_tracer_provider(provider)
    _tracer = trace.get_tracer(settings.observability.otel_service_name)


def get_tracer() -> trace.Tracer:
    """Return the configured tracer."""
    global _tracer
    if _tracer is None:
        _tracer = trace.get_tracer(__name__)
    return _tracer


@contextmanager
def traced_operation(
    name: str,
    attributes: dict[str, Any] | None = None,
) -> Generator[trace.Span, None, None]:
    """Context manager that wraps an operation in a tracing span."""
    tracer = get_tracer()
    with tracer.start_as_current_span(name) as span:
        if attributes:
            for key, value in attributes.items():
                span.set_attribute(key, str(value))
        try:
            yield span
        except Exception as exc:
            span.record_exception(exc)
            span.set_status(trace.StatusCode.ERROR, str(exc))
            raise
