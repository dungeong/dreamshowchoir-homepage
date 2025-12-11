'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getMyProfile } from '@/api/memberApi';
import { useAuthStore } from '@/store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            // Correctly access token from store
            // Note: The persist middleware stores it in 'auth-storage' in localStorage, but using the hook/store is cleaner.
            // However, inside useEffect, we can use useAuthStore.getState()
            // But wait, we should check if we persist locally differently.
            // The previous issue was localStorage key mismatch.
            // Use useAuthStore.getState().accessToken
            const { accessToken } = useAuthStore.getState();
            if (!accessToken) return;

            try {
                const profile = await getMyProfile();

                // If user is GUEST and not on signup page, redirect to signup
                if (profile.role === 'GUEST' && pathname !== '/signup') {
                    console.log('GUEST user attempted to access restricted page, redirecting to /signup');
                    router.replace('/signup');
                }
            } catch (error: any) {
                // Suppress 401 errors as they are handled by axios interceptor (redirect to login)
                if (error.response?.status !== 401) {
                    console.error('Auth check failed:', error);
                }
            }
        };

        checkAuth();
    }, [pathname, router]);

    return <>{children}</>;
}
