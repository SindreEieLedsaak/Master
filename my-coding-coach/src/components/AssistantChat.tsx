'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import { FormattedAIText } from '@/utils/textFormatter';
import { apiClient } from '@/lib/api';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: Date;
}

interface AssistantChatProps {
    onSendMessage?: (message: string) => Promise<void>;
    messages?: Message[];
    isLoading?: boolean;
    onResetAssistant?: () => Promise<void>;
    className?: string;
    systemPrompt?: string;
    files?: Array<{ name: string; content: string; language: string }>;
    activeFile?: string;
    standalone?: boolean;
    sessionType?: string;
}

export default function AssistantChat({
    onSendMessage,
    messages: externalMessages,
    isLoading: externalIsLoading,
    onResetAssistant,
    className,
    systemPrompt,
    files = [],
    activeFile,
    standalone = false,
    sessionType = 'default'
}: AssistantChatProps) {
    const [input, setInput] = useState('');
    const [internalMessages, setInternalMessages] = useState<Message[]>([]);
    const [internalIsLoading, setInternalIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Use internal state when standalone, external props otherwise
    const messages = standalone ? internalMessages : (externalMessages || []);
    const isLoading = standalone ? internalIsLoading : (externalIsLoading || false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (standalone) {
            const initializeSession = async () => {
                try {
                    // Create a unique session ID for this component instance
                    const timestamp = Date.now();
                    const newSessionId = `${sessionType}_${timestamp}`;
                    const result = await apiClient.createAssistantSession(newSessionId, systemPrompt);
                    setSessionId(result.session_id);
                } catch (error) {
                    console.error('Failed to initialize session:', error);
                }
            };
            initializeSession();
        }


    }, [standalone, systemPrompt, sessionType]);



    // Cleanup session when component unmounts
    useEffect(() => {
        return () => {
            if (standalone && sessionId) {
                apiClient.deleteAssistantSession(sessionId).catch(console.error);
            }
        };
    }, [standalone, sessionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            if (standalone) {
                // Handle message internally
                const userMessage: Message = {
                    id: Date.now().toString(),
                    text: input.trim(),
                    role: 'user',
                    timestamp: new Date(),
                };

                setInternalMessages(prev => [...prev, userMessage]);
                setInternalIsLoading(true);

                // Prepare code context
                const code = files.map(f => `## ${f.name}\n\n${f.content}`).join('\n\n---\n\n');

                // Enhanced context with active file information
                let contextualMessage = input.trim();
                if (activeFile) {
                    contextualMessage = `
**Student Question:** ${input.trim()}

**Active File (Please prioritize this file when answering):** ${activeFile}
`;
                }

                try {
                    const response = await apiClient.getAssistantResponse(contextualMessage, code, sessionId || undefined);
                    const assistantMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        text: response.response,
                        role: 'assistant',
                        timestamp: new Date(),
                    };

                    setInternalMessages(prev => [...prev, assistantMessage]);
                } catch (error) {
                    console.error('Error getting assistant response:', error);
                    const errorMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        text: 'Sorry, I encountered an error. Please try again.',
                        role: 'assistant',
                        timestamp: new Date(),
                    };
                    setInternalMessages(prev => [...prev, errorMessage]);
                } finally {
                    setInternalIsLoading(false);
                }
            } else if (onSendMessage) {
                // Use external handler
                await onSendMessage(input.trim());
            }
            setInput('');
        }
    };

    const handleReset = async () => {
        if (standalone && sessionId) {
            try {
                await apiClient.clearAssistant(sessionId, systemPrompt);
                setInternalMessages([]);
            } catch (error) {
                console.error('Failed to reset assistant:', error);
            }
        } else if (onResetAssistant) {
            await onResetAssistant();
        }
    };

    const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

    return (
        <div className={`bg-white rounded-lg shadow flex flex-col h-full min-h-0 overflow-hidden ${className || ''}`}>
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                    AI Assistant
                </h3>
                <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex items-center"
                    title="Clear chat history"
                >
                    <X className="h-4 w-4" />
                    Reset
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {visibleMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                                {message.role === 'user' ? (
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div
                                className={`rounded-lg px-4 py-2 min-w-0 flex-1 ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {message.role === 'assistant' ? (
                                    <FormattedAIText text={message.text} />
                                ) : (
                                    <div className="whitespace-pre-wrap break-words">{message.text}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%]">
                            <div className="mr-2">
                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t sticky bottom-0 bg-white">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={standalone ? "Ask the AI assistant for help..." : "Ask the AI assistant..."}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
} 