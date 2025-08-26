from backend.mongodb.MongoDB import get_db_connection
from backend.ai.assistant import Assistant
from datetime import datetime
from backend.ai.ai_analyzer import AIAnalyzer
import json
import re

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
        Generates comprehensive project suggestions with detailed explanations,
        starter code, and examples based on the student's analysis.
        """

        latest_analysis_doc = self.analysis_collection.find_one(
            {"student_id": self.student_id}
        )
        if not latest_analysis_doc:
            raise ValueError("No analysis found for this student. Please run the analysis first.")
        
        code_analysis = latest_analysis_doc["analysis"]


        past_suggestions_docs = self.suggestions_collection.find(
            {"student_id": self.student_id}
        )
        past_suggestions = [doc["suggestion"] for doc in past_suggestions_docs]


        prompt = self._create_comprehensive_suggestion_prompt(code_analysis, past_suggestions)
        suggestions_response = self.ai_analyzer.get_ai_response(prompt)
        

        parsed_suggestions = self._parse_comprehensive_suggestions(suggestions_response)
        
        for suggestion in parsed_suggestions:
            self.suggestions_collection.insert_one({
                "student_id": self.student_id,
                "suggestion": suggestion,
                "created_at": datetime.utcnow()
            })

        return parsed_suggestions

    def _parse_comprehensive_suggestions(self, suggestions_text: str) -> list[str]:
        """
        Parse the comprehensive suggestion response and return formatted suggestions.
        """
        # Split by task markers using a more compatible approach
        lines = suggestions_text.split('\n')
        current_task = []
        suggestions = []
        
        for line in lines:
            if re.match(r'##\s*Task\s*\d+', line):
                # Start of new task - save previous if exists
                if current_task:
                    task_text = '\n'.join(current_task).strip()
                    if task_text:
                        suggestions.append(task_text)
                current_task = [line]
            else:
                if current_task:  # Only add lines if we're inside a task
                    current_task.append(line)
        
        # Don't forget the last task
        if current_task:
            task_text = '\n'.join(current_task).strip()
            if task_text:
                suggestions.append(task_text)
        
        return suggestions if suggestions else [suggestions_text.strip()]

    def _create_comprehensive_suggestion_prompt(self, code_analysis: str, past_suggestions: list[str]) -> str:
        """
        Creates an enhanced prompt for generating comprehensive, educational task suggestions
        with detailed explanations, starter code, and examples.
        """
        prompt = f"""You are an expert Python programming instructor and mentor. Based on the student's code analysis, 
create 2-3 comprehensive, educational Python programming tasks that will help them improve their skills.

Each task should be a complete learning module that includes:
1. Clear task description and learning objectives
2. Specific requirements and constraints
3. Python starter code template with helpful comments
4. Expected output example
5. Step-by-step guidance hints
6. Skills this task will develop

**CRITICAL FORMATTING REQUIREMENTS:**
- Each task must start with "## Task [Number]: [Title]"
- Use markdown formatting with proper sections
- Include code blocks with ```python and ``` (PYTHON ONLY)
- Make tasks progressively challenging but achievable
- Focus on areas identified in the code analysis
- ALL CODE MUST BE PYTHON - NO OTHER LANGUAGES

**STUDENT CODE ANALYSIS:**
{code_analysis}

**PREVIOUSLY SUGGESTED TASKS (DO NOT REPEAT THESE):**
{chr(10).join([f"- {suggestion[:100]}..." for suggestion in past_suggestions]) if past_suggestions else "None"}

Generate exactly 2-3 new Python tasks following this format:

## Task 1: [Descriptive Title]

### Description
[Clear explanation of what the student will build and why it's important for Python development]

### Learning Objectives
- [Python-specific objective 1]
- [Python-specific objective 2]
- [Python-specific objective 3]

### Requirements
- [Python requirement 1]
- [Python requirement 2]
- [Python requirement 3]

### Starter Code
```python
# Python starter code with helpful comments
# TODO: [Specific instruction for student]

def main():
    # TODO: [What student should implement here in Python]
    pass

if __name__ == "__main__":
    main()
```

### Expected Output
```
[Example of what the Python program should produce when completed]
```

### Step-by-Step Guidance
1. [First step with specific Python action]
2. [Second step building on the first Python concept]
3. [Third step to complete the Python task]

### Skills Developed
- [Python skill 1]
- [Python skill 2]

---

[Repeat format for Task 2 and Task 3]

Remember: Base tasks on the student's current Python level and identified improvement areas. Make them engaging, practical, and educational. ALL CODE MUST BE PYTHON."""

        return prompt

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
        if analysis_doc:
            return {
                "analysis": analysis_doc["analysis"],
                "created_at": analysis_doc["created_at"]
            }
        return None
    
    