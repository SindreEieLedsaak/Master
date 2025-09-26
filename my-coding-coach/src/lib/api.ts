import { api, API_BASE_URL } from './http';
export type { CodeAnalysis, AIAnalysis, Suggestion, Project, StudentProjects } from './types';

import * as Assistant from './api/assistant';
import * as Code from './api/code';
import * as AI from './api/ai';
import * as Suggestions from './api/suggestions';
import * as Auth from './api/auth';
import * as Students from './api/students';

export const apiClient = {
    // Code Analysis
    analyzeCode: Code.analyzeCode,
    runPython: Code.runPython,

    // AI Analysis
    analyzeStudentProjects: AI.analyzeStudentProjects,
    getAISuggestions: AI.getAISuggestions,
    createAISuggestions: AI.createAISuggestions,
    getStoredAnalysis: AI.getStoredAnalysis,

    // Assistant
    getAssistantResponse: Assistant.getAssistantResponse,
    clearAssistant: Assistant.clearAssistant,
    addSystemMessage: Assistant.addSystemMessage,

    // Suggestions CRUD
    getSuggestions: Suggestions.getSuggestions,
    createSuggestion: Suggestions.createSuggestion,
    updateSuggestion: Suggestions.updateSuggestion,
    deleteSuggestion: Suggestions.deleteSuggestion,

    // Authentication
    login: Auth.login,
    logout: Auth.logout,
    refreshToken: Auth.refreshToken,

    // Students
    syncGitlabProjects: Students.syncGitlabProjects,

    // Projects
    getStudentProjects: Students.getStudentProjects,
    getNumberOfProjects: Students.getNumberOfProjects,
    getNumberOfFiles: Students.getNumberOfFiles,

    // Editor state
    loadEditorState: Students.loadEditorState,
    saveEditorState: Students.saveEditorState,
}; 