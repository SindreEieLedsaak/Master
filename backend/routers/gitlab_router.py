from fastapi import APIRouter, Depends, HTTPException
from backend.gitlab.gitlab_service import GitlabService

router = APIRouter()



@router.get("/student/{student_id}/projects", tags=["GitLab"])
async def get_student_projects(student_id: str, gitlab_service: GitlabService = Depends(GitlabService)):
    """Get all stored projects for a student"""
    try:
        collection = gitlab_service.get_student_collection(student_id)
        projects = list(collection.find({}, {'_id': 0}))
        return {"student_id": student_id, "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 