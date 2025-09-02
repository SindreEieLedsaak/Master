import pytest
from fastapi.testclient import TestClient


# Verifies: analyzer endpoint returns transformed payload and 200

def test_analyze_student_projects(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers import ai_router

    def fake_analyze(self, student_id: str):
        return {'student_id': student_id, 'summary': 'ok'}

    monkeypatch.setattr(ai_router.ProjectAnalyzer, 'analyze_student_projects', fake_analyze, raising=True)
    resp = client.get('/api/analyze-student-projects/abc')
    assert resp.status_code == 200
    assert resp.json()['student_id'] == 'abc'


# -------------------- gitlab_router.py --------------------
# Verifies: projects are read from DB and _id is excluded in response

def test_gitlab_student_projects(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.gitlab_router import GitlabService
    import mongomock

    coll = mongomock.MongoClient()['test']['projects']
    coll.insert_many([
        {'_id': '1', 'name': 'A'},
        {'_id': '2', 'name': 'B'},
    ])

    def fake_get_student_collection(self, student_id: str):
        return coll

    monkeypatch.setattr(GitlabService, 'get_student_collection', fake_get_student_collection, raising=True)

    resp = client.get('/api/student/s123/projects')
    assert resp.status_code == 200
    body = resp.json()
    assert body['student_id'] == 's123'
    assert body['projects'] == [{'name': 'A'}, {'name': 'B'}]


# -------------------- student_router.py --------------------
# Verifies: lists suggestions, create student, cookie pass-through, and sync behavior

def test_students_get_suggestions(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.student_router import SuggestionService
    from backend.models.suggestion import SuggestionInDB
    from datetime import datetime

    def fake_get_all(self, student_id: str):
        return [SuggestionInDB.model_validate({'_id': 'x1', 'student_id': student_id, 'suggestion': 'Try X', 'created_at': datetime.utcnow()})]

    monkeypatch.setattr(SuggestionService, 'get_all_for_student', fake_get_all, raising=True)

    resp = client.get('/api/students/u1/suggestions')
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and data[0]['_id'] == 'x1'


def test_students_create(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.student_router import StudentService
    from backend.models.student import Student

    def fake_get_or_create(self, gitlab_username: str):
        return Student.model_validate({'_id': 'stu1', 'gitlab_username': gitlab_username})

    monkeypatch.setattr(StudentService, 'get_or_create_student', fake_get_or_create, raising=True)

    resp = client.post('/api/students', json={'gitlab_username': 'alice'})
    assert resp.status_code == 200
    assert resp.json()['_id'] == 'stu1'


def test_students_test_cookies(client: TestClient):
    resp = client.get('/api/students/test-cookies', cookies={'gitlab_token': 'secret'})
    assert resp.status_code == 200
    body = resp.json()
    assert body['gitlab_token_present'] is True


def test_students_sync_requires_cookie(client: TestClient):
    resp = client.post('/api/students/sync', json={'gitlab_username': 'alice'})
    assert resp.status_code == 400


def test_students_sync_ok(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.student_router import StudentService

    def fake_sync(self, gitlab_username: str, encrypted_gitlab_token: str):
        return {'synced': True, 'user': gitlab_username}

    monkeypatch.setattr(StudentService, 'sync_student_with_token', fake_sync, raising=True)

    resp = client.post('/api/students/sync', json={'gitlab_username': 'alice'}, cookies={'gitlab_token': 'secret'})
    assert resp.status_code == 200
    assert resp.json()['synced'] is True


# -------------------- suggestion_router.py --------------------
# Verifies: DELETE returns success body or 404 when not found

def test_suggestion_delete_success(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.suggestion_router import SuggestionService

    monkeypatch.setattr(SuggestionService, 'delete', lambda self, sid: True, raising=True)
    resp = client.delete('/api/suggestions/sg1')
    assert resp.status_code == 200
    assert resp.json()['message'] == 'Suggestion deleted successfully'


def test_suggestion_delete_not_found(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.suggestion_router import SuggestionService

    monkeypatch.setattr(SuggestionService, 'delete', lambda self, sid: False, raising=True)
    resp = client.delete('/api/suggestions/sg404')
    assert resp.status_code == 404


# -------------------- ai_router.py (project analysis/suggestions) --------------------
# Verifies: each AI route calls analyzer methods and returns expected body

def test_ai_analyze_projects_job(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.ai_router import AIProjectAnalyzer

    monkeypatch.setattr(AIProjectAnalyzer, 'analyze_and_store_student_projects', lambda self: {'ok': True}, raising=True)
    resp = client.post('/api/ai-analyze-student-projects/u1')
    assert resp.status_code == 200
    assert resp.json()['analysis'] == {'ok': True}


def test_ai_create_suggestions(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.ai_router import AIProjectAnalyzer

    monkeypatch.setattr(AIProjectAnalyzer, 'create_project_suggestions', lambda self: [{'s': 1}], raising=True)
    resp = client.post('/api/ai-suggest-projects/u1')
    assert resp.status_code == 200
    assert resp.json()['suggestions'] == [{'s': 1}]


def test_ai_get_suggestions(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.ai_router import AIProjectAnalyzer

    monkeypatch.setattr(AIProjectAnalyzer, 'get_project_suggestions', lambda self: [{'s': 2}], raising=True)
    resp = client.get('/api/ai-get-suggestions/u1')
    assert resp.status_code == 200
    assert resp.json()['suggestions'] == [{'s': 2}]


def test_ai_get_analysis(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.ai_router import AIProjectAnalyzer

    monkeypatch.setattr(AIProjectAnalyzer, 'get_stored_analysis', lambda self: {'a': 1}, raising=True)
    resp = client.get('/api/ai-get-analysis/u1')
    assert resp.status_code == 200
    assert resp.json()['analysis'] == {'a': 1}


def test_ai_delete_all_suggestions(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.ai_router import AIProjectAnalyzer

    monkeypatch.setattr(AIProjectAnalyzer, 'delete_all_project_suggestions', lambda self: 'ok', raising=True)
    resp = client.delete('/api/ai-delete-all-suggestions/u1')
    assert resp.status_code == 200
    assert resp.json()['message'] == 'ok'


def test_ai_delete_suggestion(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from backend.routers.ai_router import AIProjectAnalyzer

    monkeypatch.setattr(AIProjectAnalyzer, 'delete_project_suggestions', lambda self, sid: 'deleted', raising=True)
    resp = client.delete('/api/ai-delete-suggestion/u1/sg1')
    assert resp.status_code == 200
    assert resp.json()['message'] == 'deleted' 