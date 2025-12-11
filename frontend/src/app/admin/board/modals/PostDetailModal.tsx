'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { getPostDetail } from '@/api/boardApi'; // Public/Common API
import { getComments } from '@/api/commentApi'; // Public/Common API
import { adminDeletePost } from '@/api/adminBoardApi'; // Admin API
import { Loader2, Trash2, X, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

// Helper for S3 Images
const getImageUrl = (key?: string) => {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    // Assuming VITE_IMAGE_BASE_URL is available via NEXT_PUBLIC_ or similar config
    // Based on previous code in Gallery:
    const IMAGE_BASE_URL = 'https://dreamshow-storage.s3.ap-northeast-2.amazonaws.com';
    const cleanKey = key.startsWith('/') ? key : `/${key}`;
    return `${IMAGE_BASE_URL}${cleanKey}`;
};

interface PostDetailModalProps {
    postId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PostDetailModal({ postId, isOpen, onClose }: PostDetailModalProps) {
    const queryClient = useQueryClient();

    // Fetch Post Detail
    const { data: post, isLoading: isPostLoading } = useQuery({
        queryKey: ['post-detail', postId],
        queryFn: () => getPostDetail(postId!),
        enabled: !!postId && isOpen
    });

    // Fetch Comments
    const { data: comments, isLoading: isCommentsLoading } = useQuery({
        queryKey: ['post-comments', postId],
        queryFn: () => getComments(postId!),
        enabled: !!postId && isOpen
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminDeletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            Swal.fire('성공', '게시글이 삭제되었습니다.', 'success');
            onClose();
        },
        onError: () => Swal.fire('실패', '게시글 삭제에 실패했습니다.', 'error')
    });

    const handleDelete = () => {
        if (!postId) return;

        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 게시글은 복구할 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(postId);
            }
        });
    };

    if (!postId && !isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-start text-xl pr-8">
                        {isPostLoading ? <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded" /> : post?.title}
                    </DialogTitle>
                </DialogHeader>

                {isPostLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
                    </div>
                ) : post ? (
                    <div className="space-y-6">
                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 pb-4 border-b">
                            <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-gray-900">{post.authorName || '알 수 없음'}</span>
                            </div>
                            <span>|</span>
                            <span>{new Date(post.createdAt).toLocaleString()}</span>
                        </div>

                        {/* Content */}
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-800 min-h-[100px]">
                            {post.content}
                        </div>

                        {/* Images */}
                        {post.images && post.images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {post.images.map((img) => (
                                    <div key={img.imageId} className="relative rounded-lg overflow-hidden border border-gray-200">
                                        {/* Use getImageUrl if direct URL is not reliable or use img.imageUrl if that's the key */}
                                        {/* Based on previous chats, fileKey is often what we have. API type says imageUrl currently. 
                                            Let's check if imageUrl is full URL or key. 
                                            If it fails, we handles error. 
                                            Safe bet: if it doesn't start with http, wrap it. 
                                        */}
                                        <img
                                            src={getImageUrl(img.imageUrl) || img.imageUrl}
                                            alt="Post attachment"
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="bg-gray-50 rounded-lg p-4 mt-8">
                            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                댓글 <span className="text-blue-600">{comments?.length || 0}</span>
                            </h3>

                            {isCommentsLoading ? (
                                <div className="py-4 text-center text-gray-400">댓글을 불러오는 중...</div>
                            ) : comments && comments.length > 0 ? (
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.commentId} className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-sm text-gray-900">{comment.authorName}</span>
                                                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center text-gray-500 text-sm">작성된 댓글이 없습니다.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-10 text-center text-red-500">게시글 정보를 불러오지 못했습니다.</div>
                )}

                <DialogFooter className="gap-2 sm:justify-between sticky bottom-0 bg-white pt-4 mt-4 border-t">
                    <Button variant="ghost" onClick={onClose} className="sm:mr-auto">
                        닫기
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending || !post}
                    >
                        {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        삭제하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
