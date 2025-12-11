'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    Notice,
    NoticeDto
} from '@/api/adminBoardApi';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import Swal from 'sweetalert2';
import { Loader2, Plus, Edit2, Trash2, Paperclip } from 'lucide-react';

export default function NoticeManagementPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-notices', page],
        queryFn: () => getNotices(page, 10)
    });

    const resetForm = () => {
        setTitle('');
        setContent('');
        setFiles([]);
        setSelectedNotice(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (notice: Notice) => {
        setTitle(notice.title);
        setContent(notice.content);
        setFiles([]);
        setSelectedNotice(notice);
        setIsModalOpen(true);
    };

    const createMutation = useMutation({
        mutationFn: (data: { dto: NoticeDto, files: File[] }) => createNotice(data.dto, data.files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
            setIsModalOpen(false);
            Swal.fire('성공', '공지사항이 등록되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '공지사항 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number, dto: NoticeDto, files: File[] }) => updateNotice(data.id, data.dto, data.files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
            setIsModalOpen(false);
            Swal.fire('성공', '공지사항이 수정되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '공지사항 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteNotice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
            Swal.fire('성공', '공지사항이 삭제되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '공지사항 삭제에 실패했습니다.', 'error')
    });

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            Swal.fire('경고', '제목과 내용을 입력해주세요.', 'warning');
            return;
        }

        const dto: NoticeDto = { title, content };

        if (selectedNotice) {
            updateMutation.mutate({ id: selectedNotice.noticeId, dto, files });
        } else {
            createMutation.mutate({ dto, files });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 공지사항은 복구할 수 없습니다.",
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    공지사항 작성
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">No</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[100px] text-center">첨부</TableHead>
                            <TableHead className="w-[120px] text-center">조회수</TableHead>
                            <TableHead className="w-[150px] text-center">작성일</TableHead>
                            <TableHead className="w-[150px] text-center">관리</TableHead>
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
                            data.content.map((notice, index) => (
                                <TableRow key={notice.noticeId} className="hover:bg-gray-50">
                                    <TableCell className="text-center font-medium">
                                        {(data.totalElements || 0) - (page * (data.size || 10)) - index}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {notice.title}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {notice.attachments && notice.attachments.length > 0 && (
                                            <Paperclip className="w-4 h-4 mx-auto text-gray-400" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500">
                                        {notice.viewCount}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEdit(notice)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(notice.noticeId)}
                                                className="h-8 w-8 p-0 hover:bg-red-50 border-red-200"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                                    등록된 공지사항이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination helper (simple prev/next for now) */}
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{selectedNotice ? '공지사항 수정' : '공지사항 작성'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="title" className="text-sm font-medium">제목</label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="content" className="text-sm font-medium">내용</label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="내용을 입력하세요"
                                className="h-[200px]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="files" className="text-sm font-medium">첨부파일</label>
                            <Input
                                id="files"
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFiles(Array.from(e.target.files));
                                    }
                                }}
                            />
                            {selectedNotice && selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    기존 첨부파일: {selectedNotice.attachments.map(f => f.originalFileName).join(', ')}
                                    <br />(파일 재업로드 시 기존 파일은 유지되거나 덮어씌워질 수 있습니다 - 로직 확인 필요)
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
                        <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
