import requests
from services.config import ANALYZE_URL, RUN_PYTHON_URL

def analyze_code(code):
    """
    Analyze code using the backend service
    
    Args:
        code (str): Code to analyze
    
    Returns:
        str: Analysis results or error message
    """
    try:
        payload = {"code": code}
        response = requests.post(ANALYZE_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("semantic_errors", "No feedback returned.")
    except Exception as e:
        return f"Error communicating with backend: {str(e)}"

def run_code_server(code):
    """
    Run code on the server
    
    Args:
        code (str): Code to run
    
    Returns:
        str: Output from running the code or error message
    """
    try:
        payload = {"code": code}
        response = requests.post(RUN_PYTHON_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("output", data.get("response", "No output returned."))
    except Exception as e:
        return f"Error communicating with backend: {str(e)}"