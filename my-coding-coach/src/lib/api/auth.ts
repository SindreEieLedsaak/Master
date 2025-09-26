import { API_BASE_URL } from '../http';

export async function login(): Promise<void> {
    window.location.href = `${API_BASE_URL}/api/auth/login`;
}

export async function logout(): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
}

export async function refreshToken(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
} 