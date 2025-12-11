'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PlayCircle, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGalleries, GalleryItem } from '@/api/galleryApi';
import { cn } from '@/lib/utils';

type GalleryType = 'all' | 'REGULAR' | 'IRREGULAR' | 'EVENT';

const categories: { label: string; value: GalleryType }[] = [
    { label: '전체', value: 'all' },
    { label: '정기공연', value: 'REGULAR' },
    { label: '비정기공연', value: 'IRREGULAR' },
    { label: '행사', value: 'EVENT' },
];

export function GalleryGrid() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get page from URL query params (default to 0)
    const currentPage = Number(searchParams.get('page')) || 0;

    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<GalleryType>('all');
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        // Reset page to 0 when filter changes
        // We do this by pushing to the URL without the page param (or page=0)
        // But we only want to do this if the filter *actually* changed from a user action, 
        // which is hard to track with just useEffect on filter.
        // Instead, we'll handle the reset in the filter click handler.
        fetchGalleries(filter, currentPage);
    }, [filter, currentPage]);

    const fetchGalleries = async (category: GalleryType, pageNum: number) => {
        setLoading(true);
        try {
            const apiType = category === 'all' ? undefined : category;
            const data = await getGalleries(pageNum, 12, apiType);

            if (data && Array.isArray(data.content)) {
                setItems(data.content);
                setTotalPages(data.totalPages);
            } else {
                setItems([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Failed to fetch gallery items", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleFilterChange = (newFilter: GalleryType) => {
        setFilter(newFilter);
        // Reset page to 0 in URL when filter changes
        const params = new URLSearchParams(searchParams);
        params.set('page', '0');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-8">
            {/* Filter Buttons */}
            <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => handleFilterChange(cat.value)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            filter === cat.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
            ) : items.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item, index) => (
                            <div
                                key={`${item.galleryId}-${index}`}
                                onClick={() => router.push(`/activities/gallery/${item.galleryId}`)}
                                className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                            >
                                {item.thumbnailUrl ? (
                                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-10 h-10" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    {/* Assuming everything is an image for now as mediaType is missing in list schema */}
                                    <ImageIcon className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-300" />
                                </div>

                                {/* Title Label */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                    <p className="text-white/80 text-xs mt-1">
                                        {item.type === 'REGULAR' && '정기공연'}
                                        {item.type === 'IRREGULAR' && '비정기공연'}
                                        {item.type === 'EVENT' && '행사'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-12">
                            <button
                                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="이전 페이지"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={cn(
                                        "w-10 h-10 rounded-lg font-medium transition-colors",
                                        currentPage === i
                                            ? "bg-primary text-white"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                    aria-label={`${i + 1} 페이지`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="다음 페이지"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    등록된 갤러리 게시물이 없습니다.
                </div>
            )}
        </div>
    );
}
