import os

# API endpoints
ASSISTANT_URL = os.getenv("AI_URL", "http://localhost:8000/api/assistant")
ANALYZE_URL = os.getenv("AI_URL", "http://localhost:8000/api/analyze-code")
RUN_PYTHON_URL = os.getenv("AI_URL", "http://localhost:8000/api/run-python")