'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 2xl:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 2xl:ml-64 transition-all duration-300">
                {/* Mobile Header / Hamburger */}
                <header className="2xl:hidden h-16 bg-white border-b border-gray-100 flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-3 font-bold text-gray-900">Admin Page</span>
                </header>

                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
