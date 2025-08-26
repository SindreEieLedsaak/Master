import uuid
from pydantic import BaseModel, Field, ConfigDict

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    gitlab_username: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    ) 