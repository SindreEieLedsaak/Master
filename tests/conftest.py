import os
import sys
import importlib.util
import pytest
from fastapi.testclient import TestClient

# Optional: only import mongomock if available
try:
    import mongomock
except ImportError:  
    mongomock = None


os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["MODE"] = "dev"


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
APP_FILE = os.path.join(PROJECT_ROOT, 'app.py')
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

spec = importlib.util.spec_from_file_location('app', APP_FILE)
app_module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(app_module)
app = app_module.app

@pytest.fixture(autouse=True)
def mock_mongo(monkeypatch: pytest.MonkeyPatch):
    """
    Replace real MongoDB access with an in-memory mongomock client for all tests.
    Any call to backend.mongodb.MongoDB.get_db_connection(...) returns a mongomock DB.
    This keeps tests fast, isolated, and side-effect free.
    """
    if mongomock is None:
        pytest.skip("mongomock not installed; skip DB mocking")

    from backend.mongodb import MongoDB as MongoModule

    client = mongomock.MongoClient()

    def fake_get_db_connection(db_name=None):
        return client[db_name or os.getenv("DB_NAME", "test_db")]

    monkeypatch.setattr(MongoModule, 'get_db_connection', fake_get_db_connection, raising=True)
    yield

@pytest.fixture()
def client():
    """
    Provide a FastAPI TestClient against the real app, with DB mocked by the autouse fixture.
    """
    return TestClient(app) 