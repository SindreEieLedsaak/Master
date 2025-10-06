import os
import sys
import importlib.util
import pytest
from fastapi.testclient import TestClient
from jose import jwt
from datetime import datetime, timedelta
from backend.ai.assistant import Assistant
from backend.ai.session_assistant import SessionAssistantManager


# Resolve absolute path to app.py and import it as a module
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
APP_FILE = os.path.join(PROJECT_ROOT, 'app.py')

# Ensure root is on sys.path so `backend.*` imports inside app.py work
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

spec = importlib.util.spec_from_file_location('app', APP_FILE)
app_module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(app_module)
app = app_module.app  # FastAPI instance



SECRET_KEY = "test-secret-key"  
ALGORITHM = "HS256"

def make_token(sub: str, name: str = "user") -> str:
    exp = datetime.utcnow() + timedelta(minutes=60)
    return jwt.encode({"sub": sub, "name": name, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


@pytest.fixture()
def client():
    """
    Provide a TestClient bound to the real FastAPI app (DB is mocked in conftest).
    """
    return TestClient(app)


# Verifies: endpoint exists, returns 200, and correct JSON message
# Side-effect: clears assistant history (safe under test)
def test_clear_assistant_messages(client: TestClient):
    token = make_token(sub='u1')
    resp = client.post("/api/assistant/clear", json={"session_id": "test_session"}, cookies={'app_token': token})
    assert resp.status_code == 200
    assert resp.json()["message"] == "Assistant messages cleared"


# Verifies: system message endpoint accepts JSON body and returns 200
# Verifies: assistant endpoint returns a response string; network is stubbed
# Strategy: monkeypatch Assistant.get_assistant_response to avoid external API
def test_add_system_message_and_get_response(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    # Stub assistant response to avoid network
    def fake_get_response(self, session_id: str, prompt: str, code: str | None = None) -> str:
        return "ok-test"

    # Patch the session assistant's get_assistant_response method
    from backend.ai.session_assistant import SessionAssistant
    monkeypatch.setattr(SessionAssistant, "get_assistant_response", fake_get_response, raising=True)

    token = make_token(sub='u1')
    resp = client.post("/api/assistant/add-system-message", json={"message": "test system", "session_id": "test_session"}, cookies={'app_token': token})
    assert resp.status_code == 200
    assert resp.json()["message"] == "System message added"

    resp2 = client.post("/api/assistant", json={"prompt": "Hello", "code": None, "session_id": "test_session"}, cookies={'app_token': token})
    assert resp2.status_code == 200
    assert resp2.json()["response"] == "ok-test"


def test_session_isolation(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    """
    Test that different sessions maintain separate conversation histories and system prompts.
    """
    # Mock the OpenAI client to avoid external API calls
    def fake_get_response(self, session_id: str, prompt: str, code: str | None = None) -> str:
        # Return different responses based on session to verify isolation
        if session_id == "default_session":
            return f"Default response to: {prompt}"
        elif session_id == "survey_session":
            return f"Survey response to: {prompt}"
        else:
            return f"Unknown session response to: {prompt}"

    from backend.ai.session_assistant import SessionAssistant
    monkeypatch.setattr(SessionAssistant, "get_assistant_response", fake_get_response, raising=True)

    token = make_token(sub='u1')

    # Create two different sessions with different system prompts
    resp1 = client.post("/api/assistant/create-session", 
                       json={"session_id": "default_session", "system_message": "You are a default assistant."}, 
                       cookies={'app_token': token})
    assert resp1.status_code == 200
    assert resp1.json()["session_id"] == "default_session"

    resp2 = client.post("/api/assistant/create-session", 
                       json={"session_id": "survey_session", "system_message": "You are a survey assistant with hints."}, 
                       cookies={'app_token': token})
    assert resp2.status_code == 200
    assert resp2.json()["session_id"] == "survey_session"

    # Send messages to both sessions
    resp3 = client.post("/api/assistant", 
                       json={"prompt": "Hello", "session_id": "default_session"}, 
                       cookies={'app_token': token})
    assert resp3.status_code == 200
    assert resp3.json()["response"] == "Default response to: Hello"

    resp4 = client.post("/api/assistant", 
                       json={"prompt": "Hello", "session_id": "survey_session"}, 
                       cookies={'app_token': token})
    assert resp4.status_code == 200
    assert resp4.json()["response"] == "Survey response to: Hello"

    # Verify sessions are isolated by clearing one and checking the other still works
    resp5 = client.post("/api/assistant/clear", 
                       json={"session_id": "default_session"}, 
                       cookies={'app_token': token})
    assert resp5.status_code == 200

    # Survey session should still work after clearing default session
    resp6 = client.post("/api/assistant", 
                       json={"prompt": "Still here?", "session_id": "survey_session"}, 
                       cookies={'app_token': token})
    assert resp6.status_code == 200
    assert resp6.json()["response"] == "Survey response to: Still here?"


def test_create_and_delete_session(client: TestClient):
    """
    Test session creation and deletion endpoints.
    """
    token = make_token(sub='u1')

    # Create a session
    resp1 = client.post("/api/assistant/create-session", 
                       json={"session_id": "temp_session", "system_message": "Temporary assistant."}, 
                       cookies={'app_token': token})
    assert resp1.status_code == 200
    assert resp1.json()["session_id"] == "temp_session"

    # Delete the session
    resp2 = client.delete("/api/assistant/session/user_u1_temp_session", 
                         cookies={'app_token': token})
    assert resp2.status_code == 200
    assert resp2.json()["message"] == "Session deleted successfully"

    # Try to delete non-existent session (should still return 200)
    resp3 = client.delete("/api/assistant/session/user_u1_nonexistent", 
                         cookies={'app_token': token})
    assert resp3.status_code == 200


