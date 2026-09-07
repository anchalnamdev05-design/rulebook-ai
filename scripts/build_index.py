from app.config import INDEX_PATH, RULEBOOK_DIR
from app.config import INDEX_PATH, RULEBOOK_DIR
from app.services.document_loader import load_documents
from app.services.retriever import Retriever

if __name__ == "__main__":
    documents = load_documents(RULEBOOK_DIR.parent)
    retriever = Retriever(INDEX_PATH, documents)
    retriever.save()
    print(f"Indexed {len(documents)} chunks using {retriever.mode}")
