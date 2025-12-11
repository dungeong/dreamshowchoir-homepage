'use client';

import { useEffect, useState } from 'react';
import { getContent, ContentResponse } from '@/api/contentApi';

export function Organization() {
    const [data, setData] = useState<ContentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getContent('ORGANIZATION');
                setData(response);
            } catch (err) {
                console.error('Failed to fetch organization chart:', err);
                setError('조직도를 불러오는 중 오류가 발생했습니다.');
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

    if (!data || !data.content) {
        return <div className="text-center py-20">등록된 조직도가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col items-center space-y-8 py-8">
            <h3 className="text-2xl font-bold text-primary sr-only">조직도</h3>
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <img
                    src={data.content}
                    alt="드림쇼콰이어 조직도"
                    className="w-full h-auto object-contain"
                />
            </div>
        </div>
    );
}
