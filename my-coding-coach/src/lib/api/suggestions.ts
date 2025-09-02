import { api } from '../http';
import type { Suggestion } from '../types';

export async function getSuggestions(studentId: string): Promise<Suggestion[]> {
    const response = await api.get(`/api/students/${studentId}/suggestions`);
    if (response.status === 404) {
        alert("Make sure the code analysis has been run before generating suggestions");
        return [];
    }
    return response.data;
}

export async function createSuggestion(studentId: string, suggestion: string): Promise<Suggestion> {
    const response = await api.post(`/api/students/${studentId}/suggestions`, { suggestion });
    return response.data;
}

export async function updateSuggestion(suggestionId: string, suggestion: string): Promise<Suggestion> {
    const response = await api.put(`/api/suggestions/${suggestionId}`, { suggestion });
    return response.data;
}

export async function deleteSuggestion(suggestionId: string): Promise<void> {
    await api.delete(`/api/suggestions/${suggestionId}`);
} 