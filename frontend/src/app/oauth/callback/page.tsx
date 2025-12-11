'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMyProfile } from '@/api/memberApi';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const processLogin = async () => {
            // 1. Get token from URL query parameters
            const accessToken = searchParams.get('accessToken') || searchParams.get('token');
            const refreshToken = searchParams.get('refreshToken');

            console.log('Callback Params:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                allParams: searchParams.toString()
            });

            if (accessToken) {
                // 2. Store token in AuthStore (which implicitly handles localStorage via persist)
                // We access the store directly to ensure it updates before verify request
                const { useAuthStore } = await import('@/store/authStore');
                useAuthStore.getState().setAccessToken(accessToken);

                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                }

                try {
                    // 3. Check if user needs to sign up (missing terms agreement)
                    const profile = await getMyProfile();
                    console.log('Fetched Profile:', profile);

                    if (profile.role === 'GUEST') {
                        console.log('User is GUEST, redirecting to /signup');
                        window.location.replace('/signup');
                    } else {
                        const returnUrl = localStorage.getItem('login_return_url');
                        if (returnUrl) {
                            console.log('Redirecting to returnUrl:', returnUrl);
                            localStorage.removeItem('login_return_url');
                            window.location.replace(returnUrl);
                        } else {
                            console.log('User profile complete, redirecting to /mypage');
                            window.location.replace('/mypage');
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                    // If profile fetch fails, still try to go to mypage or handle error
                    window.location.replace('/mypage');
                }
            } else {
                // Handle error or missing token
                console.error('No access token found in callback URL');
                window.location.replace('/login?error=no_token');
            }
        };

        processLogin();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">로그인 처리 중입니다...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
