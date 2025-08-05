from backend.mongodb.MongoDB import get_db_connection
from backend.ai.assistant import Assistant
from datetime import datetime
from backend.ai.ai_analyzer import AIAnalyzer
class AIProjectAnalyzer:
    def __init__(self, student_id: str):
        self.student_id = student_id
        self.db = get_db_connection("students")
        self.projects_collection = self.db[student_id]
        self.analysis_collection = self.db["code_analyses"]
        self.suggestions_collection = self.db["suggested_tasks"]
        self.ai_analyzer = AIAnalyzer.get_instance()

    def analyze_and_store_student_projects(self) -> str:
        """
        Analyzes a student's code, stores the analysis in the database,
        and returns the analysis.
        """
        all_code = self._get_all_student_code()
        if not all_code:
            return "No Python code found for this student to analyze."

        prompt = self._create_analysis_prompt(all_code)
        analysis = self.ai_analyzer.get_ai_response(prompt)
        
        # Store the analysis, replacing any old one for this student
        self.analysis_collection.update_one(
            {"student_id": self.student_id},
            {
                "$set": {
                    "analysis": analysis,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        return analysis

    def create_project_suggestions(self) -> list[str]:
        """
        Generates new project suggestions based on the last stored analysis,
        ensuring they haven't been suggested before.
        """
        # Step 1: Get the latest analysis
        latest_analysis_doc = self.analysis_collection.find_one(
            {"student_id": self.student_id}
        )
        if not latest_analysis_doc:
            raise ValueError("No analysis found for this student. Please run the analysis first.")
        
        code_analysis = latest_analysis_doc["analysis"]

        # Step 2: Get previously suggested tasks
        past_suggestions_docs = self.suggestions_collection.find(
            {"student_id": self.student_id}
        )
        past_suggestions = [doc["suggestion"] for doc in past_suggestions_docs]

        # Step 3: Generate new suggestions
        prompt = self._create_suggestion_prompt(code_analysis, past_suggestions)
        new_suggestions_text = self.ai_analyzer.get_ai_response(prompt)
        
        # Simple parsing of suggestions (assumes one suggestion per line)
        new_suggestions = [s.strip() for s in new_suggestions_text.split('\n') if s.strip()]

        # Step 4: Store the new suggestions
        for suggestion in new_suggestions:
            self.suggestions_collection.insert_one({
                "student_id": self.student_id,
                
                "suggestion": suggestion,
                "created_at": datetime.utcnow()
            })

        return new_suggestions

    def _get_all_student_code(self) -> str:
        """Fetches and concatenates all Python code for the student."""
        projects = list(self.projects_collection.find({}))
        all_code = ""
        for project in projects:
            project_name = project.get("name", "Unknown Project")
            if "files" in project and isinstance(project["files"], dict):
                for file_path, file_content in project["files"].items():
                    if file_content:
                        all_code += f"# FILE: {project_name}/{file_path}\n"
                        all_code += file_content + "\n\n"
        return all_code.strip()

    def _create_suggestion_prompt(self, code_analysis: str, past_suggestions: list[str]) -> str:
        """Creates a prompt to suggest projects, avoiding past ones."""
        prompt = (
            "You are a programming mentor. Based on the following code analysis, "
            "suggest 2-3 new, small projects or tasks for a student to practice and improve. "
            "The projects should be small and focused on a single concept or skill. "
            "Include a description of the project and the skills it will help the student improve inline with the code analysis."
            "Crucially, you MUST NOT suggest any of the tasks that have been suggested before.\n\n"
            "--- CODE ANALYSIS ---\n"
            f"{code_analysis}\n\n"
            "--- PREVIOUSLY SUGGESTED TASKS (DO NOT REPEAT THESE) ---\n"
            f"{' - ' + chr(10) + ' - '.join(past_suggestions) if past_suggestions else 'None'}\n\n"
            "Please provide only the new project ideas, one per line. Do not add any extra commentary."
        )
        return prompt

    def _create_analysis_prompt(self, code: str) -> str:
        """Creates a prompt for the AI to analyze the student's code."""
        prompt = (
            "You are an expert code reviewer and a helpful teaching assistant. "
            "Your task is to analyze the following Python code written by a student. "
            "The code is concatenated from multiple files and projects.\n\n"
            "Please provide a comprehensive analysis of the student's coding style, focusing on the following aspects:\n"
            "1.  **Overall Code Quality**: Give a general impression of the code quality (e.g., clean, messy, well-structured, etc.).\n"
            "2.  **Naming Conventions**: Comment on the use of variable, function, and class names. Are they descriptive and do they follow Python conventions (e.g., snake_case for functions/variables, PascalCase for classes)?\n"
            "3.  **Code Structure and Readability**: Assess the code's organization. Is it easy to read and understand? Is there good use of functions and classes? Are there overly complex functions that could be broken down?\n"
            "4.  **Potential Bugs or Semantic Issues**: Identify any potential bugs, logical errors, or anti-patterns in the code.\n"
            "5.  **Strengths**: Point out what the student is doing well.\n"
            "6.  **Areas for Improvement**: Provide clear, constructive, and actionable suggestions for how the student can improve their code. Frame this as helpful advice, not harsh criticism.\n\n"
            "Here is the student's code:\n\n"
            "```python\n"
            f"{code}\n"
            "```\n\n"
            "Please structure your response in clear sections. Do not just repeat the code back to me."
        )
        return prompt 

    def get_project_suggestions(self) -> list[str]:
        """
        Retrieves previously generated project suggestions.
        """
        suggestions = list(self.suggestions_collection.find({"student_id": self.student_id}))
        return [suggestion["suggestion"] for suggestion in suggestions]

    def delete_project_suggestions(self, suggestion_id: str) -> str:
        """
        Deletes a previously generated project suggestion.
        """
        self.suggestions_collection.delete_one({"_id": suggestion_id})
        return "Suggestion deleted successfully"

    def delete_all_project_suggestions(self) -> str:
        """
        Deletes all previously generated project suggestions.
        """
        self.suggestions_collection.delete_many({"student_id": self.student_id})
        return "All suggestions deleted successfully"
    
    def get_stored_analysis(self) -> dict | None:
        """
        Retrieves the stored analysis for this student.
        """
        analysis_doc = self.analysis_collection.find_one({"student_id": self.student_id})
        print(analysis_doc)
        if analysis_doc:
            return {
                "analysis": analysis_doc["analysis"],
                "created_at": analysis_doc["created_at"]
            }
        return None
    
    