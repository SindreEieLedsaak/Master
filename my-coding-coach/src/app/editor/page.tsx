'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/user/UserContext';
import { apiClient, CodeAnalysis } from '@/lib/api';
import MultiFileEditor, { MultiFileEditorRef } from '@/components/MultiFileEditor';
import MultiFilePyodideRunner from '@/components/MultiFilePyodideRunner';
import FeedbackPanel from '@/components/FeedbackPanel';
import AssistantChat from '@/components/AssistantChat';
import { Bot, MessageSquare, BookOpen, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormattedAIText } from '@/utils/textFormatter';
import { API_BASE_URL } from '@/lib/http';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: Date;
}

interface File {
    name: string;
    content: string;
    language: string;
}

interface TaskData {
    id: string;
    title: string;
    description: string;
    fullContent: string;
    starterCode?: string;
}

export default function EditorPage() {
    const { user } = useUser();
    // EditorPage – change initial files state
    const [lastRunOutput, setLastRunOutput] = useState<string>('');
    const [lastRunError, setLastRunError] = useState<string>('');
    const [files, setFiles] = useState<File[]>(() => {
        if (typeof window !== 'undefined') {
            const taskmode = sessionStorage.getItem('taskmode');
            const storedTask = sessionStorage.getItem('currentTask');

            if (taskmode === 'true' && storedTask) {
                try {
                    const taskData: TaskData = JSON.parse(storedTask);
                    if (taskData.starterCode) {
                        return [{
                            name: 'main.py',
                            content: taskData.starterCode,
                            language: 'python'
                        }];
                    }
                } catch { }
            }

            const storedFiles = sessionStorage.getItem('files');
            if (storedFiles) {
                try { return JSON.parse(storedFiles); } catch { }
            }
        }
        // fallback
        return [
            { name: 'main.py', content: 'from module import greet\n\nprint(greet("World"))', language: 'python' },
            { name: 'module.py', content: '# A module you can import\n\ndef greet(name):\n  return f"Hello, {name}!"', language: 'python' }
        ];
    });


    const [activeFile, setActiveFile] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('activeFile') || 'main.py';
        }
        return 'main.py';
    });
    const [feedback, setFeedback] = useState<CodeAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTask, setCurrentTask] = useState<TaskData | null>(null);
    const [showTaskPanel, setShowTaskPanel] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined') {
            const storedMessages = sessionStorage.getItem('messages');
            if (storedMessages) {
                try {
                    return JSON.parse(storedMessages);
                } catch (e) {
                    console.error("Failed to parse messages from session storage", e);
                }
            }
        }
        return [
            {
                id: '1',
                text: 'Hello! I\'m your AI coding assistant. I can help you understand your code, explain concepts, and provide guidance. What would you like to know?',
                role: 'assistant',
                timestamp: new Date(),
            },
        ];
    });
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [showPyodide, setShowPyodide] = useState(true);

    const editorRef = useRef<MultiFileEditorRef>(null);
    const hasLoadedServerStateRef = useRef(false);
    const saveTimerRef = useRef<any>(null);


    useEffect(() => {
        const taskmode = sessionStorage.getItem('taskmode');
        const storedTask = sessionStorage.getItem('currentTask');

        if (taskmode === 'true' && storedTask) {
            try {
                const taskData: TaskData = JSON.parse(storedTask);
                const loadedTaskId = sessionStorage.getItem('loadedTaskId');

                if (taskData.id !== loadedTaskId) {
                    // This is a new task, load starter code
                    if (taskData.starterCode) {
                        const newFiles = [{
                            name: 'main.py',
                            content: taskData.starterCode,
                            language: 'python'
                        }];
                        setFiles(newFiles);
                        setActiveFile('main.py');
                    }
                    sessionStorage.setItem('loadedTaskId', taskData.id);
                }

                loadTaskFromData(taskData);
            } catch (error) {
                console.error('Error parsing stored task:', error);
                toast.error('Failed to load task data');
            }
        }
    }, []);

    // Load saved editor state (files/active file/task) once when user arrives
    useEffect(() => {
        if (!user?.id || hasLoadedServerStateRef.current) return;
        (async () => {
            try {
                const state: any = await apiClient.loadEditorState(user.id);
                if (state?.files?.length) {
                    setFiles(state.files);
                }
                if (state?.active_file) {
                    setActiveFile(state.active_file);
                }
                if (state?.task) {
                    setCurrentTask({
                        id: state.task.id,
                        title: state.task.title ?? '',
                        description: state.task.description ?? '',
                        fullContent: state.task.description ?? '',
                    });
                    setShowTaskPanel(true);
                }
            } catch (e: any) {
                // Ignore 404 (no state yet)
            } finally {
                hasLoadedServerStateRef.current = true;
            }
        })();
    }, [user?.id]);

    useEffect(() => {
        sessionStorage.setItem('files', JSON.stringify(files));
        sessionStorage.setItem('activeFile', activeFile);
    }, [files, activeFile])

    useEffect(() => {
        sessionStorage.setItem('messages', JSON.stringify(messages));
    }, [messages])

    // Auto-save editor state to backend (debounced)
    useEffect(() => {
        if (!user?.id) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            const payload: any = {
                files,
                active_file: activeFile,
                task: currentTask
                    ? { id: currentTask.id, title: currentTask.title, description: currentTask.description }
                    : undefined,
            };
            apiClient.saveEditorState(user.id, payload).catch(() => { /* silent */ });
        }, 1000);
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [files, activeFile, currentTask, user?.id]);

    const loadTaskFromData = (taskData: TaskData) => {
        setCurrentTask(taskData);
        setShowTaskPanel(true);
        console.log("taskData", taskData);

        // Add task context to assistant with a more comprehensive introduction
        const taskContextMessage: Message = {
            id: `task-${Date.now()}`,
            text: `🎯 **New Learning Task Started!**\n\n**Task:** ${taskData.title}\n\n**Description:** ${taskData.description}\n\nI'm here to help you complete this task step by step. Feel free to ask me questions about the requirements, coding concepts, or if you get stuck on any part!`,
            role: 'assistant',
            timestamp: new Date(),
        };

        // Check if the task context message is already present
        if (!messages.some(m => m.id.startsWith('task-'))) {
            setMessages(prev => [taskContextMessage, ...prev.slice(1)]); // Replace the generic greeting
        }

        toast.success(`Task loaded: ${taskData.title}`);
    };

    const handleCompleteTask = () => {
        if (currentTask) {
            toast.success(`Congratulations! You've completed: ${currentTask.title}`);

            // Add celebration message to chat
            const celebrationMessage: Message = {
                id: `celebration-${Date.now()}`,
                text: `🎉 **Congratulations!** You've successfully completed the task: "${currentTask.title}"\n\nGreat job! This task helped you practice important programming concepts. Would you like me to review your solution or help you with a new challenge?`,
                role: 'assistant',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, celebrationMessage]);

            // Clear the task from storage
            sessionStorage.removeItem('currentTask');
            sessionStorage.removeItem('loadedTaskId');
            sessionStorage.removeItem('taskmode');
        }
    };

    const handleExitTaskMode = () => {
        toast('Exited task mode.');
        setCurrentTask(null);
        setShowTaskPanel(false);
        sessionStorage.removeItem('taskmode');
        sessionStorage.removeItem('currentTask');
        sessionStorage.removeItem('loadedTaskId');

        const exitMessage: Message = {
            id: `exit-task-${Date.now()}`,
            text: `You have exited the current task. I'm back to being a general-purpose coding assistant. How can I help?`,
            role: 'assistant',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, exitMessage]);
    };



    const handleRunCode = (files: File[], activeFile: string) => {
        setActiveFile(activeFile);
        if (!showPyodide) {
            setShowPyodide(true);
        }
    };

    const handleResetAssistant = async () => {
        try {
            await apiClient.clearAssistant();
        } catch (e) {
            console.error('Failed to clear assistant on server:', e);
        }
        setMessages([
            {
                id: '1',
                text: 'Hello! I\'m your AI coding assistant. I can help you understand your code, explain concepts, and provide guidance. What would you like to know?',
                role: 'assistant',
                timestamp: new Date(),
            },
        ]);
    };
    const handlePyodideError = (error: string) => {
        setLastRunError(error);
        setMessages(prev => [...prev, {
            id: `run-err-${Date.now()}`,
            text: `Runtime error:\n\n${error}`,
            role: 'system',
            timestamp: new Date(),
        }]);
        apiClient.addSystemMessage(`Runtime error:\n\n${error}`);
    };
    const handlePyodideOutput = (output: string) => {
        setLastRunOutput(output);
        setMessages(prev => [...prev, {
            id: `run-out-${Date.now()}`,
            text: `Runtime output:\n\n${output}`,
            role: 'system',
            timestamp: new Date(),
        }]);
        const message = `Runtime output:\n\n${output}`;
        console.log("message", message)
        apiClient.addSystemMessage(message);
    };

    const handleAssistantMessage = async (message: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: message,
            role: 'user',
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
                role: 'assistant',
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
                        onClick={() => window.location.href = `${API_BASE_URL}/api/auth/login`}
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
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleCompleteTask}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                </button>
                                <button
                                    onClick={handleExitTaskMode}
                                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Exit Task
                                </button>
                            </div>
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
                            files={files}
                            activeFile={activeFile}
                            onFilesChange={setFiles}
                            onActiveFileChange={setActiveFile}
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
                                onOutput={handlePyodideOutput}
                                onError={handlePyodideError}
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
                            onResetAssistant={handleResetAssistant}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 