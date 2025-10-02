from fastapi import APIRouter, HTTPException, Depends
from backend.analyzer.project_analyzer import ProjectAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse, SystemMessageRequest, SessionRequest
from backend.ai.assistant import Assistant
from backend.ai.session_assistant import SessionAssistantManager
from backend.analyzer.ai_project_analyzer import AIProjectAnalyzer
from backend.dependencies import get_current_user

router = APIRouter()

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
    Adds a system message to the assistant (session-based).
    """
    try:
        session_manager = SessionAssistantManager.get_instance()
        session_assistant = session_manager.get_assistant()
        
        # Use user ID as default session if none provided
        session_id = request.session_id or f"user_{current_user['id']}_default"
        
        session_assistant.get_or_create_session(session_id)
        session_assistant.add_system_message(session_id, request.message)
        
        return {"message": "System message added", "session_id": session_id}
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
async def clear_assistant_messages(request: SessionRequest, current_user = Depends(get_current_user)):
    """
    Clears assistant messages for a specific session.
    """
    try:
        session_manager = SessionAssistantManager.get_instance()
        session_assistant = session_manager.get_assistant()
        
        # Use user ID as default session if none provided
        session_id = request.session_id or f"user_{current_user['id']}_default"
        
        session_assistant.clear_session(session_id, request.system_message)
        
        return {"message": "Assistant messages cleared", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant", response_model=AssistantResponse)
async def get_assistant_response(request: AssistantRequest, current_user = Depends(get_current_user)):
    """
    Get assistant response for a specific session.
    """
    try:
        session_manager = SessionAssistantManager.get_instance()
        session_assistant = session_manager.get_assistant()
        
        # Use user ID as default session if none provided
        session_id = request.session_id or f"user_{current_user['id']}_default"
        
        # Create session if it doesn't exist (with default system prompt)
        session_assistant.get_or_create_session(session_id)
        
        response = session_assistant.get_assistant_response(session_id, request.prompt, request.code)
        return AssistantResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant/create-session")
async def create_assistant_session(request: SessionRequest, current_user = Depends(get_current_user)):
    """
    Create a new assistant session with optional custom system message.
    """
    try:
        session_manager = SessionAssistantManager.get_instance()
        session_assistant = session_manager.get_assistant()
        
        # Generate session ID if not provided
        session_id = request.session_id or f"user_{current_user['id']}_survey_{len(session_assistant.list_sessions())}"
        session_id = session_assistant.create_session(session_id, request.system_message)
        
        return {"session_id": session_id, "message": "Session created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/assistant/session/{session_id}")
async def delete_assistant_session(session_id: str, current_user = Depends(get_current_user)):
    """
    Delete a specific assistant session.
    """
    try:
        session_manager = SessionAssistantManager.get_instance()
        session_assistant = session_manager.get_assistant()
        
        session_assistant.delete_session(session_id)
        
        return {"message": "Session deleted successfully"}
    except Exception as e:
        # Don't raise error for session deletion failures - just log and return success
        print(f"Session deletion error (non-critical): {e}")
        return {"message": "Session deleted successfully"}

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