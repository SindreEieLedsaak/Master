from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
from backend.analyzer.code_analyzer import CodeAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse
from backend.ai.assistant import Assistant
from backend.gitlab.gitlab_service import GitlabService
from backend.analyzer.project_analyzer import ProjectAnalyzer

router = APIRouter()
gitlab_service = GitlabService()
project_analyzer = ProjectAnalyzer()

class GitLabUserRequest(BaseModel):
    student_id: str
    gitlab_username: str

class AnalysisRequest(BaseModel):
    student_id: str
    
    
class CodeInput(BaseModel):
    code: str

@router.post("/run-python")
async def run_python(code_input: CodeInput):
    try:
        # Execute the Python code (again, be very careful with arbitrary code)
        result = subprocess.run(
            ["python", "-c", code_input.code],
            capture_output=True,
            text=True,
            check=True
        )
        return {"output": result.stdout}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr)

@router.post("/analyze-code")
async def analyze_code(code_input: CodeInput):
    try:
        analyzer = CodeAnalyzer()
        feedback = analyzer.analyze_code(code_input.code)
        print(feedback.quality_score)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/assistant", response_model=AssistantResponse)
async def get_assistant_response(request: AssistantRequest):
    # We'll handle the assistant in app.py since it needs to be initialized
    from app import assistant
    response = assistant.get_assistant_response(request.prompt)
    return AssistantResponse(response=response)


@router.post("/gitlab/fetch-projects")
async def fetch_student_projects(request: GitLabUserRequest):
    """Fetch and store all GitLab projects for a student"""
    try:
        result = gitlab_service.store_projects_for_student(
            request.student_id, 
            request.gitlab_username
        )
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gitlab/analyze-projects")
async def analyze_student_projects(request: AnalysisRequest):
    """Analyze all stored projects for a student"""
    try:
        result = project_analyzer.analyze_student_projects(request.student_id)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gitlab/student/{student_id}/projects")
async def get_student_projects(student_id: str):
    """Get all stored projects for a student"""
    try:
        from backend.config.db_config import get_student_collection
        collection = get_student_collection(student_id)
        projects = list(collection.find({}, {'_id': 0}))
        return {"student_id": student_id, "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))