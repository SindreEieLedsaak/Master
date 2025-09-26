import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token
                const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refreshResponse.ok) {
                    isRefreshing = false;
                    processQueue(null, 'token_refreshed');
                    // Retry original request
                    return api(originalRequest);
                } else {
                    // Refresh failed, redirect to login
                    isRefreshing = false;
                    processQueue(error, null);

                    // Only redirect if we're in a browser environment
                    if (typeof window !== 'undefined') {
                        console.log('Token refresh failed, redirecting to login...');
                        window.location.href = `${API_BASE_URL}/api/auth/login`;
                    }

                    return Promise.reject(error);
                }
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);

                // Only redirect if we're in a browser environment
                if (typeof window !== 'undefined') {
                    console.log('Token refresh error, redirecting to login...');
                    window.location.href = `${API_BASE_URL}/api/auth/login`;
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

