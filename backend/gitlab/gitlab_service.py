import base64
import gitlab
import os
from dotenv import load_dotenv
from datetime import datetime
from ..mongodb.MongoDB import get_collection, get_db_connection
from pymongo.collection import Collection


load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL", "https://git.app.uib.no")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")

class GitlabService:
    def __init__(self):
        self.gl = gitlab.Gitlab(GITLAB_URL, private_token=GITLAB_TOKEN)
    
    def get_user_projects(self):
        """
        Get all projects for the authenticated GitLab user.
        """
        data = []
        owned_projects = self.gl.projects.list(owned=True, all=True)
        for proj in owned_projects:
            project_data = self._extract_project_data(proj)
            data.append(project_data)
        return data
    
    def _extract_project_data(self, project):
        """Extract relevant data from a GitLab project"""
        project_obj = self.gl.projects.get(project.id)
        
        # Determine the default branch or use a sensible default like "main"
        default_ref = getattr(project_obj, 'default_branch', 'main')

        data = {
            "project_id": project.id,
            # Ensure get_project_files is called with the determined ref
            "files" : self.get_project_files(project.id, ref=default_ref), 
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
    
    def store_projects_for_student(self, student_id: str):
        """
        Fetch and store all GitLab projects for a student
        
        Args:
            student_id (str): Internal student ID
            gitlab_username (str): GitLab username
            
        Returns:
            dict: Result of the operation with count of stored projects
        """
        projects = self.get_user_projects()
        if "error" in projects:
            return projects
        
        # Get the MongoDB collection for this student
        student_collection = self.get_student_collection(student_id)
        
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
        try:
            # Add all=True to fetch all items from the repository tree
            tree_items = project.repository_tree(recursive=True, ref=ref, all=True)
            # You can remove the print statement below if you no longer need it for debugging
            # print(tree_items) 
            for item in tree_items:
                if item["type"] == "blob":
                    path = item["path"]
                    # simple filter on extension
                    if any(path.endswith(ext) for ext in (".py", ".js", ".md", ".txt", ".json", ".yaml", ".java")): # Added .java based on your log
                        content = self.get_file_content(project_id, path, ref)
                        if content is not None:
                            files[path] = content
        except gitlab.GitlabGetError as e:
            print(f"Error getting project {project_id} when trying to list files: {e}")
        except gitlab.GitlabListError as e: # Catching potential error from repository_tree
            print(f"Error listing repository tree for project {project_id} (ref: {ref}): {e}")
        except Exception as e:
            print(f"An unexpected error occurred in get_project_files for project {project_id}: {e}")
            
        
        return files

    def get_student_collection(self, student_id: str) -> Collection:
        db = get_db_connection("students")
        collection = get_collection(student_id, db)
        return collection
        
