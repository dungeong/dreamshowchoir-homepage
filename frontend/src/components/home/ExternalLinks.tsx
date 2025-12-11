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
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {externalLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            target={link.target}
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 font-bold text-lg shadow-sm hover:shadow-md gap-4 group"
                        >
                            <div className={`w-16 h-16 relative flex items-center justify-center ${link.bgColor} rounded-full shadow-sm p-3 group-hover:scale-110 transition-transform overflow-hidden`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={link.logoUrl}
                                    alt={`${link.name} 로고`}
                                    className={`w-full h-full object-${link.objectFit}`}
                                    style={{ transform: link.scale ? `scale(${link.scale})` : 'none' }}
                                />
                            </div>
                            <span>{link.name} 바로가기</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
