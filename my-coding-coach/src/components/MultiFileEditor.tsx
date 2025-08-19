'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { FileText, Plus, Trash2, Play, Save, X } from 'lucide-react';

interface File {
    name: string;
    content: string;
    language: string;
}

interface MultiFileEditorProps {
    initialFiles?: File[];
    onFilesChange?: (files: File[]) => void;
    onRunCode?: (files: File[], activeFile: string) => void;
}

export interface MultiFileEditorRef {
    getFiles: () => File[];
}

const MultiFileEditor = forwardRef<MultiFileEditorRef, MultiFileEditorProps>(({
    initialFiles,
    onFilesChange,
    onRunCode,
}, ref) => {
    const [files, setFiles] = useState<File[]>(initialFiles || [
        {
            name: 'main.py',
            content: '# Write your main code here\nprint("Hello, world!")',
            language: 'python'
        },
        {
            name: 'module.py',
            content: '# A module you can import\n\ndef greet(name):\n    return f"Hello, {name}!"',
            language: 'python'
        }
    ]);

    const [activeFile, setActiveFile] = useState<string>('main.py');
    const [newFileName, setNewFileName] = useState<string>('');


    useEffect(() => {
        if (initialFiles) {
            setFiles(initialFiles);
            const newActiveFile = initialFiles.find(f => f.name === 'main.py')?.name || initialFiles[0]?.name;
            if (newActiveFile) {
                setActiveFile(newActiveFile);
            }
        }
    }, [initialFiles]);


    useEffect(() => {
        onFilesChange?.(files);
    }, [files, onFilesChange]);

    useImperativeHandle(ref, () => ({
        getFiles: () => files,
    }));

    const getActiveFile = () => {
        return files.find(f => f.name === activeFile) || files[0];
    };

    const updateFileContent = (content: string) => {
        setFiles(prev => prev.map(file =>
            file.name === activeFile
                ? { ...file, content }
                : file
        ));
    };

    const createFile = () => {
        if (!newFileName.trim()) return;

        const fileName = newFileName.endsWith('.py') ? newFileName : `${newFileName}.py`;

        if (files.some(f => f.name === fileName)) {
            alert('File already exists!');
            return;
        }

        const newFile: File = {
            name: fileName,
            content: `# New file: ${fileName}\n`,
            language: 'python'
        };

        setFiles(prev => [...prev, newFile]);
        setActiveFile(fileName);
        setNewFileName('');
    };

    const deleteFile = (fileName: string) => {
        if (files.length <= 1) {
            alert('Cannot delete the last file!');
            return;
        }

        setFiles(prev => prev.filter(f => f.name !== fileName));

        if (activeFile === fileName) {
            const remainingFiles = files.filter(f => f.name !== fileName);
            setActiveFile(remainingFiles[0].name);
        }
    };


    return (
        <div className="border rounded-lg bg-white">
            {/* File Management Header */}
            <div className="border-b bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Multi-File Editor</h3>

                </div>

                {/* File Tabs */}
                <div className="flex items-center space-x-2 mb-4">
                    {files.map(file => (
                        <div
                            key={file.name}
                            className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeFile === file.name
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <button
                                onClick={() => setActiveFile(file.name)}
                                className="flex items-center"
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                {file.name}
                            </button>
                            {files.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFile(file.name);
                                    }}
                                    className="ml-2 text-red-500 hover:text-red-700 p-1"
                                    title="Delete file"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* New File Creation */}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="New file name (e.g., utils.py)"
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
                        onKeyPress={(e) => e.key === 'Enter' && createFile()}
                    />
                    <button
                        onClick={createFile}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Create File
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="h-96">
                <Editor
                    height="100%"
                    language={getActiveFile()?.language || 'python'}
                    value={getActiveFile()?.content || ''}
                    onChange={(value) => updateFileContent(value || '')}
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

            {/* File Info */}
            <div className="border-t bg-gray-50 p-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Active file: <strong>{activeFile}</strong></span>
                    <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );

});

MultiFileEditor.displayName = 'MultiFileEditor';

export default MultiFileEditor; 
