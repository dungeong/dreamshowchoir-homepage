import { Calendar, MapPin } from 'lucide-react';

const performances = [
    {
        id: 1,
        title: '2024 정기공연 "꿈의 멜로디"',
        date: '2024.12.25 (수) 19:00',
        location: '울산문화예술회관 대공연장',
        imageUrl: '/placeholder-poster-1.jpg',
        status: 'upcoming'
    },
    {
        id: 2,
        title: '찾아가는 음악회 - 울산대공원',
        date: '2024.10.15 (토) 14:00',
        location: '울산대공원 야외공연장',
        imageUrl: '/placeholder-poster-2.jpg',
        status: 'completed'
    },
    {
        id: 3,
        title: '제3회 정기공연',
        date: '2023.09.01 (금) 19:30',
        location: '중구 문화의전당',
        imageUrl: '/placeholder-poster-3.jpg',
        status: 'completed'
    },
];

export function PerformanceList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {performances.map((perf) => (
                <div key={perf.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    {/* Poster Image */}
                    <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            포스터 이미지
                        </div>
                        {perf.status === 'upcoming' && (
                            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                예정
                            </div>
                        )}
                        {perf.status === 'completed' && (
                            <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                종료
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-1">
                            {perf.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{perf.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{perf.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
