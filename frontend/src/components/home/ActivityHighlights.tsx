'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const activities = [
    {
        id: 1,
        title: '2024 정기공연 "꿈의 멜로디"',
        date: '2024.12.25',
        imageUrl: '/placeholder-activity-1.jpg',
        category: '정기공연'
    },
    {
        id: 2,
        title: '찾아가는 음악회 - 울산대공원',
        date: '2024.10.15',
        imageUrl: '/placeholder-activity-2.jpg',
        category: '행사'
    },
    {
        id: 3,
        title: '신입 단원 환영회',
        date: '2024.09.01',
        imageUrl: '/placeholder-activity-3.jpg',
        category: '소식'
    },
];

export function ActivityHighlights() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">활동 하이라이트</h2>
                        <p className="text-muted-foreground">드림쇼콰이어의 생생한 활동 모습을 만나보세요.</p>
                    </motion.div>

                    <Link href="/activities" className="hidden md:flex items-center text-primary hover:underline group">
                        더 보기 <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4 shadow-md bg-gray-100">
                                {/* Placeholder for image */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    이미지 준비중
                                </div>
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                <span className="absolute top-4 left-4 bg-white/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    {activity.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {activity.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/activities" className="inline-flex items-center text-primary font-medium">
                        활동 더 보기 <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
