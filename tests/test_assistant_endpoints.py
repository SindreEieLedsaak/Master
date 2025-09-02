import os
import sys
import importlib.util
import pytest
from fastapi.testclient import TestClient

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

from backend.ai.assistant import Assistant


@pytest.fixture()
def client():
    """
    Provide a TestClient bound to the real FastAPI app (DB is mocked in conftest).
    """
    return TestClient(app)


# Verifies: endpoint exists, returns 200, and correct JSON message
# Side-effect: clears assistant history (safe under test)
def test_clear_assistant_messages(client: TestClient):
    resp = client.post("/api/assistant/clear")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Assistant messages cleared"


# Verifies: system message endpoint accepts JSON body and returns 200
# Verifies: assistant endpoint returns a response string; network is stubbed
# Strategy: monkeypatch Assistant.get_assistant_response to avoid external API
def test_add_system_message_and_get_response(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    # Stub assistant response to avoid network
    def fake_get_response(self, prompt: str, code: str | None = None) -> str:
        return "ok-test"

    monkeypatch.setattr(Assistant, "get_assistant_response", fake_get_response, raising=True)

    resp = client.post("/api/assistant/add-system-message", json={"message": "test system"})
    assert resp.status_code == 200
    assert resp.json()["message"] == "System message added"

    resp2 = client.post("/api/assistant", json={"prompt": "Hello", "code": None})
    assert resp2.status_code == 200
    assert resp2.json()["response"] == "ok-test"


