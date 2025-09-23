from fastapi import APIRouter, Depends, HTTPException
from backend.gitlab.gitlab_service import GitlabService
from backend.dependencies import get_current_user

router = APIRouter()

@router.get("/student/{student_id}/projects", tags=["GitLab"])
async def get_student_projects(student_id: str, gitlab_service: GitlabService = Depends(GitlabService), current_user = Depends(get_current_user)):
    """Get all stored projects for a student"""
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        collection = gitlab_service.get_student_collection(student_id)
        projects = list(collection.find({}, {'_id': 0}))
        return {"student_id": student_id, "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@router.get("/student/{student_id}/projects/count", tags=["GitLab"])
async def get_student_projects_count(student_id: str, gitlab_service: GitlabService = Depends(GitlabService), current_user = Depends(get_current_user)):
    """Get the number of projects for a student"""
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        collection = gitlab_service.get_student_collection(student_id)
        count = collection.count_documents({})
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/files/count", tags=["GitLab"])
async def get_student_files_count(student_id: str, gitlab_service: GitlabService = Depends(GitlabService), current_user = Depends(get_current_user)):
    """Get the total number of files across all stored projects for a student."""
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        collection = gitlab_service.get_student_collection(student_id)
        total = 0
        for doc in collection.find({}, {"files": 1, "stats.file_count": 1, "_id": 0}):
            if isinstance(doc.get("files"), dict):
                total += len(doc["files"])
            elif isinstance(doc.get("stats"), dict) and isinstance(doc["stats"].get("file_count"), int):
                total += int(doc["stats"]["file_count"])
        return {"count": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 