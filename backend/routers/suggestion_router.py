from fastapi import APIRouter, Depends, HTTPException
from backend.services.suggestion_service import SuggestionService
from backend.dependencies import get_current_user

router = APIRouter()




@router.delete("/suggestions/{suggestion_id}", tags=["Suggestions"])
def delete_suggestion(
    suggestion_id: str,
    suggestion_service: SuggestionService = Depends(SuggestionService),
    current_user = Depends(get_current_user)
):
    """
    Deletes a suggestion by its ID.
    """
    suggestion = suggestion_service.get_one(suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    if suggestion.get("student_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    success = suggestion_service.delete(suggestion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    return {"message": "Suggestion deleted successfully"} 