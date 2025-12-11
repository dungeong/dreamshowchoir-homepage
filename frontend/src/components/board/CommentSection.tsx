'use client';

import { useState, useEffect } from 'react';
import { getComments, createComment, updateComment, deleteComment, Comment } from '@/api/commentApi';
import { getMyProfile, UserProfile } from '@/api/memberApi';
import { Button } from "@/components/ui/button";
import { Loader2, User, Send, Edit2, Trash2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

interface CommentSectionProps {
    postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edit mode state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        fetchData();
    }, [postId]);

    const fetchData = async () => {
        try {
            const [commentsData, userData] = await Promise.all([
                getComments(postId),
                getMyProfile().catch(() => null)
            ]);
            setComments(commentsData);
            setCurrentUser(userData);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const created = await createComment(postId, newComment);
            setComments(prev => [created, ...prev]); // Optimistic-like update (prepend)
            setNewComment('');
        } catch (error) {
            console.error("Failed to create comment", error);
            alert('댓글 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditStart = (comment: Comment) => {
        setEditingId(comment.commentId);
        setEditContent(comment.content);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleEditSave = async (commentId: number) => {
        if (!editContent.trim()) return;

        try {
            const updated = await updateComment(postId, commentId, editContent);
            setComments(prev => prev.map(c => c.commentId === commentId ? updated : c));
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update comment", error);
            alert('댓글 수정에 실패했습니다.');
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await deleteComment(postId, commentId);
            setComments(prev => prev.filter(c => c.commentId !== commentId));
        } catch (error) {
            console.error("Failed to delete comment", error);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return <div className="py-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;
    }

    return (
        <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                댓글 <span className="text-primary">{comments.length}</span>
            </h3>

            {/* Comment Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                            {(currentUser.profileImageUrl || currentUser.profileImageKey) ? (
                                <img
                                    src={currentUser.profileImageUrl || (currentUser.profileImageKey?.startsWith('http') ? currentUser.profileImageKey : `${IMAGE_BASE_URL}${currentUser.profileImageKey}`)}
                                    alt={currentUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 남겨보세요."
                                className="w-full min-h-[80px] p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-white"
                            />
                            <div className="flex justify-end mt-2">
                                <Button type="submit" disabled={!newComment.trim() || submitting} size="sm">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    등록
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm">
                    댓글을 작성하려면 로그인이 필요합니다.
                </div>
            )}

            {/* Comment List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.commentId} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                {(comment.authorProfileImage || comment.authorProfileImageKey) ? (
                                    <img
                                        src={comment.authorProfileImage || (comment.authorProfileImageKey?.startsWith('http') ? comment.authorProfileImageKey : `${IMAGE_BASE_URL}${comment.authorProfileImageKey}`)}
                                        alt={comment.authorName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{comment.authorName}</span>
                                        <span className="text-xs text-gray-400">
                                            {format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm')}
                                            {comment.updatedAt > comment.createdAt && ' (수정됨)'}
                                        </span>
                                    </div>
                                    {currentUser?.userId === comment.authorId && !editingId && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditStart(comment)}
                                                className="p-1 text-gray-400 hover:text-primary rounded"
                                                title="수정"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.commentId)}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingId === comment.commentId ? (
                                    <div className="mt-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-8">
                                                <X className="w-3 h-3 mr-1" /> 취소
                                            </Button>
                                            <Button size="sm" onClick={() => handleEditSave(comment.commentId)} className="h-8">
                                                <Check className="w-3 h-3 mr-1" /> 저장
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                                        {comment.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        첫 번째 댓글을 남겨보세요!
                    </div>
                )}
            </div>
        </div>
    );
}
