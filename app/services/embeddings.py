from __future__ import annotations
import re
import math
from collections import Counter

_TOKEN = re.compile(r"[a-z0-9]+")

def tokens(text: str) -> list[str]:
    return _TOKEN.findall(text.lower())

class Embedder:
    def __init__(self) -> None:
        self.mode = "tfidf"
        self.model = None
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.mode = "sentence-transformers/all-MiniLM-L6-v2"
        except Exception:
            print("Semantic embedding model unavailable. Using TF-IDF fallback.")
        self.idf: dict[str, float] = {}

    def fit(self, texts: list[str]) -> list[list[float]]:
        if self.model:
            return self.model.encode(texts, normalize_embeddings=True).tolist()
        docs = [Counter(tokens(t)) for t in texts]
        n = len(docs)
        df = Counter(term for doc in docs for term in doc)
        self.idf = {term: math.log((n + 1) / (freq + 1)) + 1 for term, freq in df.items()}
        return [self._vector(doc) for doc in docs]

    def transform(self, texts: list[str]) -> list[list[float]]:
        if self.model:
            return self.model.encode(texts, normalize_embeddings=True).tolist()
        return [self._vector(Counter(tokens(t))) for t in texts]

    def _vector(self, counts: Counter[str]) -> list[float]:
        vector = [counts.get(term, 0) * self.idf.get(term, 1.0) for term in sorted(self.idf)]
        norm = math.sqrt(sum(x * x for x in vector)) or 1.0
        return [x / norm for x in vector]

def cosine(a: list[float], b: list[float]) -> float:
    return max(0.0, min(1.0, sum(x * y for x, y in zip(a, b))))
