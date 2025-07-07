from fastapi import APIRouter, Depends, HTTPException
from backend.gitlab.gitlab_service import GitlabService

router = APIRouter()

@router.post("/students/{student_id}/gitlab-projects", tags=["GitLab"])
async def store_student_projects(student_id: str, gitlab_service: GitlabService = Depends(GitlabService)):
    """
    Fetches and stores all GitLab projects for a given student.
    """
    try:
        result = gitlab_service.store_projects_for_student(student_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/projects", tags=["GitLab"])
async def get_student_projects(student_id: str, gitlab_service: GitlabService = Depends(GitlabService)):
    """Get all stored projects for a student"""
    try:
        collection = gitlab_service.get_student_collection(student_id)
        projects = list(collection.find({}, {'_id': 0}))
        return {"student_id": student_id, "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 