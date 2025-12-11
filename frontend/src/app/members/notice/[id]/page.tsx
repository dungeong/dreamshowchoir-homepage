'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getNoticeDetail, NoticeDetail } from '@/api/noticeApi';
import { Loader2, ArrowLeft, Calendar, User } from 'lucide-react';

export default function NoticeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [notice, setNotice] = useState<NoticeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchNoticeDetail(Number(params.id));
        }
    }, [params.id]);

    const fetchNoticeDetail = async (id: number) => {
        setLoading(true);
        try {
            const data = await getNoticeDetail(id);
            setNotice(data);
        } catch (error) {
            console.error("Failed to fetch notice detail", error);
            setError("공지사항을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (error || !notice) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || "공지사항을 찾을 수 없습니다."}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">공지</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{notice.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{notice.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-8">
                        {notice.content}
                    </div>

                    {notice.images && notice.images.length > 0 && (
                        <div className="space-y-4">
                            {notice.images.map((img) => (
                                <div key={img.imageId} className="rounded-lg overflow-hidden border border-gray-100">
                                    <img
                                        src={img.imageUrl}
                                        alt="첨부 이미지"
                                        className="w-full h-auto"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
