import { create } from 'zustand';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('userInfo') : false,
    login: (userData) => {
        set({ user: userData, isAuthenticated: true });
        localStorage.setItem('userInfo', JSON.stringify(userData));
    },
    logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('userInfo');
    }
}));
