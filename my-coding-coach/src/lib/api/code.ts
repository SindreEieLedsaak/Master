import { api } from '../http';
import type { CodeAnalysis } from '../types';

export async function analyzeCode(code: string): Promise<CodeAnalysis> {
    const response = await api.post('/api/analyze-code', { code });
    return response.data;
}

export async function runPython(code: string): Promise<{ output: string }> {
    const response = await api.post('/api/run-python', { code });
    return response.data;
} 