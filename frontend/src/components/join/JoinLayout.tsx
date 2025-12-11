'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const menuItems = [
    { name: '단원 모집 안내', href: '/join/recruit' },
    { name: '입단 신청', href: '/join/application' },
    { name: '후원 방법 안내', href: '/join/donation-guide' },
    { name: '후원 신청', href: '/join/donate' },
    { name: '후원자 목록', href: '/join/donors' },
];

export function JoinLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Find current page name for header
    const currentPage = menuItems.find(item => pathname.startsWith(item.href)) || menuItems[0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-primary py-20 text-center text-primary-foreground">
                <h1 className="text-4xl font-bold mb-4">참여 및 후원</h1>
                <p className="opacity-90">Join & Support</p>
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
