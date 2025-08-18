from pydantic import BaseModel, Field
from typing import Optional, Any
from bson import ObjectId
from datetime import datetime
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: Any
    ) -> core_schema.CoreSchema:
        def validate_from_str(value: str) -> ObjectId:
            if ObjectId.is_valid(value):
                return ObjectId(value)
            raise ValueError("Invalid ObjectId")

        from_str_schema = core_schema.chain_schema(
            [
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(validate_from_str),
            ]
        )

        return core_schema.json_or_python_schema(
            json_schema=from_str_schema,
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    from_str_schema,
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

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
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()} 