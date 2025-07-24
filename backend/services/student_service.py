from backend.models.student import Student
from backend.gitlab.gitlab_service import GitlabService
from backend.mongodb.MongoDB import get_db_connection

class StudentService:
    def __init__(self):
        self.db = get_db_connection("students")
        self.student_collection = self.db["student_registry"]
        self.gitlab_service = GitlabService()

    def get_or_create_student(self, gitlab_username: str) -> Student:
        """
        Retrieves a student by their GitLab username, or creates a new one
        if they don't exist.
        """
        # Check if student already exists
        existing_student = self.student_collection.find_one({"gitlab_username": gitlab_username})
        
        if existing_student:
            # Pydantic models can be created from dictionaries
            return Student(**existing_student)

        # If not, create a new student
        new_student = Student(gitlab_username=gitlab_username)
        
        self.student_collection.insert_one(new_student.model_dump(by_alias=True))
        
        # Optionally, you can trigger an initial project fetch here
        # self.gitlab_service.store_projects_for_student(
        #     student_id=new_student.id,
        #     gitlab_username=new_student.gitlab_username
        # )
        
        return new_student 