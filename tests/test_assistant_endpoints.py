import os
import sys
import pytest
from httpx import AsyncClient
from app import app  
from backend.ai.assistant import Assistant  

# Ensure project root is importable when running tests
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)



@pytest.mark.asyncio
async def test_clear_assistant_messages():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/assistant/clear")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Assistant messages cleared"


@pytest.mark.asyncio
async def test_add_system_message_and_get_response(monkeypatch: pytest.MonkeyPatch):
    # Stub assistant response to avoid network
    def fake_get_response(self, prompt: str, code: str | None = None) -> str:
        return "ok-test"

    monkeypatch.setattr(Assistant, "get_assistant_response", fake_get_response, raising=True)

    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/api/assistant/add-system-message", json={"message": "test system"})
        assert resp.status_code == 200
        assert resp.json()["message"] == "System message added"

        resp2 = await ac.post("/api/assistant", json={"prompt": "Hello", "code": None})
        assert resp2.status_code == 200
        assert resp2.json()["response"] == "ok-test" 