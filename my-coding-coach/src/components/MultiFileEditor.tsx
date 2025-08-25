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
    files: File[];
    activeFile: string;
    onFilesChange: (files: File[]) => void;
    onActiveFileChange: (fileName: string) => void;
    onRunCode?: (files: File[], activeFile: string) => void;
}

export interface MultiFileEditorRef {
    getFiles: () => File[];
}

const MultiFileEditor = forwardRef<MultiFileEditorRef, MultiFileEditorProps>(({
    files,
    activeFile,
    onFilesChange,
    onActiveFileChange,
    onRunCode,
}, ref) => {
    const [newFileName, setNewFileName] = useState<string>('');

    useImperativeHandle(ref, () => ({
        getFiles: () => files,
    }));

    const getActiveFile = () => {
        return files.find(f => f.name === activeFile) || files[0];
    };

    const updateFileContent = (content: string) => {

        const newFiles = files.map(file =>
            file.name === activeFile
                ? { ...file, content }
                : file
        );
        onFilesChange(newFiles);

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

        onFilesChange([...files, newFile]);
        onActiveFileChange(fileName);
        setNewFileName('');
    };

    const deleteFile = (fileName: string) => {
        if (files.length <= 1) {
            alert('Cannot delete the last file!');
            return;
        }

        const newFiles = files.filter(f => f.name !== fileName);
        onFilesChange(newFiles);

        if (activeFile === fileName) {
            onActiveFileChange(newFiles[0].name);
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
                                onClick={() => onActiveFileChange(file.name)}
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
                    height="110%"
                    width="100%"
                    language={getActiveFile()?.language || 'python'}
                    value={getActiveFile()?.content || ''}
                    onChange={(value) => {
                        updateFileContent(value || '');
                    }}
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
