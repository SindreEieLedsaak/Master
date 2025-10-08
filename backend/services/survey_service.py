from backend.models.survey import PreTaskSurveyRequest, PostTaskSurveyRequest, TaskResultRequest, OverallSurveyRequest, SurveySession
from backend.mongodb.MongoDB import get_db_connection
from datetime import datetime
import uuid


class SurveyService:
    db = get_db_connection("students")
    pre_survey_collection = db["pre_survey"]
    post_survey_collection = db["post_survey"]
    task_result_collection = db["task_result"]
    overall_survey_collection = db["overall_survey"]
    survey_sessions_collection = db["survey_sessions"]

    def start_session(self, participant_id: str, survey_type: str) -> SurveySession:
        """Start a new survey session"""
        session = SurveySession(
            participant_id=participant_id,
            started_at=datetime.utcnow(),
            survey_id=str(uuid.uuid4()),
            survey_type=survey_type,
            current_task_index=1
        )
        self.survey_sessions_collection.insert_one(session.model_dump(by_alias=True))
        return session

    def create_pre_survey(self, pre_survey: PreTaskSurveyRequest):
        self.pre_survey_collection.insert_one(pre_survey.model_dump(by_alias=True))

    def create_post_survey(self, post_survey: PostTaskSurveyRequest):
        self.post_survey_collection.insert_one(post_survey.model_dump(by_alias=True))

    def create_task_result(self, task_result: TaskResultRequest):
        self.task_result_collection.insert_one(task_result.model_dump(by_alias=True))

    def create_overall_survey(self, overall_survey: OverallSurveyRequest):
        self.overall_survey_collection.insert_one(overall_survey.model_dump(by_alias=True))

    def get_pre_survey(self, participant_id: str):
        return self.pre_survey_collection.find_one({"participant_id": participant_id})

    def get_post_survey(self, participant_id: str):
        return self.post_survey_collection.find_one({"participant_id": participant_id})

    def get_task_result(self, participant_id: str):
        return self.task_result_collection.find_one({"participant_id": participant_id})
        
    def get_overall_survey(self, participant_id: str):
        return self.overall_survey_collection.find_one({"participant_id": participant_id})