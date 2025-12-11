'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getPostDetail, deletePost, BoardPostDetail } from '@/api/boardApi';
import { getMyProfile, UserProfile } from '@/api/memberApi';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, User, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentSection } from "@/components/board/CommentSection";

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

function BoardDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const postId = Number(params.id);
    const page = searchParams.get('page') || '0';

    const [post, setPost] = useState<BoardPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postData, userData] = await Promise.all([
                    getPostDetail(postId),
                    getMyProfile().catch(() => null)
                ]);
                setPost(postData);
                setCurrentUser(userData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert('게시글을 불러올 수 없습니다.');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchData();
        }
    }, [postId, router]);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deletePost(postId);
            alert('삭제되었습니다.');
            router.push('/members/board');
        } catch (error) {
            console.error("Failed to delete post", error);
            alert('삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    if (!post) return null;

    const isAuthor = currentUser?.userId === post.authorId;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{post.title}</h1>
                    {isAuthor && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/members/board/${postId}/edit`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    수정
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    삭제
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {(post.authorProfileImage || post.authorProfileImageKey) ? (
                                <img
                                    src={post.authorProfileImage || (post.authorProfileImageKey?.startsWith('http') ? post.authorProfileImageKey : `${IMAGE_BASE_URL}${post.authorProfileImageKey}`)}
                                    alt={post.authorName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-3 h-3 text-gray-400" />
                            )}
                        </div>
                        <span className="font-medium">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Images */}
                {post.images && post.images.length > 0 && (
                    <div className="space-y-4 mb-8">
                        {post.images.map((img) => (
                            <img
                                key={img.imageId}
                                src={img.imageUrl.startsWith('http') ? img.imageUrl : `${IMAGE_BASE_URL}${img.imageUrl}`}
                                alt="Attached"
                                className="rounded-lg max-w-full"
                            />
                        ))}
                    </div>
                )}

                {/* Text */}
                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </div>
            </div>

            {/* Comment Section */}
            <div className="px-8 pb-8">
                <CommentSection postId={postId} />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-center">
                <Button variant="outline" onClick={() => router.push(`/members/board?page=${page}`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    목록으로
                </Button>
            </div>
        </div>
    );
}

export default function BoardDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <BoardDetailContent />
        </Suspense>
    );
}
