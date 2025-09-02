import { api } from '../http';
import type { StudentProjects } from '../types';

export async function syncGitlabProjects(gitlabUsername: string): Promise<any> {
    const response = await api.post('api/students/sync', { gitlab_username: gitlabUsername });
    return response.data;
}

export async function getStudentProjects(studentId: string): Promise<StudentProjects> {
    const response = await api.get(`/api/student/${studentId}/projects`);
    return response.data;
}

export async function getNumberOfProjects(studentId: string): Promise<number> {
    const response = await api.get(`/api/student/${studentId}/projects/count`);
    return response.data;
}

export async function getNumberOfFiles(studentId: string): Promise<number> {
    const response = await api.get(`/api/student/${studentId}/files/count`);
    return response.data;
}