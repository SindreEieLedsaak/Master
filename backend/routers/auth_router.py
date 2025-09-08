from fastapi import APIRouter, Request, Depends, Response, HTTPException
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
    auth_service: AuthService = Depends(AuthService),
    student_service: StudentService = Depends(StudentService)
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

        # Create redirect response (no token in URL)
        response = RedirectResponse(
            url=f"{frontend_url}/auth/callback"
        )
        
        # Store GitLab token in secure cookie
        encrypted_token = auth_service.encrypt_token(gitlab_access_token)
        response.set_cookie(
            key="gitlab_token",
            value=encrypted_token,
            max_age=expires_in,  
            httponly=True,       
            secure=use_secure,   
            samesite="lax",     
            domain=cookie_domain 
        )
        
        # Store application JWT in secure cookie
        response.set_cookie(
            key="app_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            httponly=True,
            secure=use_secure,
            samesite="lax",
            domain=cookie_domain
        )
        
        # Also set a minimal non-HTTP-only user hint (optional) to avoid exposing token
        response.set_cookie(
            key="app_user",
            value=student.gitlab_username,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            httponly=False,
            secure=use_secure,
            samesite="lax",
            domain=cookie_domain
        )
        
        return response

    return RedirectResponse(url="/login?error=true")

@router.get('/me')
async def me(request: Request, auth_service: AuthService = Depends()):
    token = request.cookies.get("app_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = auth_service.decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": payload.get("sub"), "gitlab_username": payload.get("name")}

@router.post('/logout')
async def logout(response: Response):
    """Clear authentication cookies"""
    response.delete_cookie("gitlab_token")
    response.delete_cookie("app_token")
    response.delete_cookie("app_user")
    return {"message": "Logged out successfully"} 