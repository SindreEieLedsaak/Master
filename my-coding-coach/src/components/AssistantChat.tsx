'use client';

import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { SimpleFormattedText } from '@/utils/textFormatter';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface AssistantChatProps {
    onSendMessage: (message: string) => Promise<void>;
    messages: Message[];
    isLoading?: boolean;
}

export default function AssistantChat({ onSendMessage, messages, isLoading }: AssistantChatProps) {
    const [input, setInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            await onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow h-96 flex flex-col">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                    AI Assistant
                </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            <div className="flex items-start">
                                {!message.isUser && <Bot className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />}
                                <div className="flex-1">
                                    {message.isUser ? (
                                        <p className="text-sm">{message.text}</p>
                                    ) : (
                                        <div className="text-sm">
                                            <SimpleFormattedText text={message.text} />
                                        </div>
                                    )}
                                    <p className="text-xs opacity-70 mt-1">
                                        {message.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                                {message.isUser && <User className="h-4 w-4 ml-2 mt-0.5" />}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                            <div className="flex items-center">
                                <Bot className="h-4 w-4 mr-2 text-blue-600" />
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the AI assistant..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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