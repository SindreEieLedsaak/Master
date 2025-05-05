import gitlab
import os
from dotenv import load_dotenv
from datetime import datetime
from backend.config.db_config import get_student_collection

load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL", "https://git.app.uib.no")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")

class GitlabService:
    def __init__(self):
        self.gl = gitlab.Gitlab(GITLAB_URL, private_token=GITLAB_TOKEN)
    
    def get_user_projects(self, gitlab_username):
        """
        Get all projects for a specific GitLab username
        
        Args:
            gitlab_username (str): GitLab username
            
        Returns:
            list: List of project metadata and stats
        """
        try:
            # Get user by username
            users = self.gl.users.list(username=gitlab_username)
            if not users:
                return {"error": f"User {gitlab_username} not found"}
            
            user = users[0]
            user_id = user.id
            
            # Get projects for the user
            projects = self.gl.users.get(user_id).projects.list(all=True)
            return [self._extract_project_data(project) for project in projects]
        except Exception as e:
            return {"error": str(e)}
    
    def _extract_project_data(self, project):
        """Extract relevant data from a GitLab project"""
        # Get additional information about the project
        project_obj = self.gl.projects.get(project.id)
        
        # Basic project metadata
        data = {
            "project_id": project.id,
            "name": project.name,
            "description": project.description,
            "url": project.web_url,
            "created_at": project.created_at,
            "last_activity_at": project.last_activity_at,
            "fetched_at": datetime.now().isoformat(),
            "languages": project_obj.languages(),
            "stats": {
                "commit_count": 0,
                "file_count": 0,
                "languages": {},
                "readme_exists": False
            }
        }
        
        # Get commit count
        try:
            commits = project_obj.commits.list(all=True)
            data["stats"]["commit_count"] = len(commits)
        except:
            pass
        
        # Get repository file information
        try:
            repo_tree = project_obj.repository_tree(recursive=True, all=True)
            data["stats"]["file_count"] = len(repo_tree)
            
            # Check if README exists
            for item in repo_tree:
                if item["name"].lower() == "readme.md":
                    data["stats"]["readme_exists"] = True
                    break
        except:
            pass
        
        return data
    
    def store_projects_for_student(self, student_id, gitlab_username):
        """
        Fetch and store all GitLab projects for a student
        
        Args:
            student_id (str): Internal student ID
            gitlab_username (str): GitLab username
            
        Returns:
            dict: Result of the operation with count of stored projects
        """
        projects = self.get_user_projects(gitlab_username)
        if "error" in projects:
            return projects
        
        # Get the MongoDB collection for this student
        student_collection = get_student_collection(student_id)
        
        # Store each project
        for project in projects:
            # Use GitLab project ID as document ID for upsert
            student_collection.update_one(
                {"project_id": project["project_id"]},
                {"$set": project},
                upsert=True
            )
        
        return {
            "success": True,
            "message": f"Stored {len(projects)} projects for student {student_id}",
            "project_count": len(projects)
        }