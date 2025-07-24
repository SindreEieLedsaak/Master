'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiClient } from '@/lib/api';
import { Lightbulb, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuggestionsPage() {
    const { user } = useUser();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const loadSuggestions = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await apiClient.getAISuggestions(user.id);
            setSuggestions(result.suggestions);
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
            const result = await apiClient.getAISuggestions(user.id);
            setSuggestions(result.suggestions);
            toast.success('New suggestions generated!');
        } catch (error) {
            console.error('Error generating suggestions:', error);
            toast.error('Failed to generate new suggestions.');
        } finally {
            setIsGenerating(false);
        }
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
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Suggestions</h1>
                            <p className="text-gray-600">
                                Personalized project recommendations based on your coding analysis
                            </p>
                        </div>
                        <button
                            onClick={generateNewSuggestions}
                            disabled={isGenerating}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                            Generate New
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start mb-4">
                                    <Lightbulb className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            Task {index + 1}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {suggestion}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                                        Start Task
                                    </button>
                                    <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors">
                                        Save
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No suggestions available
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Run a code analysis first to get personalized task suggestions.
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