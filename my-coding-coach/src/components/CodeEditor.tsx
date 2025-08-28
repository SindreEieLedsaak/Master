'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    language?: string;
}

export default function CodeEditor({ code, onChange, language = 'python' }: CodeEditorProps) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <Editor
                height="400px"
                language={language}
                value={code}
                onChange={(value) => onChange(value || '')}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}