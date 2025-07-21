from backend.models.student import Student
from backend.gitlab.gitlab_service import GitlabService
from backend.mongodb.MongoDB import get_db_connection

class StudentService:
    def __init__(self):
        self.db = get_db_connection("students")
        self.student_collection = self.db["_student_registry"]
        self.gitlab_service = GitlabService()

    def create_student(self, gitlab_username: str) -> Student:
        # Create a new student instance, which generates a unique ID
        student = Student(gitlab_username=gitlab_username)
        
        # Store the new student's data in the registry
        self.student_collection.insert_one(student.model_dump(by_alias=True))
        
        # Fetch and store the student's GitLab projects
        self.gitlab_service.store_projects_for_student(
            student_id=student.id,
            gitlab_username=student.gitlab_username
        )
        
        return student 