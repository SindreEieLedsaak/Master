from fastapi import APIRouter, Depends, HTTPException
from backend.services.suggestion_service import SuggestionService

router = APIRouter()

@router.delete("/suggestions/{suggestion_id}", tags=["Suggestions"])
def delete_suggestion(
    suggestion_id: str,
    suggestion_service: SuggestionService = Depends(SuggestionService)
):
    """
    Deletes a suggestion by its ID.
    """
    success = suggestion_service.delete(suggestion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    return {"message": "Suggestion deleted successfully"} 