'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGalleryDetail, GalleryDetailResponse } from '@/api/galleryApi';
import { ArrowLeft, Calendar, User, PlayCircle } from 'lucide-react';

interface GalleryDetailProps {
    id: number;
}

// TODO: Replace with actual CloudFront/S3 base URL
const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

export function GalleryDetail({ id }: GalleryDetailProps) {
    const [gallery, setGallery] = useState<GalleryDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getGalleryDetail(id);
                setGallery(data);
            } catch (err: any) {
                console.error("Failed to fetch gallery detail", err);
                setError(err.message || '게시물을 불러오는 중 오류가 발생했습니다.');
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

    const mainMedia = gallery.mediaList && gallery.mediaList.length > 0 ? gallery.mediaList[0] : null;
    const mediaUrl = mainMedia ? (mainMedia.fileKey.startsWith('http') ? mainMedia.fileKey : `${IMAGE_BASE_URL}/${mainMedia.fileKey}`) : null;

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
                    {gallery.createdAt && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Content */}
            <div className="bg-black/5 flex justify-center items-center min-h-[400px] p-4">
                {mainMedia ? (
                    mainMedia.mediaType === 'VIDEO' ? (
                        // Assuming url is a YouTube embed or video file. 
                        mediaUrl && (mediaUrl.includes('youtube') || mediaUrl.includes('youtu.be')) ? (
                            <iframe
                                src={mediaUrl.replace('watch?v=', 'embed/')}
                                className="w-full max-w-3xl aspect-video rounded-lg shadow-lg"
                                allowFullScreen
                                title={gallery.title}
                            />
                        ) : (
                            <video controls className="w-full max-w-3xl rounded-lg shadow-lg" src={mediaUrl || ''} />
                        )
                    ) : (
                        <img
                            src={mediaUrl || '/placeholder.jpg'}
                            alt={gallery.title}
                            className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                        />
                    )
                ) : (
                    <div className="text-gray-400">이미지가 없습니다.</div>
                )}
            </div>

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
