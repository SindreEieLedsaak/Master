import { api } from '../http';

export async function getAssistantResponse(prompt: string, code?: string, sessionId?: string): Promise<{ response: string }> {
    const response = await api.post('/api/assistant', { prompt, code, session_id: sessionId });
    return response.data;
}

export async function clearAssistant(sessionId?: string, systemMessage?: string): Promise<{ message: string; session_id: string }> {
    const response = await api.post('/api/assistant/clear', { session_id: sessionId, system_message: systemMessage });
    return response.data;
}

export async function addSystemMessage(message: string, sessionId?: string): Promise<{ message: string; session_id: string }> {
    const response = await api.post('/api/assistant/add-system-message', { message, session_id: sessionId });
    return response.data;
}

export async function createAssistantSession(sessionId?: string, systemMessage?: string): Promise<{ session_id: string; message: string }> {
    const response = await api.post('/api/assistant/create-session', { session_id: sessionId, system_message: systemMessage });
    return response.data;
}

export async function deleteAssistantSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/assistant/session/${sessionId}`);
    return response.data;
} 