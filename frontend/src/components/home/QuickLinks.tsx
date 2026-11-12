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
        <section className="bg-white py-6 sm:py-8 lg:py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="group flex flex-col items-center rounded-xl bg-blue-50 p-3 text-center transition-colors duration-300 hover:bg-blue-100 sm:p-5 lg:p-8"
                        >
                            <h3 className="mb-1 text-base leading-tight font-bold text-blue-600 sm:text-lg lg:mb-2 lg:text-xl">{link.title}</h3>
                            <p className="mb-2 break-keep text-xs leading-snug text-blue-700 sm:mb-4 lg:mb-6 lg:text-sm">{link.description}</p>
                            <div className="mt-auto flex size-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110 sm:size-9 lg:size-10">
                                <ArrowRight aria-hidden="true" className="size-3.5 text-blue-500 sm:size-4 lg:size-5" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
