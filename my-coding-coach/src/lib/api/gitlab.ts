import { api } from '../http';

export async function getProjectCount(studentId: string): Promise<{ count: number }> {
    const res = await api.get(`/api/student/${studentId}/projects/count`);
    return res.data;
}

export async function getFileCount(studentId: string): Promise<{ count: number }> {
    const res = await api.get(`/api/student/${studentId}/files/count`);
    return res.data;
} 