from __future__ import annotations
import os

FALLBACK = "The rulebook does not specify a policy for this situation. I cannot infer an answer beyond the available provisions."

class AnswerGenerator:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")

    def generate(self, question: str, sources: list[dict]) -> str:
        if not sources:
            return FALLBACK
        # Optional LLM support is deliberately constrained to supplied excerpts.
        if self.api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                context = "\n\n".join(f"[{s['document']} § {s['section']}] {s['text']}" for s in sources)
                response = client.responses.create(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), input=f"Answer only from these excerpts. If insufficient, say the policy is not covered. Question: {question}\nExcerpts:\n{context}")
                text = getattr(response, "output_text", "").strip()
                if text:
                    return text
            except Exception:
                pass
        return "Based on the rulebook: " + sources[0]["text"]

    def conflict(self, rule: dict) -> str:
        return rule["answer"]
