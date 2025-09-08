'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user/UserContext';
import { API_BASE_URL } from '@/lib/http';

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
    const { setUser } = useUser();

    useEffect(() => {
        async function bootstrap() {
            try {
                // Backend has set HTTP-only cookies. Fetch user info.
                const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
                if (!res.ok) throw new Error('Not authenticated');
                const user = await res.json();
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                // Remove any leftover tokens from previous builds
                localStorage.removeItem('auth_token');
                router.push('/');
            } catch (e) {
                console.error('Login failed:', e);
                router.push('/?error=login_failed');
            }
        }
        bootstrap();
    }, [router, setUser]);

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