'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiClient, CodeAnalysis } from '@/lib/api';
import CodeEditor from '@/components/CodeEditor';
import FeedbackPanel from '@/components/FeedbackPanel';
import AssistantChat from '@/components/AssistantChat';
import { Play, Bot, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export default function EditorPage() {
    const { user } = useUser();
    const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")');
    const [feedback, setFeedback] = useState<CodeAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your AI coding assistant. I can help you understand your code, explain concepts, and provide guidance. What would you like to know?',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);

    const handleAnalyzeCode = async () => {
        if (!code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await apiClient.analyzeCode(code);
            setFeedback(result);
            toast.success('Code analysis completed!');
        } catch (error) {
            console.error('Error analyzing code:', error);
            toast.error('Failed to analyze code. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await apiClient.runPython(code);
            toast.success('Code executed successfully!');
            // You could display the output in a modal or separate panel
            console.log('Output:', result.output);
        } catch (error) {
            console.error('Error running code:', error);
            toast.error('Failed to run code. Please check your syntax.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAssistantMessage = async (message: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: message,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsAssistantLoading(true);

        try {
            const response = await apiClient.getAssistantResponse(message);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error getting assistant response:', error);
            toast.error('Failed to get assistant response. Please try again.');
        } finally {
            setIsAssistantLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to access the code editor
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Code Editor</h1>
                    <p className="text-gray-600">
                        Write your Python code and get instant feedback
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Code Editor */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Code</h2>
                            <CodeEditor code={code} onChange={setCode} />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleRunCode}
                                disabled={isAnalyzing}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Run Code
                            </button>
                            <button
                                onClick={handleAnalyzeCode}
                                disabled={isAnalyzing}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <Bot className="h-4 w-4 mr-2" />
                                Analyze Code
                            </button>
                        </div>

                        {feedback && <FeedbackPanel feedback={feedback} isLoading={isAnalyzing} />}
                    </div>

                    {/* Right Column - AI Assistant */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            AI Assistant
                        </h2>
                        <AssistantChat
                            onSendMessage={handleAssistantMessage}
                            messages={messages}
                            isLoading={isAssistantLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 