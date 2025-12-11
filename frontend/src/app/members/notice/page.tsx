'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getNotices, Notice } from '@/api/noticeApi';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function NoticeContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get page from URL query params (default to 0)
    const currentPage = Number(searchParams.get('page')) || 0;

    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchNotices(currentPage);
    }, [currentPage]);

    const fetchNotices = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await getNotices(pageNum, 10);
            setNotices(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch notices", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">공지사항</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-10 w-10 text-primary" />
                </div>
            ) : notices.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {notices.map((notice) => (
                            <div
                                key={notice.noticeId}
                                onClick={() => router.push(`/members/notice/${notice.noticeId}`)}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">공지</span>
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                                {notice.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span>{notice.authorName}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="이전 페이지"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="flex items-center px-4 font-medium text-gray-600">
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="다음 페이지"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-500">
                    등록된 공지사항이 없습니다.
                </div>
            )}
        </div>
    );
}

export default function NoticePage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <NoticeContent />
        </Suspense>
    );
}
