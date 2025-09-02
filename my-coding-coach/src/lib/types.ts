export interface CodeAnalysis {
    semantic_errors: string[];
    style_issues: string[];
    quality_score: string;
    improvement_suggestions: string[];
}

export interface AIAnalysis {
    analysis: string;
}

export interface Suggestion {
    _id: string;
    student_id: string;
    suggestion: string;
    created_at: string;
}

export interface Project {
    name: string;
    description?: string;
    files: Record<string, string>;
    updated_at: string;
    language?: string;
}

export interface StudentProjects {
    student_id: string;
    projects: Project[];
} 