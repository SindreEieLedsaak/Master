from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class SuggestionBase(BaseModel):
    suggestion: str

class SuggestionCreate(SuggestionBase):
    pass

class SuggestionUpdate(SuggestionBase):
    pass

class SuggestionInDB(SuggestionBase):
    id: str = Field(alias="_id")
    student_id: str
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()},
    ) 