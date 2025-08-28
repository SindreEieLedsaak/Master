from fastapi import APIRouter, Request, Depends, Response
from starlette.responses import RedirectResponse
from backend.services.auth_service import AuthService
from backend.services.student_service import StudentService
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.get('/login')
async def login(request: Request, auth_service: AuthService = Depends()):
    redirect_uri = 'http://localhost:8000/api/auth/callback'
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

        # Create redirect response
        response = RedirectResponse(
            url=f"http://localhost:3000/auth/callback?token={access_token}&user_id={student.id}&username={student.gitlab_username}"
        )
        
        # Store GitLab token in secure cookie
        encrypted_token = auth_service.encrypt_token(gitlab_access_token)
        response.set_cookie(
            key="gitlab_token",
            value=encrypted_token,
            max_age=expires_in,  # Use GitLab token expiration
            httponly=True,       # Prevent XSS
            secure=False,        # Set to True for production HTTPS
            samesite="lax",      # CSRF protection
            domain="localhost"   # Ensure cookie is accessible across localhost ports
        )
        
        return response

    return RedirectResponse(url="/login?error=true")

@router.post('/logout')
async def logout(response: Response):
    """Clear the GitLab token cookie"""
    response.delete_cookie("gitlab_token")
    return {"message": "Logged out successfully"} 