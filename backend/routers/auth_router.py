from fastapi import APIRouter, Request, Depends
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

    if user_info:
        # Get or create the student in our database
        student = student_service.get_or_create_student(
            gitlab_username=user_info.get('preferred_username')
        )
        
        # Create a JWT for our application
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_service.create_access_token(
            data={"sub": student.id, "name": student.gitlab_username}, 
            expires_delta=access_token_expires
        )

        # Redirect to the frontend with the token
        response = RedirectResponse(url=f"http://localhost:3000/auth/callback?token={access_token}&user_id={student.id}&username={student.gitlab_username}")
        return response

    return RedirectResponse(url="/login?error=true") 