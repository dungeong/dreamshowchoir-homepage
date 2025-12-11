'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getActivityMaterials, // Using Public API for list as requested
    createActivityMaterial,
    updateActivityMaterial,
    deleteActivityMaterial,
    ActivityMaterial
} from '@/api/activityMaterialsApi';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';
import { Loader2, Plus, Pencil, Trash2, FileText, Download } from 'lucide-react';

export default function ActivityMaterialPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ActivityMaterial | null>(null);

    // Form State (Create)
    const [createTitle, setCreateTitle] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [createFile, setCreateFile] = useState<File | null>(null);

    // Form State (Edit)
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');

    // --- Queries ---
    const { data, isLoading } = useQuery({
        queryKey: ['admin-activity-materials', page],
        queryFn: () => getActivityMaterials(page, 10)
    });

    // --- Mutations ---
    const createMutation = useMutation({
        mutationFn: async () => {
            if (!createFile) throw new Error("File is required");
            await createActivityMaterial({ title: createTitle, description: createDesc }, createFile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-activity-materials'] });
            Swal.fire('성공', '자료가 등록되었습니다.', 'success');
            setIsCreateOpen(false);
            resetCreateForm();
        },
        onError: () => Swal.fire('실패', '자료 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!selectedItem) return;
            await updateActivityMaterial(selectedItem.materialId, { title: editTitle, description: editDesc });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-activity-materials'] });
            Swal.fire('성공', '자료가 수정되었습니다.', 'success');
            setIsEditOpen(false);
        },
        onError: () => Swal.fire('실패', '자료 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteActivityMaterial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-activity-materials'] });
            Swal.fire('성공', '자료가 삭제되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '자료 삭제에 실패했습니다.', 'error')
    });

    // --- Handlers ---
    const resetCreateForm = () => {
        setCreateTitle('');
        setCreateDesc('');
        setCreateFile(null);
    };

    const handleOpenEdit = (item: ActivityMaterial) => {
        setSelectedItem(item);
        setEditTitle(item.title);
        setEditDesc(item.description);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 자료는 복구할 수 없습니다.",
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

    const getFileUrl = (key?: string) => {
        if (!key) return '#';
        if (key.startsWith('http')) return key;
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://dreamshow-storage.s3.ap-northeast-2.amazonaws.com';
        const cleanKey = key.startsWith('/') ? key : `/${key}`;
        return `${baseUrl}${cleanKey}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">활동 자료 관리</h1>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    자료 등록
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">No</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[200px]">파일명</TableHead>
                            <TableHead className="w-[150px] text-center">작성자</TableHead>
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
                            data.content.map((item, index) => (
                                <TableRow key={item.materialId} className="hover:bg-gray-50">
                                    <TableCell className="text-center font-medium">
                                        {(data.totalElements || 0) - (page * (data.size || 10)) - index}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900">{item.title}</span>
                                            {item.description && <span className="text-xs text-gray-500 truncate max-w-[300px]">{item.description}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={getFileUrl(item.fileKey)}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            <FileText className="w-3 h-3" />
                                            {item.fileName}
                                            <Download className="w-3 h-3 ml-1" />
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-gray-600">
                                        {item.authorName || '알 수 없음'}
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEdit(item)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-600" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(item.materialId)}
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
                                    등록된 자료가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
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

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>활동 자료 등록</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={createTitle}
                                onChange={(e) => setCreateTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">설명</Label>
                            <Textarea
                                id="desc"
                                value={createDesc}
                                onChange={(e) => setCreateDesc(e.target.value)}
                                placeholder="설명을 입력하세요"
                                className="resize-none h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">파일 <span className="text-red-500">*</span></Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setCreateFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !createTitle || !createFile}
                            className="gap-2"
                        >
                            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            등록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>활동 자료 수정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">제목</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-desc">설명</Label>
                            <Textarea
                                id="edit-desc"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="resize-none h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>파일</Label>
                            <div className="p-3 bg-gray-50 rounded border text-sm text-gray-500">
                                파일 수정은 불가능합니다. 삭제 후 다시 등록해주세요.
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>취소</Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending || !editTitle}
                            className="gap-2"
                        >
                            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            수정 완료
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
