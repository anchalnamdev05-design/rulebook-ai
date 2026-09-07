import json
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    payload = response.json()
    assert payload['status'] == 'ok'
    assert payload['indexedChunks'] > 0
    assert payload['retrievalMode']

def test_answered_question_has_grounded_source():
    response = client.post('/ask', json={'question': 'What attendance is required for the final examination?'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['type'] == 'answered'
    assert payload['sources']
    assert '75' in payload['answer'] or any('75' in s['text'] for s in payload['sources'])

def test_conflict_is_explicit():
    payload = client.post('/ask', json={'question': 'I have a medical exemption and 65% attendance; can I take the exam?'}).json()
    assert payload['type'] == 'conflict'
    assert len(payload['sources']) >= 2

def test_not_covered_does_not_guess():
    payload = client.post('/ask', json={'question': 'Can I miss an exam for a family wedding?'}).json()
    assert payload['type'] == 'not_covered'
    assert 'not specify' in payload['answer'].lower() or 'not covered' in payload['answer'].lower()

def test_validation():
    assert client.post('/ask', json={'question': 'short'}).status_code == 422
