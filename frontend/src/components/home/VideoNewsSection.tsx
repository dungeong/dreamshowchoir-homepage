'use client';



import { PerformanceCalendar } from '../activities/PerformanceCalendar';

export function VideoNewsSection() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                    {/* Video Section */}
                    <div className="lg:col-span-3 w-full">
                        <h2 className="text-3xl font-bold text-left mb-8 text-gray-800">드림쇼콰이어 영상</h2>
                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video shadow-lg">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/llwfMSQTgdU"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>

                    {/* Calendar Section */}
                    <div className="lg:col-span-2 w-full">
                        <h2 className="text-3xl font-bold text-left mb-8 text-gray-800">공연 일정</h2>
                        <PerformanceCalendar mini={true} className="h-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
