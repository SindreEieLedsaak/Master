import { api } from '../http';
import type { AIAnalysis } from '../types';

export async function analyzeStudentProjects(studentId: string): Promise<AIAnalysis> {
    const response = await api.post(`/api/ai-analyze-student-projects/${studentId}`);
    return response.data;
}

export async function getAISuggestions(studentId: string): Promise<{ suggestions: string[] }> {
    const response = await api.get(`/api/ai-get-suggestions/${studentId}`);
    return response.data;
}

export async function createAISuggestions(studentId: string): Promise<{ suggestions: string[] }> {
    const response = await api.post(`/api/ai-suggest-projects/${studentId}`);
    return response.data;
}

export async function getStoredAnalysis(studentId: string): Promise<{ analysis: { analysis: string, created_at: string } } | null> {
    try {
        const response = await api.get(`/api/ai-get-analysis/${studentId}`);
        return response.data;
    } catch (error) {
        return null;
    }
} 