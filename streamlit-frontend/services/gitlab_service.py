import requests
from utils.config import GITLAB_FETCH_URL, API_BASE_URL

def fetch_gitlab_projects(token):
    """
    Fetch GitLab projects for a given student ID.
    """
    try:
        response = requests.post(
            GITLAB_FETCH_URL,
            json={"gitlab_token": token}
        )
        print(response.json())
        response.raise_for_status()
        data = response.json()
        if response.status_code == 200:
            return {
                "project_count": data.get("project_count", 0),
                "projects": data.get("projects", [])
            }
        else:
            return {"error": data.get("detail", "Unknown error occurred.")}
    except Exception as e:
        return {"error": f"Failed to connect to the server: {str(e)}"}

    