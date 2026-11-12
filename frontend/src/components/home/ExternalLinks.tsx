'use client';

import Link from 'next/link';

const externalLinks = [
    {
        name: '문화체육관광부',
        href: 'https://www.mcst.go.kr',
        target: '_blank',
        logoUrl: '/images/logos/gov.png',
        objectFit: 'contain',
        bgColor: 'bg-white'
    },
    {
        name: '국세청',
        href: 'https://www.nts.go.kr',
        target: '_blank',
        logoUrl: '/images/logos/gov.png',
        objectFit: 'contain',
        bgColor: 'bg-white'
    },
    {
        name: '블로그',
        href: 'https://blog.naver.com/dreamshowchoir',
        target: '_blank',
        logoUrl: '/images/logos/blog_original.jpg',
        objectFit: 'cover',
        bgColor: 'bg-black',
        scale: 1.3
    },
];

export function ExternalLinks() {
    return (
        <section className="bg-white py-6 sm:py-8 lg:py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                    {externalLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            target={link.target}
                            rel="noopener noreferrer"
                            className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 px-1.5 py-2 text-center text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md sm:min-h-32 sm:gap-3 sm:p-4 sm:text-base lg:min-h-40 lg:gap-4 lg:text-lg"
                        >
                            <div className={`relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full p-1.5 shadow-sm transition-transform group-hover:scale-110 sm:size-12 sm:p-2 lg:size-16 lg:p-3 ${link.bgColor}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={link.logoUrl}
                                    alt={`${link.name} 로고`}
                                    className={`w-full h-full object-${link.objectFit}`}
                                    style={{ transform: link.scale ? `scale(${link.scale})` : 'none' }}
                                />
                            </div>
                            <span className="leading-tight">{link.name} 바로가기</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
