from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
from backend.analyzer.code_analyzer import CodeAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse
from backend.ai.assistant import Assistant

router = APIRouter()

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