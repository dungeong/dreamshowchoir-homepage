'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPosts,
} from '@/api/boardApi'; // Use existing public API for listing
import {
    adminDeletePost
} from '@/api/adminBoardApi'; // Use admin API for deletion
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { Loader2, Trash2, User } from 'lucide-react';

// ... imports
import PostDetailModal from '../modals/PostDetailModal';

export default function PostManagementPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-posts', page],
        queryFn: () => getPosts(page, 10)
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminDeletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            Swal.fire('성공', '게시글이 삭제되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '게시글 삭제에 실패했습니다.', 'error')
    });

    const handleDelete = (id: number) => {
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
                deleteMutation.mutate(id);
            }
        });
    };

    const handleRowClick = (postId: number) => {
        setSelectedPostId(postId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPostId(null);
    };

    return (
        <div className="space-y-6">
            {/* ... header ... */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">게시글 관리</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    {/* ... header ... */}
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">No</TableHead>
                            <TableHead>제목 / 내용</TableHead>
                            <TableHead className="w-[150px] text-center">작성자</TableHead>
                            <TableHead className="w-[100px] text-center">댓글</TableHead>
                            <TableHead className="w-[150px] text-center">작성일</TableHead>
                            <TableHead className="w-[100px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((post, index) => (
                                <TableRow
                                    key={post.postId}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleRowClick(post.postId)}
                                >
                                    <TableCell className="text-center font-medium">
                                        {(data.totalElements || 0) - (page * (data.size || 10)) - index}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{post.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <User className="w-3 h-3" />
                                            {post.authorName}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500 font-medium">
                                        {post.commentCount}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(post.postId)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                                    등록된 게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination helper */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                        이전
                    </Button>
                    <span className="py-2 px-4 text-sm text-gray-600">
                        {page + 1} / {data.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= data.totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                    >
                        다음
                    </Button>
                </div>
            )}

            <PostDetailModal
                postId={selectedPostId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}
