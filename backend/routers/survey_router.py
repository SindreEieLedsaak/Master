from fastapi import APIRouter, Depends
from backend.models.survey import OverallSurveyRequest, PostTaskSurveyRequest, PreTaskSurveyRequest, TaskResultRequest
from backend.services.survey_service import SurveyService
from backend.dependencies import get_current_user

router = APIRouter(prefix="/survey", tags=["Survey"])

@router.post("/start")
def start_survey(survey_service: SurveyService = Depends(SurveyService), current_user = Depends(get_current_user)):
    """Start a new survey session"""
    session = survey_service.start_session(current_user["id"])
    return {"message": "Survey session started", "session_id": session.survey_id}

@router.post("/pre-task")
def create_pre_task_survey(pre_task_survey: PreTaskSurveyRequest, survey_service: SurveyService = Depends(SurveyService), current_user = Depends(get_current_user)):
    survey_service.create_pre_survey(pre_task_survey)
    return {"message": "Pre-task survey created successfully"}

@router.post("/post-task")
def create_post_task_survey(post_task_survey: PostTaskSurveyRequest, survey_service: SurveyService = Depends(SurveyService), current_user = Depends(get_current_user)):
    survey_service.create_post_survey(post_task_survey)
    return {"message": "Post-task survey created successfully"}

@router.post("/task-result")
def create_task_result(task_result: TaskResultRequest, survey_service: SurveyService = Depends(SurveyService), current_user = Depends(get_current_user)):
    survey_service.create_task_result(task_result)
    return {"message": "Task result created successfully"}

@router.post("/overall")
def create_overall_survey(overall_survey: OverallSurveyRequest, survey_service: SurveyService = Depends(SurveyService), current_user = Depends(get_current_user)):
    survey_service.create_overall_survey(overall_survey)
    return {"message": "Overall survey created successfully"}