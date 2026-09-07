from __future__ import annotations
import json
from pathlib import Path

class ConflictDetector:
    def __init__(self, path: Path):
        self.rules = json.loads(path.read_text(encoding="utf-8")) if path.exists() else []

    def detect(self, question: str, results: list[dict]) -> dict | None:
        lower = question.lower()
        for rule in self.rules:
            if all(term.lower() in lower for term in rule["trigger_terms"]):
                sections = set(rule["sections"])
                relevant = [r for r in results if r["section"] in sections or r["document"] in sections]
                if len(relevant) >= 2 or any(s in lower for s in rule.get("explicit_terms", [])):
                    return {"rule": rule, "sources": relevant}
        return None
