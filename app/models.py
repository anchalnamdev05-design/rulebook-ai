from typing import Literal
from typing import Literal
from pydantic import BaseModel, Field

ResponseType = Literal["answered", "conflict", "not_covered"]

class AskRequest(BaseModel):
    question: str = Field(min_length=8, max_length=500)

class Source(BaseModel):
    document: str
    section: str
    title: str
    text: str
    similarity: float

class AskResponse(BaseModel):
    type: ResponseType
    answer: str
    sources: list[Source]
    retrievalMode: str

class HealthResponse(BaseModel):
    status: str
    retrievalMode: str
    indexedChunks: int
    llmAvailable: bool
