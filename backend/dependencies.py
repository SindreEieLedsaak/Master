"""
Shared dependencies for FastAPI routers.
"""
from fastapi import Depends, HTTPException, Request
from backend.services.auth_service import AuthService
from typing import Dict


async def get_current_user(request: Request, auth_service: AuthService = Depends(AuthService)) -> Dict[str, str]:
    """
    Dependency to get the current authenticated user from the request.
    
    Args:
        request: FastAPI request object
        auth_service: AuthService dependency
        
    Returns:
        Dict containing user ID and GitLab username
        
    Raises:
        HTTPException: If user is not authenticated or token is invalid
    """
    token = request.cookies.get("app_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = auth_service.decode_access_token(token)
        return {"id": payload.get("sub"), "gitlab_username": payload.get("name")}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
