import requests
from services.config import ASSISTANT_URL

def get_guidance(prompt):
    """
    Get AI guidance for the given prompt
    
    Args:
        prompt (str): User prompt or code
    
    Returns:
        str: AI guidance or error message
    """
    try:
        payload = {"prompt": prompt}
        response = requests.post(ASSISTANT_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "No guidance returned.")
    except Exception as e:
        return f"Error communicating with backend: {str(e)}"