'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user/UserContext';
import { apiClient, Project, StudentProjects, AIAnalysis } from '@/lib/api';
import { FolderOpen, Code2, Calendar, FileText, BarChart3, RefreshCw, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatAIResponseText } from '@/utils/textFormatter';

export default function ProjectsPage() {
    const { user } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const loadProjects = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await apiClient.getStudentProjects(user.id);
            setProjects(result.projects);

            // Also try to load existing analysis
            const analysisResult = await apiClient.getStoredAnalysis(user.id);
            if (analysisResult) {
                setAnalysis({ analysis: analysisResult.analysis.analysis });
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeProjects = async () => {
        if (!user) return;

        setIsAnalyzing(true);
        try {
            const result = await apiClient.analyzeStudentProjects(user.id);
            setAnalysis({ analysis: result.analysis });
            setShowAnalysis(true);
            toast.success('Analysis completed!');
        } catch (error) {
            console.error('Error analyzing projects:', error);
            toast.error('Failed to analyze projects');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleProject = (projectName: string) => {
        setExpandedProject(expandedProject === projectName ? null : projectName);
    };

    const getFileCount = (project: Project) => {
        return Object.keys(project.files || {}).length;
    };

    const getMainLanguage = (project: Project) => {
        const files = Object.keys(project.files || {});
        const extensions = files.map(file => file.split('.').pop()).filter(Boolean);
        const counts = extensions.reduce((acc, ext) => {
            acc[ext || ''] = (acc[ext || ''] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';
    };

    useEffect(() => {
        loadProjects();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view your projects
                    </h1>
                    <button
                        onClick={() => apiClient.login()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Login with GitLab
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
                            <p className="text-gray-600">
                                View your GitLab projects and get AI-powered code analysis
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={loadProjects}
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={analyzeProjects}
                                disabled={isAnalyzing || projects.length === 0}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <BarChart3 className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analysis Section */}
                {analysis && (
                    <div className="mb-8">
                        <div className="bg-white rounded-lg shadow">
                            <div
                                className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setShowAnalysis(!showAnalysis)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Code Analysis</h2>
                                            <p className="text-gray-600 text-sm">AI-powered analysis of your coding patterns</p>
                                        </div>
                                    </div>
                                    {showAnalysis ?
                                        <ChevronUp className="h-5 w-5 text-gray-400" /> :
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    }
                                </div>
                            </div>
                            {showAnalysis && (
                                <div className="p-6">
                                    <div className="bg-white rounded-lg border max-h-96 overflow-y-auto">
                                        <div className="p-6 prose prose-gray max-w-none">
                                            {formatAIResponseText(analysis.analysis)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="max-h-screen overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                            {projects.map((project, index) => (
                                <div key={`${project.name}-${index}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <FolderOpen className="h-6 w-6 text-blue-600 mr-3" />
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {project.name}
                                                    </h3>
                                                </div>
                                                {project.description && (
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center space-x-4">
                                                <span className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    {getFileCount(project)} files
                                                </span>
                                                <span className="flex items-center">
                                                    <Code2 className="h-4 w-4 mr-1" />
                                                    {getMainLanguage(project)}
                                                </span>
                                            </div>
                                            <span className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(project.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => toggleProject(project.name)}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {expandedProject === project.name ? 'Hide Files' : 'View Files'}
                                            {expandedProject === project.name ?
                                                <ChevronUp className="h-4 w-4 ml-2" /> :
                                                <ChevronDown className="h-4 w-4 ml-2" />
                                            }
                                        </button>

                                        {expandedProject === project.name && (
                                            <div className="mt-4 border-t pt-4">
                                                <h4 className="font-medium text-gray-900 mb-3">Project Files:</h4>
                                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                    {Object.entries(project.files || {}).map(([filePath, content]) => (
                                                        <div key={filePath} className="bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                                            <div className="p-3 border-b border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-mono font-medium text-gray-900 break-all">
                                                                        {filePath}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                                        {content ? `${content.split('\n').length} lines` : 'Empty'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {content && (
                                                                <div className="p-3">
                                                                    <pre className="text-xs font-mono text-gray-700 bg-white p-3 rounded border max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                                                                        {content.slice(0, 1000)}{content.length > 1000 ? '\n\n... (truncated)' : ''}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No projects found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Sync your GitLab projects to get started with code analysis.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Dashboard to Sync Projects
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 