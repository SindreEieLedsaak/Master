import React from 'react';

/**
 * Text Formatting Utilities for AI Responses
 * 
 * This module provides utilities to format AI-generated text into properly styled React components.
 * 
 * Available functions:
 * - formatAIResponseText(): Comprehensive formatting with headings, lists, code blocks
 * - FormattedAIText: React component wrapper for full formatting
 * - formatSimpleAIText(): Basic formatting for shorter responses  
 * - SimpleFormattedText: React component wrapper for simple formatting
 * 
 * Supported markdown-like syntax:
 * - **bold text** → Bold formatting
 * - ## Headings → H2/H3 elements
 * - # Single heading → H1 element
 * - - List items → Bullet lists
 * - ``` Code blocks → Syntax highlighted code
 * - --- → Horizontal dividers
 */

// Function to format AI response text with proper styling
export const formatAIResponseText = (text: string): React.ReactElement[] => {
    const lines = text.split('\n');
    let currentSection: React.ReactElement[] = [];
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeBlock = '';

    const flushList = () => {
        if (listItems.length > 0) {
            currentSection.push(
                <ul key={`list-${currentSection.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-gray-700">{formatInlineText(item)}</li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    const flushCodeBlock = () => {
        if (codeBlock.trim()) {
            currentSection.push(
                <pre key={`code-${currentSection.length}`} className="bg-gray-100 p-4 rounded-lg border text-sm font-mono overflow-x-auto mb-4">
                    <code className="text-gray-800">{codeBlock.trim()}</code>
                </pre>
            );
            codeBlock = '';
        }
    };

    const formatInlineText = (text: string): (string | React.ReactElement)[] => {
        // Bold text **text**
        return text.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Handle code blocks
        if (trimmedLine.startsWith('```')) {
            if (inCodeBlock) {
                flushCodeBlock();
                inCodeBlock = false;
            } else {
                flushList();
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeBlock += line + '\n';
            return;
        }

        // Handle headings
        if (trimmedLine.startsWith('##')) {
            flushList();
            const headingText = trimmedLine.replace(/^#+\s*/, '');
            if (headingText.match(/^\d+\./)) {
                // Numbered sections
                currentSection.push(
                    <h3 key={`h3-${index}`} className="text-xl font-bold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-2">
                        {headingText}
                    </h3>
                );
            } else {
                currentSection.push(
                    <h2 key={`h2-${index}`} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        {headingText}
                    </h2>
                );
            }
        }
        // Handle single # headings
        else if (trimmedLine.startsWith('#') && !trimmedLine.startsWith('##')) {
            flushList();
            const headingText = trimmedLine.replace(/^#+\s*/, '');
            currentSection.push(
                <h1 key={`h1-${index}`} className="text-3xl font-bold text-gray-900 mt-8 mb-6">
                    {headingText}
                </h1>
            );
        }
        // Handle list items
        else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
            const listItem = trimmedLine.replace(/^[-•]\s*/, '');
            if (listItem.trim()) {
                listItems.push(listItem);
            }
        }
        // Handle horizontal rules
        else if (trimmedLine === '---') {
            flushList();
            currentSection.push(
                <hr key={`hr-${index}`} className="my-6 border-gray-300" />
            );
        }
        // Handle regular paragraphs
        else if (trimmedLine) {
            flushList();
            currentSection.push(
                <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
                    {formatInlineText(trimmedLine)}
                </p>
            );
        }
        // Handle empty lines (section breaks)
        else if (currentSection.length > 0 && listItems.length === 0) {
            // Add some spacing for empty lines between sections
        }
    });

    // Flush any remaining content
    flushList();
    flushCodeBlock();

    return currentSection;
};

// Component wrapper for easier use in other components
interface FormattedTextProps {
    text: string;
    className?: string;
}

export const FormattedAIText: React.FC<FormattedTextProps> = ({ text, className = "" }) => {
    const formattedElements = formatAIResponseText(text);

    return (
        <div className={`prose prose-gray max-w-none ${className}`}>
            {formattedElements}
        </div>
    );
};

// Alternative simpler formatting for shorter AI responses
export const formatSimpleAIText = (text: string): React.ReactElement[] => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];

    const formatInlineText = (text: string): (string | React.ReactElement)[] => {
        return text.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                const listItem = trimmedLine.replace(/^[-•]\s*/, '');
                elements.push(
                    <div key={index} className="flex items-start mb-2">
                        <span className="text-gray-400 mr-2">•</span>
                        <span className="text-gray-700">{formatInlineText(listItem)}</span>
                    </div>
                );
            } else {
                elements.push(
                    <p key={index} className="text-gray-700 leading-relaxed mb-3">
                        {formatInlineText(trimmedLine)}
                    </p>
                );
            }
        }
    });

    return elements;
};

// Simple component for basic AI text formatting
export const SimpleFormattedText: React.FC<FormattedTextProps> = ({ text, className = "" }) => {
    const formattedElements = formatSimpleAIText(text);

    return (
        <div className={className}>
            {formattedElements}
        </div>
    );
}; 