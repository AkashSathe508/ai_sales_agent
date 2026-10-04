"""
Document loaders for RAG ingestion.
Loads markdown, text, and JSON documents from disk or memory.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any


class LoadedDocument:
    """Represents a raw document loaded into memory."""

    def __init__(
        self,
        document_id: str,
        title: str,
        content: str,
        source: str,
        doc_type: str = "markdown",
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.document_id = document_id
        self.title = title
        self.content = content
        self.source = source
        self.doc_type = doc_type
        self.metadata = metadata or {}


class DocumentLoader:
    """Loads documents from files or directories."""

    @staticmethod
    def load_file(file_path: str | Path) -> LoadedDocument:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Document file not found: {file_path}")

        content = path.read_text(encoding="utf-8")
        stem = path.stem.replace("_", " ").title()
        doc_id = f"doc_{path.stem}"

        return LoadedDocument(
            document_id=doc_id,
            title=stem,
            content=content,
            source=str(path),
            doc_type=path.suffix.lstrip("."),
            metadata={"file_name": path.name},
        )

    @staticmethod
    def load_directory(dir_path: str | Path) -> list[LoadedDocument]:
        path = Path(dir_path)
        if not path.is_dir():
            return []

        docs = []
        for ext in ("*.md", "*.txt"):
            for f in sorted(path.glob(ext)):
                docs.append(DocumentLoader.load_file(f))
        return docs
