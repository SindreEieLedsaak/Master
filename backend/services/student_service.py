from backend.models.student import Student
from backend.gitlab.gitlab_service import GitlabService
from backend.mongodb.MongoDB import get_db_connection
from backend.services.auth_service import AuthService

class StudentService:
    def __init__(self):
        self.db = get_db_connection("students")
        self.student_collection = self.db["student_registry"]
        self.gitlab_service = GitlabService()
        self.auth_service = AuthService()

    def get_or_create_student(self, gitlab_username: str) -> Student:
        """
        Retrieves a student by their GitLab username, or creates a new one
        if they don't exist. No token storage in database.
        """
        # Check if student already exists
        existing_student = self.student_collection.find_one({"gitlab_username": gitlab_username})
        
        if existing_student:
            return Student(**existing_student)

        # If not, create a new student (no token field)
        new_student = Student(gitlab_username=gitlab_username)
        
        self.student_collection.insert_one(new_student.model_dump(by_alias=True))

        return new_student
    
    def sync_student_with_token(self, gitlab_username: str, encrypted_gitlab_token: str):
        """
        Syncs a student's projects from GitLab using the provided encrypted token from cookie
        """
        student = self.get_or_create_student(gitlab_username)
        
        if not encrypted_gitlab_token:
            raise ValueError("No GitLab token found. Please re-authenticate.")
        
        # Decrypt the token for use
        try:
            decrypted_token = self.auth_service.decrypt_token(encrypted_gitlab_token)
            print(f"🔓 Token decrypted successfully. Length: {len(decrypted_token)}")
            print(f"🔑 Token starts with: {decrypted_token[:10]}...")
        except Exception as e:
            print(f"❌ Failed to decrypt token: {e}")
            raise ValueError("Invalid GitLab token. Please re-authenticate.")
        
        result = self.gitlab_service.store_projects_for_student(
            student_id=student.id,
            gitlab_username=student.gitlab_username,
            gitlab_token=decrypted_token)

        print(result)

        return result



    def get_last_sync_date(self, student_id: str) -> str:
        """
        Get the last sync date for a student
        """
        student = self.student_collection.find_one({"id": student_id})
        return student["last_sync_date"]
    
    def update_last_sync_date(self, student_id: str, last_sync_date: str):
        """
        Update the last sync date for a student
        """
        self.student_collection.update_one({"id": student_id}, {"$set": {"last_sync_date": last_sync_date}})    
