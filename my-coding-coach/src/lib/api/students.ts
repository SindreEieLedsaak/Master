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

export interface EditorFileDTO {
    name: string;
    content: string;
    language: string;
}

export interface TaskInfoDTO {
    id: string;
    title?: string;
    description?: string;
}

export interface EditorStateDTO {
    user_id: string;
    files: EditorFileDTO[];
    active_file: string;
    task?: TaskInfoDTO;
}

export async function saveEditorState(userId: string, state: Omit<EditorStateDTO, 'user_id'>): Promise<EditorStateDTO> {
    const response = await api.post(`/api/students/${userId}/editor-state`, { user_id: userId, ...state });
    return response.data;
}

export async function loadEditorState(userId: string): Promise<EditorStateDTO> {
    const response = await api.get(`/api/students/${userId}/editor-state`);
    return response.data;
}