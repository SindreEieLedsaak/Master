import ast
import builtins
from backend.models.code_feedback import CodeFeedback
from backend.models.code_quailty_metric import CodeQualityMetric

class CodeAnalyzer:
    def __init__(self):
        self.ast_parser = ast.parse
        # Common acceptable single-letter variables in specific contexts
        self.valid_single_letters = {
            'i', 'j', 'k',  # Common loop indices
            'x', 'y', 'z',  # Common coordinate variables
            'n', 'm',       # Common size/length variables
            'e'            # Common exception variable
        }
        # Python built-in functions and types to check against
        self.python_builtins = set(dir(builtins))
        
    def analyze_code(self, code: str) -> CodeFeedback:
        try:
            tree = self.ast_parser(code)
            semantic_errors = self._check_semantic_errors(tree)
            style_issues = self._check_style_issues(code)
            quality_score = self._evaluate_quality(tree, semantic_errors, style_issues)
            suggestions = self._generate_suggestions(semantic_errors, style_issues)
            
            return CodeFeedback(
                semantic_errors=semantic_errors,
                style_issues=style_issues,
                quality_score=quality_score,
                improvement_suggestions=suggestions
            )
        except SyntaxError as e:
            return CodeFeedback(
                semantic_errors=[f"Syntax error: {str(e)}"],
                style_issues=[],
                quality_score=CodeQualityMetric.POOR,
                improvement_suggestions=["Fix the syntax error before proceeding"]
            )
    
    def _check_semantic_errors(self, tree: ast.AST) -> list[str]:
        errors = []
        # Dictionary to store assignments for simple variable names.
        assignments = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        assignments[target.id] = node.value
                        if target.id in self.python_builtins:
                            errors.append(f"Variable name '{target.id}' shadows a Python built-in")
                        self._check_variable_name(target.id, errors, node)
            
            elif isinstance(node, ast.FunctionDef):
                for arg in node.args.args:
                    self._check_variable_name(arg.arg, errors, node)
            
            elif isinstance(node, ast.ClassDef):
                if not node.name[0].isupper():
                    errors.append(f"Class name '{node.name}' should start with an uppercase letter")
            
            elif isinstance(node, ast.Compare):
                # Check for usage of the equality operator (==)
                for op in node.ops:
                    if isinstance(op, ast.Eq):
                        # Optionally check if the left-hand side is a variable that was assigned via a call.
                        if isinstance(node.left, ast.Name) and node.left.id in assignments:
                            assigned_value = assignments[node.left.id]
                            if isinstance(assigned_value, ast.Call):
                                errors.append("Comparing objects with '==' may not behave as expected if __eq__ is not implemented.")
                                break
                        else:
                            # For non-tracked cases, still warn the user.
                            errors.append("Usage of '==' operator detected; verify that this is the intended comparison.")
                            break
                
                if len(node.ops) > 1:
                    errors.append("Multiple comparisons in a single statement may lead to unexpected behavior")
        
        return errors

    
    def _check_variable_name(self, name: str, errors: list[str], context_node: ast.AST) -> None:
        """
        Check if a variable name follows Python naming conventions.
        Takes into account the context where the variable is used.
        """
        # Skip if it's a special name (like '_' for unused variables)
        if name == '_':
            return
            
        # Check if it's a single letter
        if len(name) == 1:
            # Allow single letters in for loops and except statements if they're in the valid set
            if name in self.valid_single_letters:
                if not self._is_in_valid_context(name, context_node):
                    errors.append(f"Single-letter variable '{name}' should only be used in loops or exception handling")
            else:
                errors.append(f"Single-letter variable '{name}' is not a conventional choice")
            return
            
        # Check for snake_case naming convention
        if not name.islower() and '_' in name:
            if not any(c.isupper() for c in name):
                errors.append(f"Variable '{name}' should use snake_case naming convention")
        
        # Check for common naming mistakes
        if name.startswith('_') and not name.startswith('__'):
            if not any(c.isupper() for c in name[1:]):
                # Single underscore should be used for internal/private variables
                if len(name) == 2:
                    errors.append(f"Single underscore variable '{name}' is too short")
        
        # Check for meaningless names
        meaningless_names = {'foo', 'bar', 'baz', 'temp', 'tmp'}
        if name.lower() in meaningless_names:
            errors.append(f"Variable name '{name}' is too generic")
    
    def _is_in_valid_context(self, name: str, node: ast.AST) -> bool:
        """
        Check if a single-letter variable is used in a valid context
        (like loop variables or exception handling)
        """
        # Find the parent context
        for parent in ast.walk(node):
            # Valid in for loops
            if isinstance(parent, ast.For) and isinstance(parent.target, ast.Name):
                if parent.target.id == name:
                    return True
            # Valid in except clauses
            elif isinstance(parent, ast.ExceptHandler):
                if getattr(parent, 'name', None) == name:
                    return True
        return False
    
    def _check_style_issues(self, code: str) -> list[str]:
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for tabs
            if '\t' in line:
                issues.append(f"Line {i} contains tabs instead of spaces")
            
            # Check for multiple statements on one line
            if ';' in line and not ('"' in line or "'" in line):
                issues.append(f"Line {i} contains multiple statements")
        
        return issues
    
    def _evaluate_quality(self, tree: ast.AST, errors: list[str], style_issues: list[str]) -> CodeQualityMetric:
        total_issues = len(errors) + len(style_issues)
        if total_issues == 0:
            return CodeQualityMetric.EXCELLENT
        elif total_issues <= 2:
            return CodeQualityMetric.GOOD
        elif total_issues <= 4:
            return CodeQualityMetric.SATISFACTORY
        elif total_issues <= 6:
            return CodeQualityMetric.NEEDS_IMPROVEMENT
        return CodeQualityMetric.POOR
    
    def _generate_suggestions(self, errors: list[str], style_issues: list[str]) -> list[str]:
        suggestions = []
        for error in errors:
            suggestions.append(f"Consider fixing: {error}")
        for issue in style_issues:
            suggestions.append(f"Style improvement: {issue}")
        return suggestions