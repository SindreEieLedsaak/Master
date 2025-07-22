from backend.analyzer.code_analyzer import CodeAnalyzer
import base64
import gitlab
import os
from dotenv import load_dotenv
from backend.mongodb.MongoDB import get_collection, get_db_connection

load_dotenv()

GITLAB_URL = os.getenv("GITLAB_URL", "https://gitlab.com")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")

class ProjectAnalyzer:
    def __init__(self):
        self.gl = gitlab.Gitlab(GITLAB_URL, private_token=GITLAB_TOKEN)
        self.code_analyzer = CodeAnalyzer()
        self.db = get_db_connection("students")
    def analyze_student_projects(self, student_id):
        """
        Analyze all projects for a student and generate overall coding metrics
        
        Args:
            student_id (str): Student ID
            
        Returns:
            dict: Analysis results
        """
        collection = get_collection(student_id, self.db)
        projects = list(collection.find({}))
        
        if not projects:
            return {"error": f"No projects found for student {student_id}"}
        
        # Analysis metrics
        analysis = {
            "student_id": student_id,
            "project_count": len(projects),
            "analyzed_at": None,
            "language_distribution": {},
            "code_quality": {
                "average_score": 0,
                "quality_distribution": {
                    "excellent": 0,
                    "good": 0,
                    "satisfactory": 0,
                    "needs_improvement": 0,
                    "poor": 0
                }
            },
            "commit_frequency": {},
            "project_summaries": []
        }
        
        # Analyze each project
        for project in projects:
            project_analysis = self._analyze_single_project(project)
            if project_analysis:
                analysis["project_summaries"].append(project_analysis)
                
                # Update language distribution
                for lang, percentage in project.get("languages", {}).items():
                    if lang in analysis["language_distribution"]:
                        analysis["language_distribution"][lang] += percentage
                    else:
                        analysis["language_distribution"][lang] = percentage
                
                # Update quality distribution if available
                if "quality_score" in project_analysis:
                    quality = project_analysis["quality_score"].lower()
                    if quality in analysis["code_quality"]["quality_distribution"]:
                        analysis["code_quality"]["quality_distribution"][quality] += 1
        
        # Calculate average quality score
        quality_counts = analysis["code_quality"]["quality_distribution"]
        total_projects = sum(quality_counts.values())
        if total_projects > 0:
            # Calculate weighted average (5 for excellent, 1 for poor)
            weights = {"excellent": 5, "good": 4, "satisfactory": 3, "needs_improvement": 2, "poor": 1}
            weighted_sum = sum(weights[quality] * count for quality, count in quality_counts.items())
            analysis["code_quality"]["average_score"] = weighted_sum / total_projects
        
        return analysis
    
    def _analyze_single_project(self, project):
        """Analyze a single project and return metrics"""
        try:
            project_id = project["project_id"]
            project_obj = self.gl.projects.get(project_id)
            
            # Get repository tree for code files
            repo_tree = project_obj.repository_tree(recursive=True, all=True)
            
            # Filter to only include code files (not images, etc.)
            code_files = [f for f in repo_tree if self._is_code_file(f["name"])]
            
            # Sample some files for analysis (up to 5)
            sample_files = code_files[:5] if len(code_files) > 5 else code_files
            
            # Analyze each file
            file_analyses = []
            for file_info in sample_files:
                try:
                    file_content = project_obj.files.get(
                        file_path=file_info["path"], 
                        ref='master'
                    )
                    
                    # Decode content
                    code = base64.b64decode(file_content.content).decode('utf-8')
                    
                    # Only analyze Python files for now
                    if file_info["name"].endswith(".py"):
                        feedback = self.code_analyzer.analyze_code(code)
                        file_analyses.append({
                            "file_name": file_info["name"],
                            "quality_score": feedback.quality_score.name,
                            "semantic_errors": len(feedback.semantic_errors),
                            "style_issues": len(feedback.style_issues)
                        })
                except Exception as e:
                    continue
            
            # Overall project quality (average of files)
            average_quality = "SATISFACTORY"  # Default
            if file_analyses:
                # Map quality scores to numbers
                quality_map = {
                    "EXCELLENT": 5,
                    "GOOD": 4,
                    "SATISFACTORY": 3,
                    "NEEDS_IMPROVEMENT": 2,
                    "POOR": 1
                }
                
                # Calculate average
                total = sum(quality_map[analysis["quality_score"]] for analysis in file_analyses)
                avg = total / len(file_analyses)
                
                # Map back to quality score
                if avg >= 4.5:
                    average_quality = "EXCELLENT"
                elif avg >= 3.5:
                    average_quality = "GOOD"
                elif avg >= 2.5:
                    average_quality = "SATISFACTORY"
                elif avg >= 1.5:
                    average_quality = "NEEDS_IMPROVEMENT"
                else:
                    average_quality = "POOR"
            
            return {
                "project_name": project["name"],
                "file_count": len(code_files),
                "analyzed_files": len(file_analyses),
                "quality_score": average_quality,
                "file_analyses": file_analyses
            }
        except Exception as e:
            return None
    
    def _is_code_file(self, filename):
        """Check if a file is likely to be code based on extension"""
        code_extensions = [
            '.py', '.js', '.java', '.c', '.cpp', '.h', '.cs', '.php',
            '.rb', '.go', '.rs', '.ts', '.scala', '.kt', '.swift'
        ]
        return any(filename.endswith(ext) for ext in code_extensions)