import base64
import gitlab
import os
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL", "https://git.app.uib.no")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")

class GitlabService:
    def __init__(self):
        self.gl = gitlab.Gitlab(GITLAB_URL, private_token=GITLAB_TOKEN)
    
    def get_user_projects(self):
        """
        Get all projects for a specific GitLab username
        
        Args:
            gitlab_username (str): GitLab username
            
        Returns:
            list: List of project metadata and stats
        """

        data = []
        owned_projects = self.gl.projects.list(owned=True, all=True)
        for proj in owned_projects:
            # print(self.get_project_files(proj.id))
            # Extract relevant data from the project
            project_data = self._extract_project_data(proj)
            data.append(project_data)
            # Store or process the project data as needed
        return data
    
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
        
    def get_file_content(self, project_id: int, file_path: str, ref: str = "main") -> str | None:
        """Fetch a single file's text content (decoded) from a project."""
        try:
            project = self.gl.projects.get(project_id)
            f = project.files.get(file_path=file_path, ref=ref)
            # content is base64-encoded
            return base64.b64decode(f.content).decode("utf-8")
        except Exception:
            return None

    def get_project_files(self, project_id: int, ref: str = "main") -> dict[str, str]:
        """
        Walk the repo_tree, fetch text files only, return {path:content}.
        """
        project = self.gl.projects.get(project_id)
        files = {}
        print(project.repository_tree(recursive=True, ref=ref))
        for item in project.repository_tree(recursive=True, ref=ref):
            if item["type"] == "blob":
                path = item["path"]
                # simple filter on extension
                if any(path.endswith(ext) for ext in (".py", ".js", ".md", ".txt", ".json", ".yaml")):
                    content = self.get_file_content(project_id, path, ref)
                    if content is not None:
                        files[path] = content
        return files

    def store_projects_for_student(self,
                                   student_id: str,
                                   gitlab_username: str,
                                   ref: str = "main") -> dict:
        projects = self.get_user_projects(gitlab_username)
        student_collection = get_student_collection(student_id)

        for proj in projects:
            pid = proj["project_id"]
            # fetch & attach file contents
            proj["files"] = self.get_project_files(pid, ref)
            student_collection.update_one(
                {"project_id": pid},
                {"$set": proj},
                upsert=True
            )

        return {
            "success": True,
            "stored": len(projects)
        }