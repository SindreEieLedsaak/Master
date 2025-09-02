from pydantic import BaseModel
from typing import Optional, List

class FileModel(BaseModel):
    name: str
    content: str
    language: str

class TaskInfo(BaseModel):
    id: str
    title: Optional[str] = None
    description: Optional[str] = None

class SaveEditorStateRequest(BaseModel):
    user_id: str
    files: List[FileModel]
    active_file: str
    task: Optional[TaskInfo] = None

class EditorStateResponse(BaseModel):
    user_id: str
    files: List[FileModel]
    active_file: str
    task: Optional[TaskInfo] = None 