'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActivityMaterialById, ActivityMaterial } from '@/api/activityMaterialsApi';
import { ArrowLeft, Calendar, User, Download, FileText } from 'lucide-react';

interface ActivityDetailProps {
    id: number;
}

export function ActivityDetail({ id }: ActivityDetailProps) {
    const [material, setMaterial] = useState<ActivityMaterial | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const data = await getActivityMaterialById(id);
                setMaterial(data);
            } catch (error) {
                console.error("Failed to fetch material detail", error);
                setMaterial(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterial();
    }, [id]);

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

    if (!material) {
        return <div className="text-center py-20">자료를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-8 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{material.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>관리자</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(material.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 min-h-[300px] prose max-w-none text-gray-700 whitespace-pre-wrap">
                {material.description}
            </div>

            {/* Attachments */}
            {material.fileName && (
                <div className="px-8 py-6 bg-blue-50/50 border-t border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        첨부파일
                    </h3>
                    <a
                        href={`/api/download?url=${encodeURIComponent(material.fileKey || '')}&filename=${encodeURIComponent(material.fileName || 'download')}`}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group w-fit"
                    >
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Download className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pr-4">
                            <p className="text-sm font-medium text-gray-900">{material.fileName}</p>
                            <p className="text-xs text-gray-500">다운로드</p>
                        </div>
                    </a>
                </div>
            )}

            {/* Footer / Actions */}
            <div className="p-6 border-t border-gray-100 flex justify-center">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    );
}
