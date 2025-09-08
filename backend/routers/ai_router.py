from fastapi import APIRouter, HTTPException, Depends, Request
from backend.analyzer.project_analyzer import ProjectAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse, SystemMessageRequest
from backend.ai.assistant import Assistant
from backend.analyzer.ai_project_analyzer import AIProjectAnalyzer
from backend.services.auth_service import AuthService

router = APIRouter()

# --- Auth dependency ---
async def get_current_user(request: Request, auth_service: AuthService = Depends(AuthService)):
    token = request.cookies.get("app_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = auth_service.decode_access_token(token)
        return {"id": payload.get("sub"), "gitlab_username": payload.get("name")}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/ai-analyze-student-projects/{student_id}")
async def analyze_student_projects(student_id: str, current_user = Depends(get_current_user)):
    """
    Triggers an AI analysis of a student's projects and stores the result.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        analyzer = AIProjectAnalyzer(student_id)
        analysis = analyzer.analyze_and_store_student_projects()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-suggest-projects/{student_id}")
async def suggest_projects(student_id: str, current_user = Depends(get_current_user)):
    """
    Generates new project suggestions based on the latest AI analysis.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        analyzer = AIProjectAnalyzer(student_id)
        suggestions = analyzer.create_project_suggestions()
        return {"suggestions": suggestions}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai-get-suggestions/{student_id}")
async def get_suggestions(student_id: str, current_user = Depends(get_current_user)):
    """
    Retrieves previously generated project suggestions.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        analyzer = AIProjectAnalyzer(student_id)
        suggestions = analyzer.get_project_suggestions()
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant/add-system-message")
async def add_system_message(request: SystemMessageRequest, current_user = Depends(get_current_user)):
    """
    Adds a system message to the assistant.
    """
    try:
        assistant = Assistant.get_instance()
        assistant.add_system_message(request.message)
        return {"message": "System message added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/ai-delete-all-suggestions/{student_id}")
async def delete_all_suggestions(student_id: str, current_user = Depends(get_current_user)):
    """
    Deletes all previously generated project suggestions.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        analyzer = AIProjectAnalyzer(student_id)
        result = analyzer.delete_all_project_suggestions()
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai-get-analysis/{student_id}")
async def get_stored_analysis(student_id: str, current_user = Depends(get_current_user)):
    """
    Retrieves the stored analysis for a student.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        analyzer = AIProjectAnalyzer(student_id)
        analysis = analyzer.get_stored_analysis()

        if analysis:
            return {"analysis": analysis}
        else:
            raise HTTPException(status_code=404, detail="No analysis found for this student")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/ai-delete-suggestion/{student_id}/{suggestion_id}")
async def delete_suggestion(student_id: str, suggestion_id: str, current_user = Depends(get_current_user)):
    """
    Deletes a previously generated project suggestion.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        analyzer = AIProjectAnalyzer(student_id)
        result = analyzer.delete_project_suggestions(suggestion_id)
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant/clear")
async def clear_assistant_messages(current_user = Depends(get_current_user)):
    """
    Clears all assistant messages.
    """
    try:
        assistant = Assistant.get_instance()
        assistant.reset_conversation()
        return {"message": "Assistant messages cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant", response_model=AssistantResponse)
async def get_assistant_response(request: AssistantRequest, current_user = Depends(get_current_user)):
    assistant = Assistant.get_instance()
    
    response = assistant.get_assistant_response(request.prompt, request.code)
    return AssistantResponse(response=response)

@router.get("/analyze-student-projects/{student_id}")
async def analyze_student_projects(student_id: str, current_user = Depends(get_current_user)):
    """
    Analyzes all Python projects for a given student.
    """
    if current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        project_analyzer = ProjectAnalyzer()
        feedback = project_analyzer.analyze_student_projects(student_id)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))