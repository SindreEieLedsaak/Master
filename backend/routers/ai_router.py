from fastapi import APIRouter, HTTPException
from backend.analyzer.project_analyzer import ProjectAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse, SystemMessageRequest
from backend.ai.assistant import Assistant
from backend.analyzer.ai_project_analyzer import AIProjectAnalyzer

router = APIRouter()

@router.post("/ai-analyze-student-projects/{student_id}")
async def analyze_student_projects(student_id: str):
    """
    Triggers an AI analysis of a student's projects and stores the result.
    """
    try:
        analyzer = AIProjectAnalyzer(student_id)
        analysis = analyzer.analyze_and_store_student_projects()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-suggest-projects/{student_id}")
async def suggest_projects(student_id: str):
    """
    Generates new project suggestions based on the latest AI analysis.
    """
    try:
        analyzer = AIProjectAnalyzer(student_id)
        suggestions = analyzer.create_project_suggestions()
        return {"suggestions": suggestions}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai-get-suggestions/{student_id}")
async def get_suggestions(student_id: str):
    """
    Retrieves previously generated project suggestions.
    """
    try:
        analyzer = AIProjectAnalyzer(student_id)
        suggestions = analyzer.get_project_suggestions()
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant/add-system-message")
async def add_system_message(request: SystemMessageRequest):
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
async def delete_all_suggestions(student_id: str):
    """
    Deletes all previously generated project suggestions.
    """
    try:
        analyzer = AIProjectAnalyzer(student_id)
        result = analyzer.delete_all_project_suggestions()
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai-get-analysis/{student_id}")
async def get_stored_analysis(student_id: str):
    """
    Retrieves the stored analysis for a student.
    """
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
async def delete_suggestion(student_id: str, suggestion_id: str):
    """
    Deletes a previously generated project suggestion.
    """
    try:
        analyzer = AIProjectAnalyzer(student_id)
        result = analyzer.delete_project_suggestions(suggestion_id)
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant/clear")
async def clear_assistant_messages():
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
async def get_assistant_response(request: AssistantRequest):
    assistant = Assistant.get_instance()
    
    response = assistant.get_assistant_response(request.prompt, request.code)
    return AssistantResponse(response=response)

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