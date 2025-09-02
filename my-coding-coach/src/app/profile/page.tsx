'use client';

import { useUser } from '@/contexts/user/UserContext';
import { User, GitBranch, Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ProfilePage() {
    const { user } = useUser();
    const [projectCount, setProjectCount] = useState<number>(0);
    const [fileCount, setFileCount] = useState<number>(0);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!user?.id) return;
            try {
                const proj = await apiClient.getNumberOfProjects(user.id);
                const files = await apiClient.getNumberOfFiles(user.id);
                // Both endpoints return { count: number }
                setProjectCount((proj as any).count ?? 0);
                setFileCount((files as any).count ?? 0);
            } catch (e) {
                // ignore for now
            }
        };
        fetchCounts();
    }, [user?.id]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view your profile
                    </h1>
                    <button
                        onClick={() => window.location.href = 'http://localhost:8000/api/auth/login'}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
                    <p className="text-gray-600">
                        Track your progress and view your learning history
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                    <User className="h-8 w-8 text-white" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {user.gitlab_username}
                                    </h2>
                                    <p className="text-gray-600">Student</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <GitBranch className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-700">GitLab User</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-700">Member since {new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sync Projects */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Projects</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 mb-2">{projectCount}</div>
                                    <div className="text-sm text-gray-600">Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-2">{fileCount}</div>
                                    <div className="text-sm text-gray-600">Files</div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}