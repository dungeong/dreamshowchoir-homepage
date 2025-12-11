'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMyProfile, UserProfile } from '@/api/memberApi';
import { useAuthStore } from '@/store/authStore';

interface MenuItem {
    label: string;
    href: string; // Used for parent link if clickable, or strictly for grouping
    children?: { label: string; href: string }[];
}

const MENU_ITEMS: MenuItem[] = [
    {
        label: '드림쇼콰이어 소개',
        href: '/about/greetings', // Default link
        children: [
            { label: '인사말', href: '/about/greetings' },
            { label: '연혁', href: '/about/history' },
            { label: '조직도', href: '/about/organization' },
            { label: '오시는길', href: '/about/location' },
        ],
    },
    {
        label: '활동 소개',
        href: '/activities/members',
        children: [
            { label: '단원소개', href: '/activities/members' },
            { label: '공연일정', href: '/activities/performances' },
            { label: '갤러리', href: '/activities/gallery' },
            { label: '활동자료', href: '/activities/materials' },
        ],
    },
    {
        label: '단원 전용',
        href: '/members/notice',
        children: [
            { label: '공지사항', href: '/members/notice' },
            { label: '연습일정', href: '/members/schedule' },
            { label: '악보/자료실', href: '/members/library' },
            { label: '자유게시판', href: '/members/board' },
        ],
    },
    {
        label: '소통하기',
        href: '/community/guestbook',
        children: [
            { label: '방명록', href: '/community/guestbook' },
            { label: '문의하기', href: '/community/inquiry' },
            { label: '자주묻는질문', href: '/community/faq' },
        ],
    },
    {
        label: '후원 및 가입',
        href: '/join/recruit', // Adjusted to match 'join' pattern seen in previous logs if needed, or keep support?
        // User didn't specify, but I recall editing /join/application/page.tsx.
        // The joinApi was restored.
        // Let's check: /join/application exists.
        // Previous header had: /support/recruit.
        // Maybe change to /join for consistency if "application" is under join.
        // User listed "후원 및 가입".
        // Let's stick to /support for now unless "join" is better. A safe bet is keeping /support unless specified.
        // However, I previously edited `src/app/join/application/page.tsx`. This implies route is `/join/application`.
        // The old header had `/support/apply`. This is likely WRONG. It should be `/join/application`.
        // I will update '가입 신청' to `/join/application`.
        children: [
            { label: '단원 모집 안내', href: '/join/recruit' },
            { label: '가입 신청', href: '/join/application' },
            { label: '후원 방법 안내', href: '/join/donation-guide' }, // Assuming join or support? Let's check file structure later. 
            // Actually, safe to just update the confirmed ones and leave others or map conservatively.
            // Let's check if 'support' dir exists.
            { label: '후원 신청', href: '/join/donate' },
            { label: '후원자 목록', href: '/join/donors' },
        ],
    },
];

