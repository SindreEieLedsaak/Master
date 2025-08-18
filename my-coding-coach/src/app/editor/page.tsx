'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiClient, CodeAnalysis } from '@/lib/api';
import MultiFileEditor, { MultiFileEditorRef } from '@/components/MultiFileEditor';
import MultiFilePyodideRunner from '@/components/MultiFilePyodideRunner';
import FeedbackPanel from '@/components/FeedbackPanel';
import AssistantChat from '@/components/AssistantChat';
import { Bot, MessageSquare, BookOpen, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { FormattedAIText } from '@/utils/textFormatter';

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

interface TaskData {
    title: string;
    description: string;
    fullContent: string;
    starterCode?: string;
}

export default function EditorPage() {
    const { user } = useUser();
    const searchParams = useSearchParams();
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
    const [currentTask, setCurrentTask] = useState<TaskData | null>(null);
    const [showTaskPanel, setShowTaskPanel] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your AI coding assistant. I can help you understand your code, explain concepts, and provide guidance. What would you like to know?',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [showPyodide, setShowPyodide] = useState(true);

    const editorRef = useRef<MultiFileEditorRef>(null);

    // Load task from sessionStorage when component mounts or task parameter changes
    useEffect(() => {
        const taskParam = searchParams.get('task');
        if (taskParam === 'active') {
            const storedTask = sessionStorage.getItem('currentTask');
            if (storedTask) {
                try {
                    const taskData: TaskData = JSON.parse(storedTask);
                    loadTaskFromData(taskData);
                } catch (error) {
                    console.error('Error parsing stored task:', error);
                    toast.error('Failed to load task data');
                }
            }
        }
    }, [searchParams]);

    const loadTaskFromData = (taskData: TaskData) => {
        setCurrentTask(taskData);
        setShowTaskPanel(true);

        // Load starter code if available
        if (taskData.starterCode) {
            setFiles([{
                name: 'main.py',
                content: taskData.starterCode,
                language: 'python'
            }]);
            setActiveFile('main.py');
        }

        // Add task context to assistant with a more comprehensive introduction
        const taskContextMessage: Message = {
            id: `task-${Date.now()}`,
            text: `🎯 **New Learning Task Started!**\n\n**Task:** ${taskData.title}\n\n**Description:** ${taskData.description}\n\nI'm here to help you complete this task step by step. Feel free to ask me questions about the requirements, coding concepts, or if you get stuck on any part!`,
            isUser: false,
            timestamp: new Date(),
        };

        setMessages(prev => [taskContextMessage, ...prev.slice(1)]); // Replace the generic greeting

        toast.success(`Task loaded: ${taskData.title}`);
    };

    const handleCompleteTask = () => {
        if (currentTask) {
            toast.success(`Congratulations! You've completed: ${currentTask.title}`);

            // Add celebration message to chat
            const celebrationMessage: Message = {
                id: `celebration-${Date.now()}`,
                text: `🎉 **Congratulations!** You've successfully completed the task: "${currentTask.title}"\n\nGreat job! This task helped you practice important programming concepts. Would you like me to review your solution or help you with a new challenge?`,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, celebrationMessage]);

            // Clear the task from storage
            sessionStorage.removeItem('currentTask');
        }
    };



    const handleRunCode = (files: File[], activeFile: string) => {
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

        // Enhanced context with task information
        let contextualMessage = message;
        if (currentTask) {
            contextualMessage = `**Current Learning Task:** ${currentTask.title}
            
**Task Description:** ${currentTask.description}

**Student Question:** ${message}

Please provide helpful guidance that's specifically relevant to this learning task. If the student's code or question relates to the task requirements, help them understand how to complete it step by step.`;
        }

        try {
            const response = await apiClient.getAssistantResponse(contextualMessage, code);
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {currentTask ? `Learning Task: ${currentTask.title}` : 'Multi-File Code Editor'}
                            </h1>
                            <p className="text-gray-600">
                                {currentTask
                                    ? 'Complete your learning task with AI assistance'
                                    : 'Write Python code across multiple files and run them with references to each other'
                                }
                            </p>
                        </div>
                        {currentTask && (
                            <button
                                onClick={handleCompleteTask}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>

                {/* Task Panel */}
                {showTaskPanel && currentTask && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center mb-4">
                                <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                                <h2 className="text-xl font-semibold text-blue-900">Current Learning Task</h2>
                            </div>
                            <button
                                onClick={() => setShowTaskPanel(false)}
                                className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto shadow-sm">
                            <FormattedAIText text={currentTask.fullContent} />
                        </div>
                    </div>
                )}

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

                            {currentTask && !showTaskPanel && (
                                <button
                                    onClick={() => setShowTaskPanel(true)}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Show Task
                                </button>
                            )}
                        </div>

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
                            AI Learning Assistant
                            {currentTask && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    Task Mode
                                </span>
                            )}
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