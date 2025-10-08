from fastapi import APIRouter, Request, Depends, Response, HTTPException
from starlette.responses import RedirectResponse
from backend.services.auth_service import AuthService
from backend.services.student_service import StudentService
from datetime import timedelta
import os
import re
from urllib.parse import urlparse

router = APIRouter(prefix="/auth", tags=["Authentication"])

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 30)

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
            # Strip quotes from environment variable if present
            clean_frontend_url = frontend_url.strip('"')
            parsed_frontend = urlparse(clean_frontend_url)
            hostname = parsed_frontend.hostname
            # Don't set domain for IP addresses - browsers reject cookies with domain set to IP
            is_ip = bool(re.match(r'^\d+\.\d+\.\d+\.\d+$', hostname or ''))
            cookie_domain = None if is_ip else hostname
            use_secure = parsed_frontend.scheme == 'https'

        # Create redirect response (no token in URL)
        clean_url = frontend_url.strip('"') if MODE != "dev" else frontend_url
        response = RedirectResponse(
            url=f"{clean_url}/auth/callback"
        )
        
        # Store GitLab token in secure cookie
        encrypted_token = auth_service.encrypt_token(gitlab_access_token)
        cookie_kwargs = {
            "key": "gitlab_token",
            "value": encrypted_token,
            "max_age": expires_in,
            "httponly": True,
            "secure": use_secure,
            "samesite": "lax"
        }
        if cookie_domain:
            cookie_kwargs["domain"] = cookie_domain
        response.set_cookie(**cookie_kwargs)
        
        # Store application JWT in secure cookie
        cookie_kwargs = {
            "key": "app_token",
            "value": access_token,
            "max_age": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "httponly": True,
            "secure": use_secure,
            "samesite": "lax"
        }
        if cookie_domain:
            cookie_kwargs["domain"] = cookie_domain
        response.set_cookie(**cookie_kwargs)
        
        # Also set a minimal non-HTTP-only user hint (optional) to avoid exposing token
        cookie_kwargs = {
            "key": "app_user",
            "value": student.gitlab_username,
            "max_age": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "httponly": False,
            "secure": use_secure,
            "samesite": "lax"
        }
        if cookie_domain:
            cookie_kwargs["domain"] = cookie_domain
        response.set_cookie(**cookie_kwargs)
        
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

@router.post('/refresh')
async def refresh_token(
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(AuthService)
):
    """Refresh the access token using the current valid token"""
    current_token = request.cookies.get("app_token")
    if not current_token:
        raise HTTPException(status_code=401, detail="No token found")
    
    try:
        # Decode current token to get user info
        payload = auth_service.decode_access_token(current_token)
        user_id = payload.get("sub")
        username = payload.get("name")
        
        if not user_id or not username:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Create new token with extended expiration
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = auth_service.create_access_token(
            data={"sub": user_id, "name": username},
            expires_delta=access_token_expires
        )
        
        # Update cookie with new token
        if MODE == "dev":
            cookie_domain = "localhost"
            use_secure = False
        else:
            parsed_frontend = urlparse(frontend_url.strip('"'))
            hostname = parsed_frontend.hostname
            # Don't set domain for IP addresses - browsers reject cookies with domain set to IP
            is_ip = bool(re.match(r'^\d+\.\d+\.\d+\.\d+$', hostname or ''))
            cookie_domain = None if is_ip else hostname
            use_secure = parsed_frontend.scheme == 'https'
        
        cookie_kwargs = {
            "key": "app_token",
            "value": new_access_token,
            "max_age": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "httponly": True,
            "secure": use_secure,
            "samesite": "lax"
        }
        if cookie_domain:
            cookie_kwargs["domain"] = cookie_domain
        response.set_cookie(**cookie_kwargs)
        
        return {"message": "Token refreshed successfully", "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60}
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Failed to refresh token")

@router.post('/logout')
async def logout(response: Response):
    """Clear authentication cookies"""
    # Mirror domain/flags used when setting cookies to ensure deletion
    if MODE == "dev":
        cookie_domain = "localhost"
        use_secure = False
    else:
        parsed_frontend = urlparse(frontend_url.strip('"'))
        hostname = parsed_frontend.hostname
        # Don't set domain for IP addresses - browsers reject cookies with domain set to IP
        import re
        is_ip = bool(re.match(r'^\d+\.\d+\.\d+\.\d+$', hostname or ''))
        cookie_domain = None if is_ip else hostname
        use_secure = parsed_frontend.scheme == 'https'

    # Delete cookies - omit domain parameter if it's None (for IP addresses)
    delete_kwargs = {"secure": use_secure, "httponly": True, "samesite": "lax"}
    if cookie_domain:
        delete_kwargs["domain"] = cookie_domain
    response.delete_cookie("gitlab_token", **delete_kwargs)
    response.delete_cookie("app_token", **delete_kwargs)
    
    delete_kwargs_user = {"secure": use_secure, "samesite": "lax"}
    if cookie_domain:
        delete_kwargs_user["domain"] = cookie_domain
    response.delete_cookie("app_user", **delete_kwargs_user)
    
    return {"message": "Logged out successfully"}