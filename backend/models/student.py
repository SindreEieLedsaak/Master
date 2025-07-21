import uuid
from pydantic import BaseModel, Field

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    gitlab_username: str

    class Config:
        allow_population_by_field_name = True 