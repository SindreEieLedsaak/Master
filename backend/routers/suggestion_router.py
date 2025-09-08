from fastapi import APIRouter, Depends, HTTPException, Request
from backend.services.suggestion_service import SuggestionService
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

@router.delete("/suggestions/{suggestion_id}", tags=["Suggestions"])
def delete_suggestion(
    suggestion_id: str,
    suggestion_service: SuggestionService = Depends(SuggestionService),
    current_user = Depends(get_current_user)
):
    """
    Deletes a suggestion by its ID.
    """
    success = suggestion_service.delete(suggestion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    return {"message": "Suggestion deleted successfully"} 