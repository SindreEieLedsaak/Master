'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h1 className="text-2xl font-bold text-gray-900">Logging you in...</h1>
                    <p className="text-gray-600">Please wait while we authenticate you.</p>
                </div>
            </div>
        }>
            <AuthCallbackInner />
        </Suspense>
    );
}

function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useUser();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const username = searchParams.get('username');

        if (token && userId && username) {
            localStorage.setItem('auth_token', token);
            const user = { id: userId, gitlab_username: username };
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            router.push('/');
        } else {
            console.error('Login failed: Token or user info not provided.');
            router.push('/?error=login_failed');
        }
    }, [searchParams, router, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Logging you in...
                </h1>
                <p className="text-gray-600">Please wait while we authenticate you.</p>
            </div>
        </div>
    );
} 