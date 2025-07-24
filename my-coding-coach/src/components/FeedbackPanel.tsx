'use client';

import { AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react';

interface FeedbackPanelProps {
    feedback: {
        semantic_errors: string[];
        style_issues: string[];
        quality_score: string;
        improvement_suggestions: string[];
    } | null;
    isLoading?: boolean;
}

export default function FeedbackPanel({ feedback, isLoading }: FeedbackPanelProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!feedback) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Code Analysis</h3>

            {/* Quality Score */}
            <div className="mb-6">
                <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium">Quality Score: {feedback.quality_score}</span>
                </div>
            </div>

            {/* Semantic Errors */}
            {feedback.semantic_errors.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="font-medium text-red-600">Semantic Errors</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {feedback.semantic_errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Style Issues */}
            {feedback.style_issues.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center mb-2">
                        <Info className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-600">Style Issues</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {feedback.style_issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Improvement Suggestions */}
            {feedback.improvement_suggestions.length > 0 && (
                <div>
                    <div className="flex items-center mb-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-600">Improvement Suggestions</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {feedback.improvement_suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

