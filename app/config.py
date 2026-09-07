from pathlib import Path
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
RULEBOOK_DIR = DATA_DIR / "rulebook"
TABLE_DIR = DATA_DIR / "tables"
PDF_DIR = DATA_DIR / "pdf"
INDEX_PATH = DATA_DIR / "index.json"
CONTRADICTIONS_PATH = ROOT_DIR / "developer" / "contradictions.json"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
RETRIEVAL_THRESHOLD = float(os.getenv("RETRIEVAL_THRESHOLD", "0.22"))
CHUNK_MIN_WORDS = 300
CHUNK_MAX_WORDS = 700
