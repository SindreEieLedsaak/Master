'use client';

import { useState } from 'react';
import { Folder, FileText, Plus, X } from 'lucide-react';

interface FileItem {
    name: string;
    content: string;
    language: string;
}

interface FileExplorerProps {
    files: FileItem[];
    activeFile: string;
    onFilesChange: (files: FileItem[]) => void;
    onActiveFileChange: (fileName: string) => void;
    className?: string;
}

export default function FileExplorer({ files, activeFile, onFilesChange, onActiveFileChange, className }: FileExplorerProps) {
    const [newFileName, setNewFileName] = useState<string>('');

    const createFile = () => {
        if (!newFileName.trim()) return;
        const fileName = newFileName.trim();
        if (files.some(f => f.name === fileName)) {
            alert('File already exists!');
            return;
        }
        const language = fileName.toLowerCase().endsWith('.md') ? 'markdown' : 'python';
        const newFile: FileItem = { name: fileName, content: `# New file: ${fileName}\n`, language };
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
        <div className={`border rounded-lg bg-white h-full flex flex-col ${className || ''}`}>
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Folder className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Project</h3>
                </div>
            </div>

            <div className="p-3 border-b">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="New file (e.g., notes.md or utils.py)"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                        onKeyDown={(e) => { if (e.key === 'Enter') createFile(); }}
                    />
                    <button
                        onClick={createFile}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        title="Create file"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <ul className="p-2 space-y-1">
                    {files.map(file => (
                        <li key={file.name}>
                            <div
                                className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer ${activeFile === file.name ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100 text-gray-800'}`}
                                onClick={() => onActiveFileChange(file.name)}
                            >
                                <div className="flex items-center space-x-2 overflow-hidden">
                                    <FileText className="h-4 w-4 flex-none" />
                                    <span className="truncate text-sm">{file.name}</span>
                                </div>
                                <button
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); deleteFile(file.name); }}
                                    title="Delete file"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 