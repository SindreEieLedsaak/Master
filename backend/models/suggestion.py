from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class SuggestionBase(BaseModel):
    suggestion: str

class SuggestionCreate(SuggestionBase):
    pass

class SuggestionUpdate(SuggestionBase):
    pass

class SuggestionInDB(SuggestionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    student_id: str
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()} 