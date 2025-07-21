from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.services.student_service import StudentService
from backend.models.student import Student

router = APIRouter()

class StudentCreateRequest(BaseModel):
    gitlab_username: str

@router.post("/students", response_model=Student, tags=["Students"])
def create_student(
    request: StudentCreateRequest,
    student_service: StudentService = Depends(StudentService)
):
    try:
        student = student_service.create_student(request.gitlab_username)
        return student
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 