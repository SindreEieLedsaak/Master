from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
from backend.analyzer.code_analyzer import CodeAnalyzer
from backend.analyzer.project_analyzer import ProjectAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse
from backend.ai.assistant import Assistant

# This router will handle general API endpoints
router = APIRouter()

class AnalysisRequest(BaseModel):
    student_id: str
    
class CodeInput(BaseModel):
    code: str

@router.get("/analyze-student-projects/{student_id}")
async def analyze_student_projects(student_id: str):
    """
    Analyzes all Python projects for a given student.
    """
    try:
        project_analyzer = ProjectAnalyzer()
        feedback = project_analyzer.analyze_student_projects(student_id)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-python")
async def run_python(code_input: CodeInput):
    try:
        result = subprocess.run(
            ["python", "-c", code_input.code],
            capture_output=True,
            text=True,
            check=True
        )
        return {"output": result.stdout}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr)

@router.post("/assistant", response_model=AssistantResponse)
async def get_assistant_response(request: AssistantRequest):
    assistant = Assistant.get_instance()
    
    response = assistant.get_assistant_response(request.prompt, request.code)
    return AssistantResponse(response=response)

