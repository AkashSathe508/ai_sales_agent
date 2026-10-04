"""
SQLAlchemy declarative base.

All ORM models extend this base. It is also used by Alembic
to auto-detect schema changes.
"""
from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase, MappedColumn


class Base(DeclarativeBase):
    """Root declarative base for all ORM models."""
    pass
