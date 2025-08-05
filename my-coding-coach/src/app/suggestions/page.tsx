'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiClient } from '@/lib/api';
import { Lightbulb, Plus, RefreshCw, Play, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormattedAIText } from '@/utils/textFormatter';
import { useRouter } from 'next/navigation';

interface TaskData {
    title: string;
    description: string;
    fullContent: string;
    starterCode?: string;
}

export default function SuggestionsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [parsedTasks, setParsedTasks] = useState<TaskData[]>([]);
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const parseTaskFromSuggestion = (suggestion: string): TaskData => {
        // Extract title from ## Task X: Title format
        const titleMatch = suggestion.match(/##\s*Task\s*\d+:\s*(.+)/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Programming Task';

        // Extract description section - using split and find instead of lookahead
        const sections = suggestion.split(/###\s*/);
        let description = '';
        for (const section of sections) {
            if (section.toLowerCase().startsWith('description')) {
                const lines = section.split('\n').slice(1);
                description = lines.join('\n').trim();
                break;
            }
        }
        if (!description) {
            description = suggestion.substring(0, 200) + '...';
        }

        // Extract starter code
        const codeMatch = suggestion.match(/```python\n([\s\S]*?)\n```/);
        const starterCode = codeMatch ? codeMatch[1] : '';

        return {
            title,
            description,
            fullContent: suggestion,
            starterCode
        };
    };

    const analyzeProjects = async () => {
        if (!user) return;
        const result = await apiClient.analyzeStudentProjects(user.id);
        console.log(result);
    };

    const loadSuggestions = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await apiClient.getAISuggestions(user.id);
            setSuggestions(result.suggestions);

            // Parse tasks for better display
            const parsed = result.suggestions.map(parseTaskFromSuggestion);
            setParsedTasks(parsed);
        } catch (error) {
            console.error('Error loading suggestions:', error);
            toast.error('Failed to load suggestions. Please run an analysis first.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateNewSuggestions = async () => {
        if (!user) return;

        setIsGenerating(true);
        try {
            const result = await apiClient.createAISuggestions(user.id);
            setSuggestions(result.suggestions);

            // Parse the new comprehensive tasks
            const parsed = result.suggestions.map(parseTaskFromSuggestion);
            setParsedTasks(parsed);

            toast.success('New comprehensive tasks generated!');
        } catch (error) {
            console.error('Error generating suggestions:', error);
            toast.error('Failed to generate new suggestions.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStartTask = (taskData: TaskData, index: number) => {
        // Store task data in sessionStorage for the editor
        sessionStorage.setItem('currentTask', JSON.stringify(taskData));

        // Navigate to editor with task indicator
        router.push('/editor?task=active');

        toast.success(`Starting: ${taskData.title}`);
    };

    const toggleTaskExpansion = (index: number) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTasks(newExpanded);
    };

    useEffect(() => {
        loadSuggestions();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view suggestions
                    </h1>
                    <button
                        onClick={() => window.location.href = 'http://localhost:8000/api/auth/login'}
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
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Tasks</h1>
                            <p className="text-gray-600">
                                Comprehensive programming tasks tailored to your skill level and learning needs
                            </p>
                        </div>
                        <button
                            onClick={generateNewSuggestions}
                            disabled={isGenerating}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                            Generate New Tasks
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : parsedTasks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {parsedTasks.map((task, index) => (
                            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                                <Lightbulb className="h-6 w-6 text-yellow-600 mr-3" />
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {task.title}
                                                </h3>
                                            </div>
                                            <div className="text-gray-600 text-sm leading-relaxed mb-4">
                                                {task.description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => toggleTaskExpansion(index)}
                                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {expandedTasks.has(index) ? (
                                                <>
                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                    Hide Details
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                    View Full Task
                                                </>
                                            )}
                                        </button>

                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleStartTask(task, index)}
                                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                <Play className="h-4 w-4 mr-1" />
                                                Start Task
                                            </button>
                                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                                Save for Later
                                            </button>
                                        </div>
                                    </div>

                                    {expandedTasks.has(index) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                                <FormattedAIText text={task.fullContent} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No learning tasks available
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Run a code analysis first to get personalized learning tasks.
                        </p>
                        <button
                            onClick={() => window.location.href = '/editor'}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Code Editor
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}