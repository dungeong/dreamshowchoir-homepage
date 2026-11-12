'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface GalleryPhotoDialogProps {
    title: string;
    photos: { mediaId: number; src: string }[];
    initialIndex: number;
    onCloseAutoFocus: (event: Event) => void;
}

interface SwipeStart {
    pointerId: number;
    x: number;
    y: number;
    width: number;
}

const MIN_SWIPE_DISTANCE = 48;
const HORIZONTAL_SWIPE_RATIO = 1.25;

function horizontalSwipeDistance(event: PointerEvent<HTMLDivElement>, start: SwipeStart) {
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    return Math.abs(deltaX) > Math.abs(deltaY) * HORIZONTAL_SWIPE_RATIO ? deltaX : 0;
}

export function GalleryPhotoDialog({ title, photos, initialIndex, onCloseAutoFocus }: GalleryPhotoDialogProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const swipeStart = useRef<SwipeStart | null>(null);
    const position = useMotionValue(initialIndex);
    const x = useTransform(position, (index) => `${-index * 100}%`);
    const reduceMotion = useReducedMotion();
    const singlePhoto = photos.length === 1;
    const firstSlideIndex = Math.max(0, activeIndex - 1);
    const lastSlideIndex = Math.min(photos.length - 1, activeIndex + 1);

    useEffect(() => () => position.stop(), [position]);

    const settleAt = (index: number) => {
        if (reduceMotion || position.get() === index) {
            position.jump(index);
            setActiveIndex(index);
            return;
        }

        animate(position, index, {
            duration: 0.26,
            ease: 'easeOut',
            onComplete: () => setActiveIndex(index),
        });
    };

    const movePhoto = (offset: number) => {
        const nextIndex = activeIndex + offset;
        if (photos[nextIndex] && !swipeStart.current && !position.isAnimating()) {
            settleAt(nextIndex);
        }
    };

    const cancelSwipe = () => {
        if (!swipeStart.current) return;
        swipeStart.current = null;
        settleAt(activeIndex);
    };

    const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
        if (!event.isPrimary) {
            cancelSwipe();
            return;
        }
        if (singlePhoto || event.button !== 0 || position.isAnimating()) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        swipeStart.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            width: event.currentTarget.clientWidth,
        };
    };

    const updateSwipe = (event: PointerEvent<HTMLDivElement>) => {
        const start = swipeStart.current;
        if (!start || start.pointerId !== event.pointerId || !start.width || reduceMotion) return;

        const progress = activeIndex - horizontalSwipeDistance(event, start) / start.width;
        position.set(Math.min(lastSlideIndex, Math.max(firstSlideIndex, progress)));
    };

    const finishSwipe = (event: PointerEvent<HTMLDivElement>) => {
        const start = swipeStart.current;
        if (!start || start.pointerId !== event.pointerId) return;
        swipeStart.current = null;

        const distance = horizontalSwipeDistance(event, start);
        const offset = Math.abs(distance) >= MIN_SWIPE_DISTANCE ? -Math.sign(distance) : 0;
        const nextIndex = activeIndex + offset;
        settleAt(photos[nextIndex] ? nextIndex : activeIndex);
    };

    return (
        <DialogContent
            showCloseButton={false}
            className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] gap-2 overflow-y-auto border-0 bg-neutral-950 p-2 text-white motion-reduce:animate-none sm:max-w-6xl sm:p-4"
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
                }
            }}
            onCloseAutoFocus={onCloseAutoFocus}
        >
            <div className="flex items-center justify-between gap-3 px-1">
                <DialogTitle className="truncate text-sm sm:text-base">{title}</DialogTitle>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label="사진 닫기" className="hover:bg-white/15 hover:text-white">
                        <X aria-hidden="true" />
                    </Button>
                </DialogClose>
            </div>
            <DialogDescription className="sr-only">
                {singlePhoto ? '선택한 사진을 크게 볼 수 있습니다.' : '사진을 좌우로 밀거나 화살표 키를 눌러 다른 사진을 볼 수 있습니다.'}
            </DialogDescription>
            <div
                className={singlePhoto ? 'min-w-0' : 'min-w-0 overflow-hidden select-none [touch-action:pan-y_pinch-zoom]'}
                onPointerDown={startSwipe}
                onPointerMove={updateSwipe}
                onPointerUp={finishSwipe}
                onPointerCancel={cancelSwipe}
                onLostPointerCapture={cancelSwipe}
            >
                <motion.div
                    className={singlePhoto ? undefined : 'relative h-[calc(100dvh-8rem)] w-full sm:h-[calc(100dvh-9rem)]'}
                    style={{ x }}
                >
                    {photos.slice(firstSlideIndex, lastSlideIndex + 1).map((photo, offset) => {
                        const index = firstSlideIndex + offset;
                        return (
                            <div
                                key={photo.mediaId}
                                className={singlePhoto ? undefined : 'absolute inset-y-0 flex w-full items-center justify-center'}
                                style={singlePhoto ? undefined : { left: `${index * 100}%` }}
                                aria-hidden={index !== activeIndex}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- The enlarged view uses the original image. */}
                                <img
                                    src={photo.src}
                                    alt={`${title} 사진 ${index + 1}`}
                                    className={singlePhoto
                                        ? 'mx-auto block max-h-[calc(100dvh-8rem)] max-w-full object-contain'
                                        : 'block max-h-full max-w-full object-contain'}
                                    draggable={false}
                                />
                            </div>
                        );
                    })}
                </motion.div>
            </div>
            {!singlePhoto && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        type="button" variant="ghost" size="icon"
                        aria-label="이전 사진" disabled={activeIndex === 0}
                        className="hover:bg-white/15 hover:text-white"
                        onClick={() => movePhoto(-1)}
                    >
                        <ChevronLeft aria-hidden="true" />
                    </Button>
                    <span className="text-sm tabular-nums" aria-live="polite">{activeIndex + 1} / {photos.length}</span>
                    <Button
                        type="button" variant="ghost" size="icon"
                        aria-label="다음 사진" disabled={activeIndex === photos.length - 1}
                        className="hover:bg-white/15 hover:text-white"
                        onClick={() => movePhoto(1)}
                    >
                        <ChevronRight aria-hidden="true" />
                    </Button>
                </div>
            )}
        </DialogContent>
    );
}
