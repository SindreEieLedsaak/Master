from dataclasses import dataclass

from backend.models.code_quailty_metric import CodeQualityMetric


@dataclass
class CodeFeedback:
    semantic_errors: list[str]
    style_issues: list[str]
    quality_score: CodeQualityMetric
    improvement_suggestions: list[str]
