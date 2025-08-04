import base64
import gitlab
import os
import requests
from dotenv import load_dotenv
from datetime import datetime
from ..mongodb.MongoDB import get_collection, get_db_connection
from pymongo.collection import Collection


load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL", "https://git.app.uib.no")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")

class GitlabService:
    def __init__(self):
        # Initialize with default token if available
        if GITLAB_TOKEN:
            self.gl = gitlab.Gitlab(GITLAB_URL, private_token=GITLAB_TOKEN)
        else:
            self.gl = None
    
    def get_user_projects_with_user_token(self, gitlab_username: str, user_token: str):
        """
        Get user projects using direct HTTP requests (bypassing python-gitlab library)
        """
        import requests
        
        print(f"🔗 Using GitLab URL: {GITLAB_URL}")
        print(f"👤 Fetching projects for user: {gitlab_username}")
        print(f"🔑 Token length: {len(user_token)}")
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        try:
            # Test authentication first
            print("🔍 Testing authentication with direct API call...")
            user_response = requests.get(f"{GITLAB_URL}/api/v4/user", headers=headers)
            
            if user_response.status_code != 200:
                print(f"❌ Authentication failed: {user_response.status_code} - {user_response.text}")
                return {"error": "Authentication failed", "message": f"Status {user_response.status_code}: {user_response.text}"}
            
            user_data = user_response.json()
            print(f"✅ Authentication successful! User: {user_data.get('username')}")
            
            # Fetch user's projects
            print("📁 Fetching user projects...")
            projects_response = requests.get(
                f"{GITLAB_URL}/api/v4/projects",
                headers=headers,
                params={"owned": "true", "membership": "true", "per_page": 100}
            )
            
            if projects_response.status_code != 200:
                print(f"❌ Failed to fetch projects: {projects_response.status_code} - {projects_response.text}")
                return {"error": "Failed to fetch projects", "message": f"Status {projects_response.status_code}: {projects_response.text}"}
            
            projects_data = projects_response.json()
            print(f"📁 Found {len(projects_data)} projects")
            
            # Process each project
            processed_projects = []
            for project in projects_data:
                try:
                    processed_project = self._extract_project_data_with_direct_api(project, user_token)
                    processed_projects.append(processed_project)
                except Exception as e:
                    print(f"⚠️ Failed to process project {project.get('name', 'unknown')}: {e}")
                    continue
            
            print(f"✅ Successfully processed {len(processed_projects)} projects")
            return processed_projects
            
        except Exception as e:
            print(f"❌ Error in get_user_projects_with_user_token: {e}")
            return {"error": "Error fetching projects", "message": str(e)}
    
    def _extract_project_data_with_user_token(self, project, user_token: str):
        """Extract project data using the user's token"""
        user_gl = gitlab.Gitlab(GITLAB_URL, private_token=user_token)
        project_obj = user_gl.projects.get(project.id)
        
        # Now you can access private repository files!
        default_ref = getattr(project_obj, 'default_branch', 'main')

        data = {
            "project_id": project.id,
            "files": self.get_project_files_with_user_token(project.id, ref=default_ref, user_token=user_token), 
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
    
    def _extract_project_data_with_direct_api(self, project_json: dict, user_token: str):
        """Extract project data using direct GitLab API calls (bypassing python-gitlab library)"""
        import requests
        
        project_id = project_json["id"]
        project_name = project_json["name"]
        default_branch = project_json.get("default_branch", "main")
        
        print(f"🔍 Processing project: {project_name} (ID: {project_id})")
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Get project languages
        languages = {}
        try:
            lang_response = requests.get(
                f"{GITLAB_URL}/api/v4/projects/{project_id}/languages",
                headers=headers
            )
            if lang_response.status_code == 200:
                languages = lang_response.json()
        except Exception as e:
            print(f"⚠️ Failed to get languages for {project_name}: {e}")
        
        # Get project files
        files = self.get_project_files_with_direct_api(project_id, default_branch, user_token)
        
        # Get commit count
        commit_count = 0
        try:
            commits_response = requests.get(
                f"{GITLAB_URL}/api/v4/projects/{project_id}/repository/commits",
                headers=headers,
                params={"per_page": 1}
            )
            if commits_response.status_code == 200:
                # Get total count from headers if available
                commit_count = len(commits_response.json()) if commits_response.json() else 0
        except Exception as e:
            print(f"⚠️ Failed to get commit count for {project_name}: {e}")
        
        # Build project data
        data = {
            "project_id": project_id,
            "files": files,
            "name": project_name,
            "description": project_json.get("description", ""),
            "url": project_json.get("web_url", ""),
            "created_at": project_json.get("created_at", ""),
            "last_activity_at": project_json.get("last_activity_at", ""),
            "fetched_at": datetime.now().isoformat(),
            "languages": languages,
            "stats": {
                "commit_count": commit_count,
                "file_count": len(files),
                "languages": languages,
                "readme_exists": any("readme" in filename.lower() for filename in files.keys())
            }
        }
        
        print(f"✅ Processed {project_name}: {len(files)} files, {len(languages)} languages")
        return data
    
    def get_project_files_with_direct_api(self, project_id: int, ref: str = "main", user_token: str = None) -> dict[str, str]:
        """
        Fetch project files using direct GitLab API calls (bypassing python-gitlab library)
        """
        import requests
        
        if not user_token:
            raise ValueError("User token must be provided for this method.")
        
        headers = {"Authorization": f"Bearer {user_token}"}
        files = {}
        
        try:
            # Get repository tree
            tree_response = requests.get(
                f"{GITLAB_URL}/api/v4/projects/{project_id}/repository/tree",
                headers=headers,
                params={"recursive": "true", "ref": ref, "per_page": 100}
            )
            
            if tree_response.status_code != 200:
                print(f"❌ Failed to get repository tree: {tree_response.status_code}")
                return files
            
            tree_items = tree_response.json()
            
            for item in tree_items:
                if item["type"] == "blob":
                    path = item["path"]
                    # Filter by file extension
                    if any(path.endswith(ext) for ext in [".py", ".js", ".md", ".txt", ".json", ".yaml", ".java"]):
                        content = self.get_file_content_with_direct_api(project_id, path, ref, user_token)
                        if content is not None:
                            files[path] = content
        
        except Exception as e:
            print(f"❌ Error in get_project_files_with_direct_api: {e}")
        
        return files
    
    def get_file_content_with_direct_api(self, project_id: int, file_path: str, ref: str = "main", user_token: str = None) -> str | None:
        """Fetch a single file's content using direct GitLab API calls"""
        import requests
        import base64
        
        if not user_token:
            return None
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        try:
            file_response = requests.get(
                f"{GITLAB_URL}/api/v4/projects/{project_id}/repository/files/{file_path.replace('/', '%2F')}",
                headers=headers,
                params={"ref": ref}
            )
            
            if file_response.status_code == 200:
                file_data = file_response.json()
                content = file_data.get("content", "")
                # Decode base64 content
                return base64.b64decode(content).decode("utf-8")
            else:
                print(f"⚠️ Failed to get file {file_path}: {file_response.status_code}")
                return None
                
        except Exception as e:
            print(f"⚠️ Error getting file {file_path}: {e}")
            return None
    
    def store_projects_for_student(self, student_id: str, gitlab_username: str, gitlab_token: str):
        """
        Fetch and store all GitLab projects for a student
        
        Args:
            student_id (str): Internal student ID
            gitlab_username (str): GitLab username
            
        Returns:
            dict: Result of the operation with count of stored projects
        """
        projects = self.get_user_projects_with_user_token(gitlab_username, gitlab_token)
        if isinstance(projects, dict) and "error" in projects:
            return projects
        
        # Get the MongoDB collection for this student
        student_collection = self.get_student_collection(student_id)
        
        # Store each project
        for project in projects:
            if isinstance(project, dict):
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
        
    def get_file_content(self, project_id: int, file_path: str, ref: str = "main", user_token: str | None = None) -> str | None:
        """Fetch a single file's text content (decoded) from a project."""
        try:
            if user_token:
                gl = gitlab.Gitlab(GITLAB_URL, private_token=user_token)
            elif self.gl:
                gl = self.gl
            else:
                raise ValueError("GitLab token is not configured.")
            
            project = gl.projects.get(project_id)
            f = project.files.get(file_path=file_path, ref=ref)
            # content is base64-encoded
            return base64.b64decode(f.content).decode("utf-8")
        except Exception as e:
            print(f"Error getting file content for project {project_id}: {e}")
            return None

    def get_project_files(self, project_id: int, ref: str = "main") -> dict[str, str]:
        """
        Walk the repo_tree, fetch text files only, return {path:content}.
        """
        if not self.gl:
            print("Warning: Default GitLab token is not set. Cannot fetch project files.")
            return {}

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

    def get_project_files_with_user_token(self, project_id: int, ref: str = "main", user_token: str | None = None) -> dict[str, str]:
        """
        Walk the repo_tree, fetch text files only, return {path:content}.
        Uses a specific user's token for authentication.
        """
        if not user_token:
            raise ValueError("User token must be provided for this method.")

        user_gl = gitlab.Gitlab(GITLAB_URL, private_token=user_token)
        files = {}
        try:
            # Add all=True to fetch all items from the repository tree
            tree_items = user_gl.projects.get(project_id).repository_tree(recursive=True, ref=ref, all=True)
            # You can remove the print statement below if you no longer need it for debugging
            # print(tree_items) 
            for item in tree_items:
                if item["type"] == "blob":
                    path = item["path"]
                    # simple filter on extension
                    if any(path.endswith(ext) for ext in (".py", ".js", ".md", ".txt", ".json", ".yaml", ".java")): # Added .java based on your log
                        content = self.get_file_content(project_id, path, ref, user_token=user_token)
                        if content is not None:
                            files[path] = content
        except gitlab.GitlabGetError as e:
            print(f"Error getting project {project_id} when trying to list files: {e}")
        except gitlab.GitlabListError as e: # Catching potential error from repository_tree
            print(f"Error listing repository tree for project {project_id} (ref: {ref}): {e}")
        except Exception as e:
            print(f"An unexpected error occurred in get_project_files_with_user_token for project {project_id}: {e}")
            
        
        return files

    def get_student_collection(self, student_id: str) -> Collection:
        db = get_db_connection("students")
        collection = get_collection(student_id, db)
        return collection
        
