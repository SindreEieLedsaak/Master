from backend.models.code_feedback import CodeFeedback
from backend.models.task import Task


class LearningTracker:
    def __init__(self):
        self.task_history: list[tuple[Task, CodeFeedback]] = []
    
    def add_task_attempt(self, task: Task, feedback: CodeFeedback):
        self.task_history.append((task, feedback))
    
    def analyze_patterns(self) -> dict[str, float]:
        # Implement pattern analysis based on task history
        # Returns dict of skill areas and their scores
        pass
    
    def suggest_next_task(self) -> Task:
        # Implement task suggestion based on pattern analysis
        pass
