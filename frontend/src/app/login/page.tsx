'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

function LoginContent() {
    const searchParams = useSearchParams();

    const handleLogin = (provider: string) => {
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl) {
            localStorage.setItem('login_return_url', returnUrl);
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        window.location.href = `${apiUrl}/oauth2/authorization/${provider}`;
    };

    // Redirect if already logged in
    // Check store state directly to avoid hydration flicker effects
    if (typeof window !== 'undefined' && useAuthStore.getState().accessToken) {
        const returnUrl = searchParams.get('returnUrl') || '/';
        // Use window.location to ensure full state reset or router.push
        window.location.href = returnUrl;
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
                    <p className="text-gray-600 mt-2">드림쇼콰이어 단원 전용 페이지입니다.</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin('naver')}
                        className="w-full bg-[#03C75A] text-white py-4 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">N</span>
                        <span>네이버로 시작하기</span>
                    </button>

                    <button
                        onClick={() => handleLogin('kakao')}
                        className="w-full bg-[#FEE500] text-[#3C1E1E] py-4 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <span className="text-xl font-black">TALK</span>
                        <span>카카오로 시작하기</span>
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>로그인에 문제가 있으신가요? <Link href="/community/inquiry" className="text-primary hover:underline font-medium">문의하기</Link></p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <LoginContent />
        </Suspense>
    );
}
