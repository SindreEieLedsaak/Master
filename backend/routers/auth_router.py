from fastapi import APIRouter, Request, Depends, Response
from starlette.responses import RedirectResponse
from backend.services.auth_service import AuthService
from backend.services.student_service import StudentService
from datetime import timedelta
import os
from urllib.parse import urlparse

router = APIRouter(prefix="/auth", tags=["Authentication"])

ACCESS_TOKEN_EXPIRE_MINUTES = 30

MODE = os.getenv('MODE', 'dev')
backend_url = os.getenv("BACKEND_URL")
frontend_url = os.getenv("FRONTEND_URL")

if MODE == "dev":
    backend_url = "http://localhost:8000"
    frontend_url = "http://localhost:3000"
else:
    backend_url = os.getenv("BACKEND_URL")
    frontend_url = os.getenv("FRONTEND_URL")

@router.get('/login')
async def login(request: Request, auth_service: AuthService = Depends()):
    redirect_uri = f'{backend_url}/api/auth/callback'
    oauth = auth_service.get_oauth()
    if not oauth or not hasattr(oauth, "gitlab") or oauth.gitlab is None:
        return RedirectResponse(url="/login?error=oauth_not_configured")
    return await oauth.gitlab.authorize_redirect(request, redirect_uri)

@router.get('/callback')
async def auth_callback(
    request: Request, 
    auth_service: AuthService = Depends(),
    student_service: StudentService = Depends()
):
    token = await auth_service.get_oauth().gitlab.authorize_access_token(request)
    user_info = token.get('userinfo')
    gitlab_access_token = token.get('access_token')
    expires_in = token.get('expires_in', 7200) 

    if user_info and gitlab_access_token:
        # Create student record (no token storage in DB)
        student = student_service.get_or_create_student(
            gitlab_username=user_info.get('preferred_username')
        )
        
        # Create a JWT for our application
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_service.create_access_token(
            data={"sub": student.id, "name": student.gitlab_username}, 
            expires_delta=access_token_expires
        )

        if MODE == "dev":
            cookie_domain = "localhost"
            use_secure = False
        else:
            parsed_frontend = urlparse(frontend_url)
            cookie_domain = parsed_frontend.hostname or 'localhost'
            use_secure = parsed_frontend.scheme == 'https'

        # Create redirect response
        response = RedirectResponse(
            url=f"{frontend_url}/auth/callback?token={access_token}&user_id={student.id}&username={student.gitlab_username}"
        )
        
        # Store GitLab token in secure cookie
        encrypted_token = auth_service.encrypt_token(gitlab_access_token)
        response.set_cookie(
            key="gitlab_token",
            value=encrypted_token,
            max_age=expires_in,  # Use GitLab token expiration
            httponly=True,       # Prevent XSS
            secure=use_secure,   # HTTPS in production
            samesite="lax",     # CSRF protection
            domain=cookie_domain # Cookie domain aligned with frontend
        )
        
        return response

    return RedirectResponse(url="/login?error=true")

@router.post('/logout')
async def logout(response: Response):
    """Clear the GitLab token cookie"""
    response.delete_cookie("gitlab_token")
    return {"message": "Logged out successfully"} 