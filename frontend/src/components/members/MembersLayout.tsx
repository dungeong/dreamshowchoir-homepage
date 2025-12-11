'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { getMyProfile } from '@/api/memberApi';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
    { name: '공지사항', href: '/members/notice' },
    { name: '연습일정', href: '/members/schedule' },
    { name: '악보/자료실', href: '/members/library' },
    { name: '자유게시판', href: '/members/board' },
];

export function MembersLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const accessToken = useAuthStore((state) => state.accessToken); // Reactive
    const [authStatus, setAuthStatus] = useState<'LOADING' | 'AUTHORIZED' | 'UNAUTHORIZED' | 'UNAUTHENTICATED'>('LOADING');

    useEffect(() => {
        const checkAuth = async () => {
            // Use the token from store
            const token = useAuthStore.getState().accessToken;

            if (!token) {
                setAuthStatus('UNAUTHENTICATED');
                return;
            }

            try {
                const profile = await getMyProfile();

                // Ensure role comparison is case-insensitive if needed, though usually uppercase
                const role = profile.role?.toUpperCase();

                if (role === 'MEMBER' || role === 'ADMIN') {
                    setAuthStatus('AUTHORIZED');
                } else {
                    setAuthStatus('UNAUTHORIZED');
                }
            } catch (error) {
                console.error('MembersLayout checkAuth: Failed to verify role:', error);
                setAuthStatus('UNAUTHENTICATED');
            }
        };

        checkAuth();
    }, [accessToken]); // Re-run if token changes (e.g. login/logout)

    if (authStatus === 'LOADING') {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (authStatus === 'UNAUTHENTICATED') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">단원 계정 로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-8">
                        단원 전용 페이지는 <strong>승인된 단원 계정</strong>으로 로그인해야 이용할 수 있습니다.
                    </p>
                    <div className="space-y-3">
                        <Link href="/login" className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity">
                            로그인 하러 가기
                        </Link>
                        <Link href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                            홈으로 돌아가기
                        </Link>
                    </div>

                </div>
            </div>
        );
    }

    if (authStatus === 'UNAUTHORIZED') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
                    <p className="text-gray-600 mb-8">
                        이 페이지는 <strong>정단원</strong>만 접근할 수 있습니다.<br />
                        현재 계정은 정단원 승인이 되지 않았습니다.
                    </p>
                    <div className="space-y-3">
                        <Link href="/mypage" className="block w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors">
                            마이페이지로 이동
                        </Link>
                        <Link href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                            홈으로 돌아가기
                        </Link>
                    </div>

                </div>
            </div>
        );
    }

    // Find current page name for header
    const currentPage = menuItems.find(item => pathname.startsWith(item.href)) || menuItems[0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-primary py-20 text-center text-primary-foreground">
                <h1 className="text-4xl font-bold mb-4">단원 전용</h1>
                <p className="opacity-90">Members Only Area</p>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 px-4 border-b pb-4">메뉴</h2>
                            <nav className="space-y-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "block px-4 py-3 rounded-lg transition-colors font-medium",
                                            pathname.startsWith(item.href)
                                                ? "bg-primary text-primary-foreground"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 bg-white rounded-xl shadow-sm p-8 min-h-[500px]">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-gray-100 text-primary">
                                {currentPage.name}
                            </h2>
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
}
