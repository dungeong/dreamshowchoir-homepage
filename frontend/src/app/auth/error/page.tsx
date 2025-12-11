'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const errorMsg = searchParams.get('error');
        if (errorMsg) {
            try {
                const decodedMsg = decodeURIComponent(errorMsg);
                Swal.fire({
                    icon: 'error',
                    title: '로그인 실패',
                    text: decodedMsg,
                    confirmButtonText: '로그인 페이지로 이동',
                    confirmButtonColor: '#d33',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    router.replace('/login');
                });
            } catch (e) {
                console.error('Failed to decode error message:', e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-gray-500">로그인 오류를 확인 중입니다...</p>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <AuthErrorContent />
        </Suspense>
    );
}
