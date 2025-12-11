'use client';

import { useEffect, useState } from 'react';
import { getContent, ContentResponse } from '@/api/contentApi';
import { SafeHtml } from '@/components/ui/safe-html';
import 'react-quill-new/dist/quill.snow.css'; // Import Quill styles

export function Greetings() {
    const [data, setData] = useState<ContentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getContent('GREETING');
                setData(response);
            } catch (err) {
                console.error('Failed to fetch greetings:', err);
                setError('인사말을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!data) {
        return <div className="text-center py-20">내용이 없습니다.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="w-full space-y-6">
                {/* Header "인사말" removed as it is rendered by AboutLayout */}
                {/* 
                    Added prose classes for typography and view-quill-content/ql-editor for Quill support.
                    prose-headings:text-primary ensures headings match the theme.
                */}
                <div className="prose prose-lg max-w-none prose-headings:text-primary text-gray-600 leading-relaxed view-quill-content ql-editor px-0">
                    <SafeHtml html={data.content} />
                </div>
                <div className="pt-4 font-bold text-right text-lg">
                    사회적협동조합 드림쇼콰이어 대표 <span className="text-primary">조이안</span>
                </div>
            </div>
        </div>
    );
}
