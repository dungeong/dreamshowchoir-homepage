'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { getActivityMaterials, ActivityMaterial } from '@/api/activityMaterialsApi';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function ActivityBoard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get page from URL query params (default to 0)
    const currentPage = Number(searchParams.get('page')) || 0;

    const [materials, setMaterials] = useState<ActivityMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchMaterials(currentPage);
    }, [currentPage]);

    const fetchMaterials = async (pageNumber: number) => {
        setLoading(true);
        try {
            const data = await getActivityMaterials(pageNumber);
            // Check if data.content exists and is an array
            if (data && Array.isArray(data.content)) {
                setMaterials(data.content);
                setTotalPages(data.totalPages || 0);
            } else {
                setMaterials([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Failed to fetch activity materials", error);
            setMaterials([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (id: number) => {
        router.push(`/activities/materials/${id}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Board List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 w-16 text-center">번호</th>
                            <th className="px-6 py-3">제목</th>
                            <th className="px-6 py-3 w-24 text-center hidden md:table-cell">작성일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {materials.map((item) => (
                            <tr
                                key={item.materialId}
                                onClick={() => handleRowClick(item.materialId)}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 text-center text-gray-500">{item.materialId}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    {item.title}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 hidden md:table-cell">{formatDate(item.createdAt)}</td>
                            </tr>
                        ))}
                        {materials.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                    등록된 활동 자료가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8 text-lg font-medium text-blue-200">
                    {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                                "hover:text-blue-500 transition-colors",
                                currentPage === pageNum ? "text-blue-500 font-bold" : ""
                            )}
                            aria-label={`${pageNum + 1} 페이지`}
                        >
                            {pageNum + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