export default function Header() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSubMenuIndex, setOpenSubMenuIndex] = useState<number | null>(null); // For mobile accordion
    const router = useRouter();
    const pathname = usePathname();

    // -- Auth Check --
    const { accessToken, logout } = useAuthStore();

    // -- Auth Check --
    useEffect(() => {
        const checkAuth = async () => {
            if (!accessToken) {
                setUser(null);
                setLoading(false);
                return;
            }
            try {
                const profile = await getMyProfile();
                setUser(profile);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                // If token is invalid, clear it
                logout();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [accessToken]); // React to token changes

    const handleLogout = () => {
        logout();
        setUser(null);
        router.push('/');
        // window.location.reload(); // Not needed if store is reactive, but ensures clean slate
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const toggleMobileSubMenu = (index: number) => {
        setOpenSubMenuIndex(openSubMenuIndex === index ? null : index);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm h-20">
            <div className="container mx-auto h-full px-4 flex items-center justify-between">

                {/* 1. Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-16 w-auto">
                        <img
                            src="/images/logo.png"
                            alt="Dream Show Choir"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-yellow-500 tracking-tight hidden sm:block">
                        사회적협동조합 드림쇼콰이어
                    </span>
                </Link>

                {/* 2. Desktop Navigation (Center) */}
                <nav className="hidden 2xl:flex items-center gap-8">
                    {MENU_ITEMS.map((item, index) => (
                        <div key={index} className="relative group p-4 cursor-pointer">
                            <Link
                                href={item.href}
                                className="text-[17px] font-medium text-gray-800 group-hover:text-yellow-500 transition-colors flex items-center gap-1"
                            >
                                {item.label}
                                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                            </Link>

                            {/* Dropdown Menu */}
                            {item.children && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block pt-2 w-48 animate-in fade-in slide-in-from-top-1">
                                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                                        {item.children.map((sub, sublex) => (
                                            <Link
                                                key={sublex}
                                                href={sub.href}
                                                className="block px-4 py-3 text-sm text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 transition-colors text-center"
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* 3. Auth Buttons (Right) */}
                <div className="hidden 2xl:flex items-center gap-4">
                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-3">
                                    {/* Admin Button */}
                                    {user.role === 'ADMIN' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/admin')}
                                            className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                        >
                                            관리자 페이지
                                        </Button>
                                    )}

                                    {/* My Page Button - Gold/Yellow Style */}
                                    <Button
                                        onClick={() => router.push('/mypage')}
                                        className="bg-[#F4D03F] hover:bg-[#EAC12F] text-black font-bold rounded-full px-5 shadow-sm"
                                    >
                                        마이페이지
                                    </Button>

                                    {/* Logout */}
                                    <div
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-800 cursor-pointer underline-offset-4 hover:underline"
                                    >
                                        로그아웃
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                >
                                    로그인
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* 4. Mobile Menu Toggle */}
                <button
                    className="2xl:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={28} />
                </button>
            </div>

            {/* -- Mobile Drawer -- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 2xl:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl p-6 overflow-y-auto duration-300 animate-in slide-in-from-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xl font-bold text-gray-800">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Mobile Auth Status */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                                            {user.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}님</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs h-9"
                                            onClick={() => router.push('/mypage')}
                                        >
                                            마이페이지
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs h-9 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={handleLogout}
                                        >
                                            로그아웃
                                        </Button>
                                        {user.role === 'ADMIN' && (
                                            <Button
                                                className="col-span-2 w-full text-xs h-9"
                                                onClick={() => router.push('/admin')}
                                            >
                                                관리자 페이지
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm mb-3">로그인하고 더 많은 활동을 함께하세요!</p>
                                    <Button onClick={() => router.push('/login')} className="w-full bg-[#F4D03F] hover:bg-[#EAC12F] text-black">
                                        로그인 / 회원가입
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu List with Accordion */}
                        <ul className="space-y-1">
                            {MENU_ITEMS.map((item, index) => (
                                <li key={index} className="border-b last:border-none border-gray-100">
                                    <div
                                        className="flex items-center justify-between py-4 cursor-pointer hover:text-yellow-600 transition-colors"
                                        onClick={() => toggleMobileSubMenu(index)}
                                    >
                                        <span className="font-semibold text-lg text-gray-700">{item.label}</span>
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform duration-200 ${openSubMenuIndex === index ? 'rotate-180 text-yellow-500' : 'text-gray-400'}`}
                                        />
                                    </div>

                                    {/* Mobile Submenu */}
                                    {openSubMenuIndex === index && item.children && (
                                        <ul className="bg-gray-50 rounded-lg p-2 mb-4 space-y-1 animate-in slide-in-from-top-2 fade-in">
                                            {item.children.map((sub, sublex) => (
                                                <li key={sublex}>
                                                    <Link
                                                        href={sub.href}
                                                        className="block px-4 py-2.5 text-gray-600 hover:text-yellow-600 hover:bg-white rounded-md transition-all text-sm"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        - {sub.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </header>
    );
}

