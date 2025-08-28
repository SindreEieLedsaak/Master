import { api } from '../http';

export async function getAssistantResponse(prompt: string, code?: string): Promise<{ response: string }> {
    const response = await api.post('/api/assistant', { prompt, code });
    return response.data;
}

export async function clearAssistant(): Promise<{ message: string }> {
    const response = await api.post('/api/assistant/clear');
    return response.data;
}

export async function addSystemMessage(message: string): Promise<{ message: string }> {
    const response = await api.post('/api/assistant/add-system-message', { message });
    return response.data;
} 