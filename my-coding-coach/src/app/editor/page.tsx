'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/user/UserContext';
import { apiClient, CodeAnalysis } from '@/lib/api';
import MultiFileEditor, { MultiFileEditorRef } from '@/components/MultiFileEditor';
import MultiFilePyodideRunner from '@/components/MultiFilePyodideRunner';
import AssistantChat from '@/components/AssistantChat';
import FileExplorer from '@/components/FileExplorer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import toast from 'react-hot-toast';
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

const EditorPage = () => {
    const { user } = useUser();
    // EditorPage – change initial files state
    const [lastRunOutput, setLastRunOutput] = useState<string>('');
    const [lastRunError, setLastRunError] = useState<string>('');

    const [files, setFiles] = useState<File[]>([
        { name: 'main.py', content: 'from module import greet\n\nprint(greet("World"))', language: 'python' },
        { name: 'module.py', content: '# A module you can import\n\ndef greet(name):\n  return f"Hello, {name}!"', language: 'python' }
    ]);


    const [activeFile, setActiveFile] = useState<string>('main.py');
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
                    console.error('Failed to parse messages from session storage', e);
                }
            }
        }
        return [
            {
                id: '1',
                text: "Hello! I'm your AI coding assistant. I can help you understand your code, explain concepts, and provide guidance. What would you like to know?",
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
        }
    };

    const handleExitTaskMode = () => {
        toast('Exited task mode.');
        setCurrentTask(null);
        setShowTaskPanel(false);

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
                text: "Hello! I'm your AI coding assistant. I can help you understand your code, explain concepts, and provide guidance. What would you like to know?",
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
        console.log('message', message)
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
            contextualMessage = `

**Student Question:** ${message}


**Active File (Please prioritize this file when answering):** ${activeFile}
`;
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
        <div className="h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
            <div className="flex flex-col h-full">
                {/* Main IDE Layout */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <PanelGroup direction="horizontal">
                        {/* Left: File Explorer */}
                        <Panel defaultSize={15} minSize={12} className="min-w-[180px]">
                            <div className="h-full p-2">
                                <FileExplorer
                                    files={files}
                                    activeFile={activeFile}
                                    onFilesChange={setFiles}
                                    onActiveFileChange={setActiveFile}
                                />
                            </div>
                        </Panel>
                        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize" />

                        {/* Center: Editor over Terminal */}
                        <Panel defaultSize={55} minSize={30}>
                            <PanelGroup direction="vertical">
                                {/* Editor */}
                                <Panel defaultSize={60} minSize={25}>
                                    <div className="h-full p-2">
                                        <MultiFileEditor
                                            ref={editorRef}
                                            files={files}
                                            activeFile={activeFile}
                                            onFilesChange={setFiles}
                                            onActiveFileChange={setActiveFile}
                                            onRunCode={handleRunCode}
                                            showHeader={false}
                                            showFooter={false}
                                            className="h-full"
                                        />
                                    </div>
                                </Panel>
                                <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-row-resize" />

                                {/* Bottom: Terminal only */}
                                <Panel defaultSize={40} minSize={20}>
                                    <div className={`h-full p-2 ${showPyodide ? '' : 'hidden'}`}>
                                        <MultiFilePyodideRunner
                                            files={files}
                                            activeFile={activeFile}
                                            onOutput={handlePyodideOutput}
                                            onError={handlePyodideError}
                                            className="h-full"
                                        />
                                    </div>
                                </Panel>
                            </PanelGroup>
                        </Panel>

                        {/* Right: Chat panel */}
                        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize" />
                        <Panel defaultSize={17} minSize={15}>
                            <div className="h-full p-2">
                                <AssistantChat
                                    onSendMessage={handleAssistantMessage}
                                    messages={messages}
                                    isLoading={isAssistantLoading}
                                    onResetAssistant={handleResetAssistant}
                                    className="h-full"
                                />
                            </div>
                        </Panel>
                    </PanelGroup>
                </div>
            </div>
        </div>
    );
}

export default EditorPage;