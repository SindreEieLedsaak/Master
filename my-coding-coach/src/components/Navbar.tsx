'use client';

import { useUser } from '@/contexts/user/UserContext';
import { apiClient } from '@/lib/api';
import { Code, BookOpen, Lightbulb, User, LogOut, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    const { user, setUser } = useUser();

    const handleLogout = async () => {
        await apiClient.logout();
        setUser(null);
    };

    if (!user) {
        return (
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Code className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                Coding Coach
                            </span>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => apiClient.login()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Login with GitLab
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Code className="h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900">
                            Coding Coach
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/editor"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Code Editor
                        </Link>
                        <Link
                            href="/projects"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <FolderOpen className="h-4 w-4 inline mr-1" />
                            Projects
                        </Link>
                        <Link
                            href="/suggestions"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <Lightbulb className="h-4 w-4 inline mr-1" />
                            Suggestions
                        </Link>
                        <Link
                            href="/resources"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <BookOpen className="h-4 w-4 inline mr-1" />
                            Resources
                        </Link>
                        <Link
                            href="/profile"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <User className="h-4 w-4 inline mr-1" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <LogOut className="h-4 w-4 inline mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
} 