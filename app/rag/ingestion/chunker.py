"""
Document chunking with section and source preservation.

Ensures no chunk loses its parent document_id, section title,
or provenance during ingestion.
"""
from __future__ import annotations

import re
import uuid
from typing import Any

from app.rag.schemas import ChunkMetadata


class DocumentChunk:
    """Represents an extracted chunk ready for embedding and storage."""

    def __init__(
        self,
        chunk_id: str,
        document_id: str,
        document_version_id: str,
        source: str,
        title: str,
        content: str,
        section: str | None = None,
        page: int | None = None,
        embedding: list[float] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.chunk_id = chunk_id
        self.document_id = document_id
        self.document_version_id = document_version_id
        self.source = source
        self.title = title
        self.content = content
        self.section = section
        self.page = page
        self.embedding = embedding or []
        self.metadata = metadata or {}


class MarkdownSectionChunker:
    """
    Chunks Markdown and structured documents by headings and paragraphs.

    Preserves section hierarchy so each chunk knows its context (e.g.
    'Pricing Guide > Enterprise Tier').
    """

    def __init__(
        self,
        max_chunk_size: int = 800,
        chunk_overlap: int = 100,
    ) -> None:
        self.max_chunk_size = max_chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(
        self,
        document_id: str,
        document_version_id: str,
        source: str,
        title: str,
        text: str,
        base_metadata: dict[str, Any] | None = None,
    ) -> list[DocumentChunk]:
        """
        Split document into chunks based on markdown headers and paragraphs.
        """
        chunks: list[DocumentChunk] = []
        meta = base_metadata or {}

        # Split into sections based on markdown headers (# Header)
        header_pattern = re.compile(r"^(#{1,4}\s+.+)$", re.MULTILINE)
        parts = header_pattern.split(text)

        current_section = title
        raw_sections: list[tuple[str, str]] = []

        if len(parts) <= 1:
            raw_sections.append((title, text))
        else:
            first_part = parts[0].strip()
            if first_part:
                raw_sections.append((title, first_part))

            idx = 1
            while idx < len(parts):
                sec_header = parts[idx].strip().lstrip("#").strip()
                sec_body = parts[idx + 1].strip() if idx + 1 < len(parts) else ""
                raw_sections.append((sec_header, sec_body))
                idx += 2

        chunk_idx = 0
        for section_name, section_text in raw_sections:
            if not section_text.strip():
                continue

            # If section is small enough, make single chunk
            if len(section_text) <= self.max_chunk_size:
                cid = f"chk_{document_id}_{chunk_idx:03d}"
                chunks.append(
                    DocumentChunk(
                        chunk_id=cid,
                        document_id=document_id,
                        document_version_id=document_version_id,
                        source=source,
                        title=title,
                        section=section_name,
                        content=section_text.strip(),
                        metadata={
                            **meta,
                            "section": section_name,
                            "chunk_index": chunk_idx,
                        },
                    )
                )
                chunk_idx += 1
            else:
                # Split section text by paragraphs
                paragraphs = [p.strip() for p in section_text.split("\n\n") if p.strip()]
                buffer = ""

                for p in paragraphs:
                    if len(buffer) + len(p) + 2 <= self.max_chunk_size:
                        buffer = f"{buffer}\n\n{p}".strip() if buffer else p
                    else:
                        if buffer:
                            cid = f"chk_{document_id}_{chunk_idx:03d}"
                            chunks.append(
                                DocumentChunk(
                                    chunk_id=cid,
                                    document_id=document_id,
                                    document_version_id=document_version_id,
                                    source=source,
                                    title=title,
                                    section=section_name,
                                    content=buffer,
                                    metadata={
                                        **meta,
                                        "section": section_name,
                                        "chunk_index": chunk_idx,
                                    },
                                )
                            )
                            chunk_idx += 1
                        buffer = p

                if buffer:
                    cid = f"chk_{document_id}_{chunk_idx:03d}"
                    chunks.append(
                        DocumentChunk(
                            chunk_id=cid,
                            document_id=document_id,
                            document_version_id=document_version_id,
                            source=source,
                            title=title,
                            section=section_name,
                            content=buffer,
                            metadata={
                                **meta,
                                "section": section_name,
                                "chunk_index": chunk_idx,
                            },
                        )
                    )
                    chunk_idx += 1

        return chunks
