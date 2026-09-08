# Rulebook AI

**Ask the rulebook. Get the answer. See the evidence.**

Rulebook AI is a small explainable question-answering project for a university regulation book. It returns exactly one of three outcomes:

- **Answered** — enough evidence exists in the local corpus.
- **Conflict** — two relevant rules disagree.
- **Not covered** — the corpus does not contain enough information, so the app does not guess.

The existing React/Vite interface is kept as the frontend. The assignment backend is a simple Python FastAPI service.

## What is included

- FastAPI `POST /ask`
- FastAPI `GET /health`
- Ten local Markdown rulebook files with more than 6,000 meaningful words
- One real PDF loaded with `pypdf`
- One CSV fee/deadline table loaded with Python's `csv` module
- 300–700 word Markdown chunks with document, section, title, and text metadata
- Sentence Transformers `all-MiniLM-L6-v2` when it can load
- Automatic local TF-IDF-style cosine fallback when Sentence Transformers is unavailable
- Similarity/relevance scores in every source result
- Exactly three documented contradictions
- 15 answered, 3 conflict, and 25 not-covered test questions
- Basic FastAPI tests

## Simple architecture

```text
Markdown + PDF + CSV files
          ↓
Simple document loader and chunker
          ↓
Sentence Transformer or TF-IDF fallback
          ↓
Cosine similarity retrieval
          ↓
Coverage and conflict checks
          ↓
FastAPI JSON response
          ↓
Existing React UI
```

## Folder structure

```text
app/
  main.py
  models.py
  config.py
  services/
    document_loader.py
    embeddings.py
    retriever.py
    conflict_detector.py
    answer_generator.py
data/
  rulebook/                 Markdown corpus
  pdf/university_regulations.pdf
  tables/fee_deadlines.csv
  index.json                 generated locally, ignored by Git
scripts/build_index.py
developer/contradictions.json
tests/test_api.py
tests/test_questions.json
client/pages/Index.tsx       existing UI
```

## Setup

The Python backend requires Python 3.11 or newer.

### Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Optional environment variables can be copied from `.env.example`. No API key is needed for the normal deterministic fallback.

## Build and run

Build the local retrieval index:

```bash
python scripts/build_index.py
```

### Start the project

After activating the Python virtual environment, start both the FastAPI backend and React frontend with one command:

```bash
npm run start
```

This starts:

- FastAPI backend on `http://127.0.0.1:8000`
- React/Vite frontend on `http://localhost:8080`

Open the frontend at:

`http://localhost:8080`

The frontend uses `http://127.0.0.1:8000` by default. To use another backend URL, set `VITE_API_BASE_URL` before starting the project.

## API examples

Health:

```text
GET http://127.0.0.1:8000/health
```

Ask:

```bash
curl -X POST http://127.0.0.1:8000/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What attendance is required for the final examination?\"}"
```

Each answer includes `type`, `answer`, `sources`, and `retrievalMode`. Each source includes its document, section, title, passage, and similarity/relevance score. The score is not factual confidence.

## Demo questions

Answered:

```text
What attendance is required for the final examination?
```

Conflict:

```text
I have a medical exemption and 65% attendance. Can I appear for the exam?
```

Not covered:

```text
What happens if I miss my exam because of a family wedding?
```

## The three planted contradictions

The source records are documented in `developer/contradictions.json`:

1. `attendance.md §3.1` requires 75% attendance, while `medical_policy.md §7.2` allows an approved medical exemption down to 60%.
2. `fee_deadlines.csv` applies a late fee after 15 January, while `university_regulations.pdf §12.4` provides a no-penalty grace period to 31 January for approved deferment requests.
3. `hostel_rules.md §9.2` allows seven days with warden approval, while `hostel_rules.md §9.7` requires Chief Warden approval beyond five days.

The conflict detector compares retrieved source sections and does not mark every difference as a conflict.

## Tests

Run Python tests:

```bash
pytest -q
```

Run frontend checks:

```bash
pnpm typecheck
pnpm test
pnpm build
```

The Python test file checks health, answered, conflict, not-covered, and validation behavior. The question set is in `tests/test_questions.json`.

## Retrieval modes

At startup the app first tries to load `all-MiniLM-L6-v2`. If the package or model cannot be loaded, it prints:

```text
Semantic embedding model unavailable. Using TF-IDF fallback.
```

The `/health` response exposes the active mode. The fallback is local and keeps the app usable offline. The generated `data/index.json` is ignored so each machine can build an index using its available mode.

## Limitations

This is a one-day student project, not a legal or official university decision system. The answer generator is grounded in retrieved passages and the app does not infer policies that are absent from the corpus. Policy owners should review the sample regulations before using the project with real students.
