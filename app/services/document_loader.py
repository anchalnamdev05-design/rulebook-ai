from __future__ import annotations
import csv
import re
from pathlib import Path
from typing import Iterable
from app.models import Source


def _chunks(text: str, min_words: int = 300, max_words: int = 700) -> list[str]:
    words = text.split()
    if not words:
        return []
    # Keep normal chunks in the requested range, while retaining a short final tail.
    result = []
    start = 0
    target = max_words
    while start < len(words):
        end = min(start + target, len(words))
        if len(words) - end and len(words) - end < min_words:
            end = len(words)
        result.append(" ".join(words[start:end]))
        start = end
    return result


def _markdown_sections(path: Path) -> Iterable[tuple[str, str, str, str]]:
    text = path.read_text(encoding="utf-8")
    matches = list(re.finditer(r"(?m)^##?\s+(.+)$", text))
    if not matches:
        yield path.name, path.stem.replace("_", " ").title(), path.stem, text
        return
    for i, match in enumerate(matches):
        body = text[match.end(): matches[i + 1].start() if i + 1 < len(matches) else len(text)].strip()
        section = match.group(1).strip()
        title = section.split("—", 1)[-1].strip()
        if body:
            yield section, title, path.name, body


def load_documents(root: Path) -> list[dict]:
    records: list[dict] = []
    for path in sorted(root.rglob("*")):
        if path.suffix.lower() == ".md":
            for section, title, document, text in _markdown_sections(path):
                for number, chunk in enumerate(_chunks(text), 1):
                    records.append({"document": document, "section": section, "title": title, "text": chunk, "chunk": number})
        elif path.suffix.lower() == ".csv":
            with path.open(newline="", encoding="utf-8") as handle:
                rows = list(csv.DictReader(handle))
            for row in rows:
                text = "; ".join(f"{key}: {value}" for key, value in row.items() if value)
                records.append({"document": path.name, "section": row.get("section", "table"), "title": row.get("title", path.stem.title()), "text": text, "chunk": 1})
        elif path.suffix.lower() == ".pdf":
            try:
                from pypdf import PdfReader
                for page_number, page in enumerate(PdfReader(str(path)).pages, 1):
                    text = (page.extract_text() or "").strip()
                    heading = re.search(r"(?m)^(\d+\.\d+)\s+[—-]\s*(.+)$", text)
                    section = f"{heading.group(1)} — {heading.group(2).strip()}" if heading else f"page {page_number}"
                    title = heading.group(2).strip() if heading else path.stem.replace("_", " ").title()
                    for number, chunk in enumerate(_chunks(text), 1):
                        records.append({"document": path.name, "section": section, "title": title, "text": chunk, "chunk": number})
            except Exception:
                continue
    return records
