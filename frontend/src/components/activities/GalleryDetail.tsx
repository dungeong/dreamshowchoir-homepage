'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGalleryDetail, GalleryDetailResponse } from '@/api/galleryApi';
import { Dialog } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { GalleryPhotoDialog } from './GalleryPhotoDialog';

interface GalleryDetailProps {
    id: number;
}

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

function getMediaUrl(fileKey: string) {
    return /^https?:\/\//i.test(fileKey) ? fileKey : `${IMAGE_BASE_URL}/${fileKey.replace(/^\/+/, '')}`;
}

export function GalleryDetail({ id }: GalleryDetailProps) {
    const [gallery, setGallery] = useState<GalleryDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePhotoId, setActivePhotoId] = useState<number | null>(null);
    const photoTrigger = useRef<HTMLButtonElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getGalleryDetail(id);
                setGallery(data);
            } catch (err) {
                console.error("Failed to fetch gallery detail", err);
                setError(err instanceof Error ? err.message : '게시물을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetail();
        } else {
            setError('유효하지 않은 게시물 ID입니다.');
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    if (!gallery) {
        return <div className="text-center py-20">게시물을 찾을 수 없습니다.</div>;
    }

    const media = gallery.mediaList ?? [];
    const photos = media.filter(({ mediaType }) => mediaType === 'IMAGE')
        .map(({ mediaId, fileKey }) => ({ mediaId, src: getMediaUrl(fileKey) }));
    const videos = media.filter(({ mediaType }) => mediaType === 'VIDEO');
    const singlePhoto = photos.length === 1;
    const activePhotoIndex = photos.findIndex(({ mediaId }) => mediaId === activePhotoId);
    const displayedDate = gallery.takenDate || gallery.createdAt?.slice(0, 10);

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-8 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                        {gallery.type === 'REGULAR' && '정기공연'}
                        {gallery.type === 'IRREGULAR' && '비정기공연'}
                        {gallery.type === 'EVENT' && '행사'}
                        {!gallery.type && '갤러리'}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{gallery.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{gallery.author.name}</span>
                    </div>
                    {displayedDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="size-4" aria-hidden="true" />
                            <span>{gallery.takenDate ? '촬영일' : '등록일'}</span>
                            <time dateTime={displayedDate}>{displayedDate}</time>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Content */}
            <div className="space-y-4 bg-black/5 p-4">
                {photos.length > 0 && (
                    <Masonry
                        breakpointCols={{ default: Math.min(photos.length, 3), 767: Math.min(photos.length, 2), 359: 1 }}
                        className="flex gap-3"
                        columnClassName="flex min-w-0 flex-col gap-3"
                    >
                        {photos.map((photo, index) => (
                            <button
                                key={photo.mediaId}
                                type="button"
                                aria-haspopup="dialog"
                                aria-label={`${gallery.title} 사진 ${index + 1} 크게 보기`}
                                className="block cursor-zoom-in rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                onClick={(event) => {
                                    photoTrigger.current = event.currentTarget;
                                    setActivePhotoId(photo.mediaId);
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- Gallery media loads directly from storage. */}
                                <img
                                    src={photo.src}
                                    alt={`${gallery.title} 사진 ${index + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className={singlePhoto
                                        ? 'mx-auto block max-h-[600px] max-w-full rounded-lg object-contain'
                                        : 'block h-auto w-full rounded-lg bg-black/5 [aspect-ratio:auto_4/3]'}
                                />
                            </button>
                        ))}
                    </Masonry>
                )}
                {videos.map((video, index) => {
                    const url = getMediaUrl(video.fileKey);
                    return url.includes('youtube') || url.includes('youtu.be') ? (
                        <iframe
                            key={video.mediaId}
                            src={url.replace('watch?v=', 'embed/')}
                            className="mx-auto block aspect-video w-full max-w-3xl rounded-lg shadow-lg"
                            allowFullScreen
                            title={`${gallery.title} 동영상 ${index + 1}`}
                        />
                    ) : (
                        <video
                            key={video.mediaId}
                            src={url}
                            controls
                            preload="metadata"
                            className="mx-auto block w-full max-w-3xl rounded-lg shadow-lg"
                        />
                    );
                })}
                {media.length === 0 && (
                    <div className="flex min-h-[400px] items-center justify-center text-gray-400">이미지가 없습니다.</div>
                )}
            </div>

            <Dialog open={activePhotoIndex >= 0} onOpenChange={(open) => {
                if (!open) setActivePhotoId(null);
            }}>
                {activePhotoIndex >= 0 && (
                    <GalleryPhotoDialog
                        key={activePhotoId}
                        title={gallery.title}
                        photos={photos}
                        initialIndex={activePhotoIndex}
                        onCloseAutoFocus={(event) => {
                            const trigger = photoTrigger.current;
                            if (trigger?.isConnected) {
                                event.preventDefault();
                                trigger.focus();
                            }
                        }}
                    />
                )}
            </Dialog>

            {/* Text Content */}
            <div className="p-8 prose max-w-none text-gray-700 whitespace-pre-wrap">
                {gallery.description}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-center">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    );
}
