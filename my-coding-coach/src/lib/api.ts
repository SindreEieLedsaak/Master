import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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

export const apiClient = {
    // Code Analysis
    analyzeCode: async (code: string): Promise<CodeAnalysis> => {
        const response = await api.post('/api/analyze-code', { code });
        return response.data;
    },

    runPython: async (code: string): Promise<{ output: string }> => {
        const response = await api.post('/api/run-python', { code });
        return response.data;
    },

    // AI Analysis
    analyzeStudentProjects: async (studentId: string): Promise<AIAnalysis> => {
        const response = await api.post(`/api/ai/analyze/${studentId}`);
        return response.data;
    },

    getAISuggestions: async (studentId: string): Promise<{ suggestions: string[] }> => {
        const response = await api.get(`/api/ai/suggest/${studentId}`);
        return response.data;
    },

    // Assistant
    getAssistantResponse: async (prompt: string, code?: string): Promise<{ response: string }> => {
        const response = await api.post('/api/assistant', { prompt, code });
        return response.data;
    },

    // Suggestions CRUD
    getSuggestions: async (studentId: string): Promise<Suggestion[]> => {
        const response = await api.get(`/api/students/${studentId}/suggestions`);
        return response.data;
    },

    createSuggestion: async (studentId: string, suggestion: string): Promise<Suggestion> => {
        const response = await api.post(`/api/students/${studentId}/suggestions`, {
            suggestion,
        });
        return response.data;
    },

    updateSuggestion: async (suggestionId: string, suggestion: string): Promise<Suggestion> => {
        const response = await api.put(`/api/suggestions/${suggestionId}`, {
            suggestion,
        });
        return response.data;
    },

    deleteSuggestion: async (suggestionId: string): Promise<void> => {
        await api.delete(`/api/suggestions/${suggestionId}`);
    },

    // Authentication
    login: async (): Promise<void> => {
        window.location.href = `${API_BASE_URL}/api/auth/login`;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    // GitLa
    async syncGitlabProjects(gitlabUsername: string): Promise<any> {
        console.log(gitlabUsername);
        const response = await api.post('api/students/sync',
            { gitlab_username: gitlabUsername },
        );
        return response.data;
    },
}; 