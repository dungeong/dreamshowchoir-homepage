import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            setAccessToken: (token: string | null) => set({ accessToken: token }),
            logout: () => set({ accessToken: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state: AuthState) => ({ accessToken: state.accessToken }),
        }
    )
);
