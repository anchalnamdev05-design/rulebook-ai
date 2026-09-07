from __future__ import annotations
import json
from pathlib import Path
from .embeddings import Embedder, cosine

class Retriever:
    def __init__(self, index_path: Path, documents: list[dict] | None = None):
        self.index_path = index_path
        self.embedder = Embedder()
        if index_path.exists():
            payload = json.loads(index_path.read_text(encoding="utf-8"))
            saved_mode = payload.get("retrievalMode", "tfidf")
            self.documents = payload["documents"]
            if saved_mode == self.embedder.mode:
                self.vectors = payload["vectors"]
                self.embedder.idf = payload.get("idf", {})
                self.mode = saved_mode
            else:
                self.vectors = self.embedder.fit([d["text"] for d in self.documents])
                self.mode = self.embedder.mode
        else:
            self.documents = documents or []
            self.vectors = self.embedder.fit([d["text"] for d in self.documents])
            self.mode = self.embedder.mode

    def save(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.index_path.write_text(json.dumps({"documents": self.documents, "vectors": self.vectors, "idf": self.embedder.idf, "retrievalMode": self.mode}), encoding="utf-8")

    def search(self, question: str, limit: int = 5) -> list[dict]:
        query = self.embedder.transform([question])[0]
        ranked = []
        for document, vector in zip(self.documents, self.vectors):
            item = dict(document)
            item["similarity"] = round(cosine(query, vector), 4)
            ranked.append(item)
        return sorted(ranked, key=lambda x: x["similarity"], reverse=True)[:limit]
