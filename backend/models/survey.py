from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

    
class PreTaskSurveyRequest(BaseModel):
    participant_id: str
    field_of_study: str
    confidence_level: int = Field(ge=1, le=5)
    use_of_AI: bool
    which_AI: Optional[str] = None


class SurveySession(BaseModel):
    participant_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    survey_id: str
    current_task_index: int = 1

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

class TaskResultRequest(BaseModel):
    participant_id: str
    task_index: int = Field(ge=1, le=4)
    time_taken: int = Field(ge=1, le=7*60) # in seconds
    finished_within_time: bool
    code_files: List[Dict[str, str]]
    run_output: Optional[str] = None

class PostTaskSurveyRequest(BaseModel):
    participant_id: str
    task_index: int = Field(ge=1, le=4)
    finished_within_time: bool
    difficult_to_fix: int = Field(ge=1, le=5)
    helpful_understand: int = Field(ge=1, le=5)
    helpful_fix: int = Field(ge=1, le=5)
    thought_process: str
    feedback: str

class SuSItem(BaseModel):
    q7: int = Field(ge=1, le=5)
    q8: int = Field(ge=1, le=5)
    q9: int = Field(ge=1, le=5)
    q10: int = Field(ge=1, le=5)
    q11: int = Field(ge=1, le=5)
    q12: int = Field(ge=1, le=5)
    q13: int = Field(ge=1, le=5)
    q14: int = Field(ge=1, le=5)
    q15: int = Field(ge=1, le=5)
    q16: int = Field(ge=1, le=5)

class OverallSurveyRequest(BaseModel):
    participant_id: str
    sus : SuSItem
    future_use_likelihood: int = Field(ge=1, le=5)
    preferred_feedback_style: str
    preferred_feedback_reason: str
    other_comments: Optional[str] = None