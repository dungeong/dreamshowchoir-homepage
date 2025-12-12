'use client';

import Link from 'next/link';
import { ArrowRight, Users, Heart, Image, MapPin } from 'lucide-react';

const links = [
    {
        title: '신입단원모집',
        description: '단원 모집 안내 바로가기',
        href: '/join/recruit',
        icon: Users,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        title: '후원하기',
        description: '후원 안내 바로가기',
        href: '/join/donate',
        icon: Heart,
        color: 'bg-pink-100 text-pink-600',
    },
    {
        title: '공연 갤러리',
        description: '공연 사진 및 영상 갤러리',
        href: '/activities/gallery',
        icon: Image,
        color: 'bg-purple-100 text-purple-600',
    },
    {
        title: '찾아오시는 길',
        description: '연습실 오시는 길 안내',
        href: '/about/location',
        icon: MapPin,
        color: 'bg-green-100 text-green-600',
    },
];

export function QuickLinks() {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="group flex flex-col items-center text-center p-8 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
                        >
                            <h3 className="text-xl font-bold text-blue-600 mb-2">{link.title}</h3>
                            <p className="text-sm text-blue-400 mb-6">{link.description}</p>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-5 h-5 text-blue-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
