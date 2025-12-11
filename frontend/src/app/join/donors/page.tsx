'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Loader2, Crown, ChevronLeft, ChevronRight, Gift, Sparkles, Heart,
    Music, Sun, Moon, Star, Flower, Bird, Smile, CloudSun
} from 'lucide-react';
import { getDonors } from '@/api/donationApi';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Avatar Arrays
const AVATAR_ICONS = [Music, Star, Sun, Flower, Bird, Heart, Smile, Moon, CloudSun, Sparkles];
const AVATAR_COLORS = [
    "from-rose-50 to-orange-50 text-rose-400",
    "from-sky-50 to-blue-50 text-sky-400",
    "from-emerald-50 to-teal-50 text-emerald-400",
    "from-violet-50 to-purple-50 text-violet-400",
    "from-amber-50 to-yellow-50 text-amber-400",
    "from-pink-50 to-rose-50 text-pink-400",
    "from-indigo-50 to-blue-50 text-indigo-400",
    "from-lime-50 to-green-50 text-lime-600",
];

export default function DonorsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const { data: donors = [], isLoading, isError } = useQuery({
        queryKey: ['donors'],
        queryFn: getDonors,
    });

    // Sort by Date Descending
    const sortedDonors = [...donors].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination Logic
    const totalItems = sortedDonors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDonors = sortedDonors.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString() + '원';
    };

    const maskName = (name: string | null) => {
        if (!name) return '익명의 천사님';
        if (name.length <= 1) return name;
        if (name.length === 2) return name[0] + '*';

        const first = name[0];
        const last = name[name.length - 1];
        const middle = '*'.repeat(name.length - 2);
        return `${first}${middle}${last}`;
    };

    // Deterministic Pattern Generator
    const getAvatarTheme = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const iconIndex = Math.abs(hash) % AVATAR_ICONS.length;
        const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;

        return {
            Icon: AVATAR_ICONS[iconIndex],
            colorClass: AVATAR_COLORS[colorIndex]
        };
    };

    if (isLoading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center bg-amber-50/30">
                <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-4 bg-amber-50/30">
                <p className="text-xl font-bold text-gray-800 mb-2">명예의 전당을 불러오는데 실패했습니다.</p>
                <p className="text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
                <Button onClick={() => window.location.reload()} className="bg-amber-500 hover:bg-amber-600">새로고침</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                {/* Header */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 mb-4 bg-amber-100/50 px-4 py-1.5 rounded-full text-amber-700 font-bold text-sm border border-amber-200">
                        <Sparkles className="w-4 h-4 fill-amber-400 text-amber-600" />
                        <span>Dream Show Choir Hall of Fame</span>
                        <Sparkles className="w-4 h-4 fill-amber-400 text-amber-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        후원자 <span className="text-amber-500">명예의 전당</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl font-medium max-w-2xl mx-auto break-keep">
                        드림쇼 콰이어의 꿈을 함께 이뤄주시는<br className="md:hidden" /> 소중한 분들입니다.
                        <br />따뜻한 마음을 나누어주셔서 진심으로 감사드립니다.
                    </p>
                </div>

                {/* Grid List */}
                {sortedDonors.length === 0 ? (
                    <div className="text-center py-32 bg-white/50 rounded-3xl border border-amber-100 shadow-sm backdrop-blur-sm">
                        <div className="w-20 h-20 bg-amber-50 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 fill-current" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">아직 등록된 후원자가 없습니다.</p>
                        <p className="text-gray-400 text-sm mt-2">첫 번째 후원자가 되어주세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {currentDonors.map((donor, index) => {
                            const isRegular = donor.type === 'REGULAR';
                            const isAnonymous = !donor.donorName;

                            // Get theme for named donors, fallback for anonymous
                            const theme = donor.donorName ? getAvatarTheme(donor.donorName) : null;
                            const AvatarIcon = theme ? theme.Icon : Heart;
                            const avatarColor = theme ? theme.colorClass : "from-purple-50 to-pink-50 text-purple-400";

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative group bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2",
                                        "animate-in fade-in zoom-in-50 duration-500",
                                        // Regular Donor Styling
                                        isRegular
                                            ? "border-2 border-amber-200 shadow-xl shadow-amber-100/50 hover:shadow-2xl hover:shadow-amber-200/50 ring-4 ring-amber-50/50 ring-offset-2"
                                            : "border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Badges */}
                                    {isRegular ? (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                                            <Crown className="w-3.5 h-3.5 fill-yellow-200" />
                                            정기 후원
                                        </div>
                                    ) : (
                                        <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full flex items-center gap-1 border border-gray-100">
                                            <Gift className="w-3 h-3" />
                                            일시 후원
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center text-center pt-6">
                                        {/* Avatar Icon */}
                                        <div className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center mb-5 text-3xl font-bold transition-transform group-hover:scale-110 duration-300 shadow-inner",
                                            "bg-gradient-to-br border-4 border-white",
                                            isRegular && "shadow-amber-100",
                                            avatarColor
                                        )}>
                                            <AvatarIcon className={cn("w-9 h-9", isAnonymous && "fill-pink-200")} />
                                        </div>

                                        {/* Name */}
                                        <h3 className={cn(
                                            "text-xl font-bold mb-2",
                                            isRegular ? "text-gray-900" : "text-gray-800",
                                            isAnonymous && "text-purple-600 font-medium"
                                        )}>
                                            {maskName(donor.donorName)}
                                        </h3>

                                        {/* Amount */}
                                        <div className={cn(
                                            "font-bold text-lg mb-6",
                                            isRegular ? "text-amber-600" : "text-gray-600"
                                        )}>
                                            {formatAmount(donor.amount)}
                                        </div>

                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-4" />

                                        {/* Date */}
                                        <p className="text-xs font-medium text-gray-400">
                                            후원일자: {formatDate(donor.date)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-16 pb-8">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full border-amber-200 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1.5 px-4">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={cn(
                                        "w-9 h-9 rounded-full text-sm font-bold transition-all transform hover:scale-110",
                                        currentPage === page
                                            ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                                            : "text-amber-700 hover:bg-amber-50"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-full border-amber-200 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
