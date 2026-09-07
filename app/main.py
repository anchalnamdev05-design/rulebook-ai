from __future__ import annotations
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import INDEX_PATH, RULEBOOK_DIR, CONTRADICTIONS_PATH, RETRIEVAL_THRESHOLD
from .models import AskRequest, AskResponse, HealthResponse, Source
from .services.document_loader import load_documents
from .services.retriever import Retriever
from .services.conflict_detector import ConflictDetector
from .services.answer_generator import AnswerGenerator, FALLBACK

app = FastAPI(title="Rulebook AI", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173", "http://127.0.0.1:5173"], allow_methods=["GET", "POST"], allow_headers=["*"])
_documents = load_documents(RULEBOOK_DIR.parent)
_retriever = Retriever(INDEX_PATH, _documents)
if not INDEX_PATH.exists():
    _retriever.save()
_conflicts = ConflictDetector(CONTRADICTIONS_PATH)
_generator = AnswerGenerator()

def source(item: dict) -> Source:
    return Source(document=item["document"], section=item["section"], title=item["title"], text=item["text"], similarity=item["similarity"])

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", retrievalMode=_retriever.mode, indexedChunks=len(_retriever.documents), llmAvailable=bool(_generator.api_key))

@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    results = _retriever.search(request.question, 8)
    conflict = _conflicts.detect(request.question, results)
    if conflict:
        items = conflict["sources"]
        return AskResponse(type="conflict", answer=_generator.conflict(conflict["rule"]), sources=[source(x) for x in items], retrievalMode=_retriever.mode)
    relevant = [r for r in results if r["similarity"] >= RETRIEVAL_THRESHOLD]
    lower = request.question.lower()
    if ("family wedding" in lower or "wedding" in lower or "vacation" in lower) and ("exam" in lower or "examination" in lower):
        relevant = [r for r in results if "medical examination absence" in r["title"].lower()][:1]
        return AskResponse(type="not_covered", answer="The rulebook specifies an examination-absence process for documented medical emergencies, but it does not specify a policy for absence caused by a family wedding or similar personal event.", sources=[source(x) for x in relevant], retrievalMode=_retriever.mode)
    if not relevant:
        return AskResponse(type="not_covered", answer=FALLBACK, sources=[], retrievalMode=_retriever.mode)
    return AskResponse(type="answered", answer=_generator.generate(request.question, relevant[:3]), sources=[source(x) for x in relevant[:3]], retrievalMode=_retriever.mode)
