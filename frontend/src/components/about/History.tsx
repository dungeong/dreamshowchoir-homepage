'use client';

import { useEffect, useState } from 'react';
import { getHistory, HistoryItem } from '@/api/historyApi';

interface YearGroup {
    year: number;
    events: HistoryItem[];
}

export function History() {
    const [historyGroups, setHistoryGroups] = useState<YearGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHistory();

                // Group by year
                const groups: { [key: number]: HistoryItem[] } = {};
                data.forEach(item => {
                    if (!groups[item.year]) {
                        groups[item.year] = [];
                    }
                    groups[item.year].push(item);
                });

                // Convert to array and sort
                const sortedGroups = Object.keys(groups)
                    .map(year => Number(year))
                    .sort((a, b) => b - a) // Descending year
                    .map(year => ({
                        year,
                        events: groups[year].sort((a, b) => b.month - a.month) // Descending month
                    }));

                setHistoryGroups(sortedGroups);
            } catch (err) {
                console.error('Failed to fetch history:', err);
                setError('연혁을 불러오는 중 오류가 발생했습니다.');
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

    if (historyGroups.length === 0) {
        return <div className="text-center py-20">등록된 연혁이 없습니다.</div>;
    }

    return (
        <div className="relative border-l-2 border-primary/20 ml-4 md:ml-8 space-y-12 py-4">
            {historyGroups.map((yearGroup) => (
                <div key={yearGroup.year} className="relative pl-8 md:pl-12">
                    {/* Year Marker */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />

                    <h3 className="text-3xl font-bold text-primary mb-6">{yearGroup.year}</h3>

                    <ul className="space-y-4">
                        {yearGroup.events.map((event) => (
                            <li key={event.historyId} className="text-lg text-gray-700 hover:text-primary transition-colors flex gap-4">
                                <span className="font-bold min-w-[3rem]">{event.month.toString().padStart(2, '0')}</span>
                                <span>{event.content}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
