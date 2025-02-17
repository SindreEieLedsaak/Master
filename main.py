from backend.analyzer.code_analyzer import CodeAnalyzer
from backend.learning.learning_tracker import LearningTracker
from utils.code_executor import run_code

def main():
    analyzer = CodeAnalyzer()
    tracker = LearningTracker()
    
    # Example usage
    sample_code = """  
car1 = 2  # ast.Call (constructor)
car2 = 1  # ast.Call (constructor)

if car1 == car2:  # Triggers warning
    print(1)
"""

    feedback = analyzer.analyze_code(sample_code)
    print("Code Analysis Results:")
    print(f"Quality Score: {feedback.quality_score}")
    print("\nSemantic Errors:")
    for error in feedback.semantic_errors:
        print(f"- {error}")
    print("\nStyle Issues:")
    for issue in feedback.style_issues:
        print(f"- {issue}")
    print("\nSuggestions:")
    for suggestion in feedback.improvement_suggestions:
        print(f"- {suggestion}")
    output = run_code(sample_code)
    print("\nCode Output:")
    print(output)

if __name__ == "__main__":
    main()