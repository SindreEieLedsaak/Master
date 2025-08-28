export interface User {
    id: string;
    gitlab_username: string;
    name?: string;
}

export interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
}