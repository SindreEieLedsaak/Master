'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiClient, CodeAnalysis } from '@/lib/api';
import MultiFileEditor, { MultiFileEditorRef } from '@/components/MultiFileEditor';
import MultiFilePyodideRunner from '@/components/MultiFilePyodideRunner';
import FeedbackPanel from '@/components/FeedbackPanel';
import AssistantChat from '@/components/AssistantChat';
import { Bot, MessageSquare, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface File {
    name: string;
    content: string;
    language: string;
}

export default function EditorPage() {
    const { user } = useUser();
    const [files, setFiles] = useState<File[]>([
        {
            name: 'main.py',
            content: 'from module import greet\n\nprint(greet("World"))',
            language: 'python'
        },
        {
            name: 'module.py',
            content: '# A module you can import\n\ndef greet(name):\n    return f"Hello, {name}!"',
            language: 'python'
        }
    ]);
    const [activeFile, setActiveFile] = useState<string>('main.py');
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
    const [showPyodide, setShowPyodide] = useState(true); // Default to showing the runner

    const editorRef = useRef<MultiFileEditorRef>(null);

    const handleAnalyzeCode = async () => {
        const activeFileContent = files.find(f => f.name === activeFile)?.content;
        if (!activeFileContent?.trim()) {
            toast.error('Please write some code first');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await apiClient.analyzeCode(activeFileContent);
            setFeedback(result);
            toast.success('Code analysis completed!');
        } catch (error) {
            console.error('Error analyzing code:', error);
            toast.error('Failed to analyze code. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRunCode = (files: File[], activeFile: string) => {
        // This is now handled by the MultiFileEditor, but we can use this to set the active file
        // for the runner if we want to trigger it from outside
        setActiveFile(activeFile);
        if (!showPyodide) {
            setShowPyodide(true);
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

        const editorFiles = editorRef.current?.getFiles() || [];
        const code = editorFiles.map(f => `## ${f.name}\n\n${f.content}`).join('\n\n---\n\n');

        try {
            const response = await apiClient.getAssistantResponse(message, code);
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-File Code Editor</h1>
                    <p className="text-gray-600">
                        Write Python code across multiple files and run them with references to each other
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Multi-File Editor and Runner */}
                    <div className="space-y-6">
                        <MultiFileEditor
                            ref={editorRef}
                            initialFiles={files}
                            onFilesChange={setFiles}
                            onRunCode={handleRunCode}
                        />

                        <div className="flex space-x-4">
                            <button
                                onClick={handleAnalyzeCode}
                                disabled={isAnalyzing}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <Bot className="h-4 w-4 mr-2" />
                                Analyze Code
                            </button>
                        </div>

                        {/* The Pyodide Runner is now always visible but can be toggled */}
                        <div className={`${showPyodide ? 'block' : 'hidden'}`}>
                            <MultiFilePyodideRunner
                                files={files}
                                activeFile={activeFile}
                                onOutput={(output) => console.log('Code output:', output)}
                                onError={(error) => console.error('Code error:', error)}
                            />
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