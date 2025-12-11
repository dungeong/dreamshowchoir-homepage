'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    HeartHandshake,
    FolderOpen,
    Info,
    MessageCircle,
    LogOut,
    ChevronDown,
    ChevronRight,
    Settings,
    Calendar,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MenuItem {
    title: string;
    href: string;
    icon: React.ElementType;
    children?: { title: string; href: string }[];
}

const MENU_ITEMS: MenuItem[] = [
    {
        title: '대시보드',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: '회원 관리',
        href: '/admin/users',
        icon: Users,
        children: [
            { title: '회원 목록', href: '/admin/users' },
            { title: '가입 신청 관리', href: '/admin/join-applications' },
        ],
    },
    {
        title: '게시판 관리',
        href: '/admin/board',
        icon: FileText,
        children: [
            { title: '공지사항 관리', href: '/admin/board/notices' },
            { title: '갤러리 관리', href: '/admin/board/gallery' },
            { title: '악보/자료실 관리', href: '/admin/board/sheets' },
            { title: '단원 게시판 관리', href: '/admin/board/posts' },
        ],
    },
    {
        title: '후원 관리',
        href: '/admin/donations',
        icon: HeartHandshake,
        children: [
            { title: '후원 목록', href: '/admin/donations' },
        ],
    },
    {
        title: '활동자료 관리',
        href: '/admin/activities',
        icon: FolderOpen,
        children: [
            { title: '활동자료 목록', href: '/admin/activities' },
        ],
    },
    {
        title: '사이트 정보 관리',
        href: '/admin/site',
        icon: Info,
        children: [
            { title: '연혁 관리', href: '/admin/site/history' },
            { title: '사이트 콘텐츠 관리', href: '/admin/site/contents' },
        ],
    },
    {
        title: '소통 및 설정',
        href: '/admin/communication',
        icon: MessageCircle,
        children: [
            { title: '문의 관리', href: '/admin/inquiries' },
            { title: 'FAQ 관리', href: '/admin/communication/faq' },
            { title: '배너 관리', href: '/admin/communication/banners' },
            { title: '일정 관리', href: '/admin/schedules' },
        ],
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // State for collapsing submenus
    const [expandedItems, setExpandedItems] = useState<string[]>(MENU_ITEMS.map(item => item.title));

    const toggleExpand = (title: string) => {
        setExpandedItems(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('auth_token');
            router.push('/');
            router.refresh();
        }
    };

    // Helper to check if a route is active
    const isActive = (href: string) => {
        if (href === '/admin' && pathname === '/admin') return true;
        if (href !== '/admin' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full 2xl:translate-x-0"
            )}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-between border-b border-gray-100 px-6">
                <Link href="/admin" className="flex flex-col items-center">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Page</h1>
                    <span className="text-xs text-gray-500">드림쇼콰이어 관리자</span>
                </Link>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="2xl:hidden p-1 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    const isExpanded = expandedItems.includes(item.title);
                    const isCurrentActive = isActive(item.href);
                    const hasChildren = item.children && item.children.length > 0;

                    return (
                        <div key={item.title} className="space-y-1">
                            {/* Main Menu Item */}
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(item.title)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                                        isCurrentActive
                                            ? "text-primary bg-primary/5"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        <span>{item.title}</span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "transition-transform duration-200",
                                            isExpanded ? "transform rotate-180" : ""
                                        )}
                                    />
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                                        isCurrentActive
                                            ? "text-primary bg-primary/5"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon size={18} />
                                    <span>{item.title}</span>
                                </Link>
                            )}

                            {/* Sub Menu Items */}
                            {hasChildren && isExpanded && (
                                <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                                    {item.children!.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "block px-4 py-2 rounded-md text-sm transition-colors duration-200",
                                                    isChildActive
                                                        ? "text-primary font-semibold bg-gray-50"
                                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                                )}
                                            >
                                                {child.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>로그아웃</span>
                </Button>
            </div>
        </aside>
    );
}

// Add types for Lucide React to avoid implicit any errors if strict
// Already typed via imports usually.
