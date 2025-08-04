from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from backend.services.student_service import StudentService
from backend.models.student import Student

router = APIRouter()

class StudentCreateRequest(BaseModel):
    gitlab_username: str

class StudentSyncRequest(BaseModel):
    gitlab_username: str

@router.post("/students", response_model=Student, tags=["Students"])
def create_student(
    request: StudentCreateRequest,
    student_service: StudentService = Depends(StudentService)
):
    try:
        student = student_service.get_or_create_student(request.gitlab_username)
        return student
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 

@router.get("/students/test-cookies", tags=["Students"])
def test_cookies(request: Request):
    """Test endpoint to check if cookies are being received"""
    all_cookies = dict(request.cookies)
    gitlab_token = request.cookies.get("gitlab_token")
    return {
        "all_cookies": list(all_cookies.keys()),
        "gitlab_token_present": bool(gitlab_token),
        "gitlab_token_preview": gitlab_token[:20] + "..." if gitlab_token else None
    }

@router.post("/students/sync", tags=["Students"])
def sync_student(
    sync_request: StudentSyncRequest,
    request: Request,
    student_service: StudentService = Depends(StudentService)
):
    try:
        # Get GitLab token from secure cookie
        gitlab_token_cookie = request.cookies.get("gitlab_token")
        print(f"🍪 Cookies received: {list(request.cookies.keys())}")
        print(f"🔑 GitLab token cookie: {'Found' if gitlab_token_cookie else 'Not found'}")
        
        if not gitlab_token_cookie:
            raise HTTPException(
                status_code=401, 
                detail="No GitLab token found. Please re-authenticate."
            )
        
        result = student_service.sync_student_with_token(
            gitlab_username=sync_request.gitlab_username,
            encrypted_gitlab_token=gitlab_token_cookie
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 