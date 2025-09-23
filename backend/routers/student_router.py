from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from backend.services.student_service import StudentService
from backend.models.student import Student
from backend.services.suggestion_service import SuggestionService
from backend.models.suggestion import SuggestionInDB
from typing import List, Optional, Dict
from backend.models.editor_state import SaveEditorStateRequest, EditorStateResponse
from backend.mongodb.MongoDB import get_db_connection
from backend.dependencies import get_current_user

router = APIRouter()

class StudentCreateRequest(BaseModel):
    gitlab_username: str

class StudentSyncRequest(BaseModel):
    gitlab_username: str

@router.get("/students/{student_id}/suggestions", response_model=List[SuggestionInDB], tags=["Students", "Suggestions"])
def get_student_suggestions(
    student_id: str,
    suggestion_service: SuggestionService = Depends(SuggestionService),
    current_user: Dict[str, str] = Depends(get_current_user)
):
    """
    Retrieves all suggestions for a specific student.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    suggestions = suggestion_service.get_all_for_student(student_id)
    
    return suggestions

@router.post("/students", response_model=Student, tags=["Students"])
def create_student(
    request: StudentCreateRequest,
    student_service: StudentService = Depends(StudentService),
    current_user: Dict[str, str] = Depends(get_current_user)
):
    # Optionally ensure the creator matches the username they're creating
    if current_user["gitlab_username"] != request.gitlab_username:
        raise HTTPException(status_code=403, detail="Can only create your own student record")
    try:
        student = student_service.get_or_create_student(request.gitlab_username)
        return student
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 

@router.get("/students/test-cookies", tags=["Students"])
def test_cookies(request: Request, current_user: Dict[str, str] = Depends(get_current_user)):
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
    student_service: StudentService = Depends(StudentService),
    current_user: Dict[str, str] = Depends(get_current_user)
):

    # Ensure the sync is for the logged-in user
    if current_user["gitlab_username"] != sync_request.gitlab_username:
        raise HTTPException(status_code=403, detail="Forbidden")
    
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

@router.post("/students/{user_id}/editor-state", tags=["Students"], response_model=EditorStateResponse)
def save_editor_state(user_id: str, payload: SaveEditorStateRequest, current_user: Dict[str, str] = Depends(get_current_user)):
    """Save the current editor files/active file and optional task for a user."""
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        db = get_db_connection("students")
        coll = db["editor_state"]
        doc = payload.model_dump()
        coll.update_one({"user_id": user_id}, {"$set": doc}, upsert=True)
        saved = coll.find_one({"user_id": user_id}, {"_id": 0})
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/{user_id}/editor-state", tags=["Students"], response_model=EditorStateResponse)
def load_editor_state(user_id: str, current_user: Dict[str, str] = Depends(get_current_user)):
    """Load the last saved editor state for a user if present."""
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        db = get_db_connection("students")
        coll = db["editor_state"]
        doc = coll.find_one({"user_id": user_id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="No editor state found")
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 