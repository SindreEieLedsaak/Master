import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAssistantResponse, addSystemMessage, clearAssistant } from '../assistant';
import { api } from '../../http';

vi.mock('../../http', () => {
    const post = vi.fn();
    return {
        api: { post },
    };
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('assistant api', () => {
    it('getAssistantResponse posts prompt and code', async () => {
        (api.post as any).mockResolvedValue({ data: { response: 'ok' } });
        const res = await getAssistantResponse('hi', 'code');
        expect(api.post).toHaveBeenCalledWith('/api/assistant', { prompt: 'hi', code: 'code' });
        expect(res.response).toBe('ok');
    });

    it('clearAssistant posts to clear', async () => {
        (api.post as any).mockResolvedValue({ data: { message: 'cleared' } });
        const res = await clearAssistant();
        expect(api.post).toHaveBeenCalledWith('/api/assistant/clear');
        expect(res.message).toBe('cleared');
    });

    it('addSystemMessage posts with json body', async () => {
        (api.post as any).mockResolvedValue({ data: { message: 'added' } });
        const res = await addSystemMessage('hello');
        expect(api.post).toHaveBeenCalledWith('/api/assistant/add-system-message', { message: 'hello' });
        expect(res.message).toBe('added');
    });
}); 