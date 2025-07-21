import os

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")

ANALYZE_URL        = f"{API_BASE_URL}/analyze-code"
RUN_PYTHON_URL     = f"{API_BASE_URL}/run-python"
ASSISTANT_URL      = f"{API_BASE_URL}/assistant"
GITLAB_FETCH_URL   = f"{API_BASE_URL}/gitlab/fetch-projects"
GITLAB_LIST_URL    = f"{API_BASE_URL}/gitlab/student"   # call GET {GITLAB_LIST_URL}/{student_id}/projects
GITLAB_ANALYZE_URL = f"{API_BASE_URL}/gitlab/analyze-projects"