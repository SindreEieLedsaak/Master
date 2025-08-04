'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface User {
    id: string;
    gitlab_username: string;
    name?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only initialize once
        if (hasInitialized.current) return;

        // Check for user in localStorage on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
        hasInitialized.current = true;
    }, []);

    const handleSetUser = (newUser: User | null) => {
        // Prevent unnecessary updates
        if (JSON.stringify(user) === JSON.stringify(newUser)) {
            return;
        }

        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser: handleSetUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 