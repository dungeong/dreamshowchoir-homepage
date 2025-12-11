'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBanners, BannerDto } from '@/api/bannerApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection() {
    const [banners, setBanners] = useState<BannerDto[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBanners()
            .then((data) => {
                setBanners(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (loading) return <div className="h-[600px] w-full bg-gray-100 animate-pulse" />;

    // Fallback if no banners
    const displayBanners: BannerDto[] = banners.length > 0 ? banners : [
        {
            bannerId: 0,
            imageUrl: '/placeholder-hero.jpg',
            title: '꿈을 노래하다',
            description: 'Dream Show Choir',
            orderIndex: 0,
            isActive: true
        }
    ];

    return (
        <section className="relative h-[600px] w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${displayBanners[currentIndex].imageUrl || '/placeholder-hero.jpg'})` }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content */}
                </motion.div>
            </AnimatePresence>

            {/* Content Overlay (Fixed) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 z-20 pointer-events-none">
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-xl md:text-2xl font-medium mb-2 opacity-90"
                >
                    울산 유일의 20~40대 청년퍼포먼스쇼합창단
                </motion.h2>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-3xl md:text-5xl font-bold mb-6 font-sans"
                >
                    사회적협동조합 드림쇼콰이어입니다.
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-lg md:text-xl font-light"
                >
                    문의전화 : <span className="font-bold">010-5592-0970</span>
                </motion.p>
            </div>

            {/* Controls */}
            {displayBanners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        aria-label="Previous slide"
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next slide"
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {displayBanners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all",
                                    idx === currentIndex ? "bg-primary w-8" : "bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
