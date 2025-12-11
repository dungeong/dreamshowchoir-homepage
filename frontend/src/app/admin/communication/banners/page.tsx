
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import {
    getAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    BannerDto,
    BannerCreateDto,
    BannerUpdateDto
} from '@/api/bannerApi';
import { Button } from '@/components/ui/button';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';

export default function BannerManagementPage() {
    const queryClient = useQueryClient();

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingBanner, setEditingBanner] = useState<BannerDto | null>(null);

    // Form Data
    const [createForm, setCreateForm] = useState<BannerCreateDto>({ title: '', description: '' });
    const [editForm, setEditForm] = useState<BannerUpdateDto>({
        title: '',
        description: '',
        orderIndex: 0,
        isActive: true
    });

    // Query
    const { data: banners, isLoading } = useQuery({
        queryKey: ['banners'],
        queryFn: getAdminBanners,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async () => {
            if (!selectedFile) throw new Error("이미지를 선택해주세요.");
            await createBanner(createForm, selectedFile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            closeCreateModal();
            Swal.fire({
                title: '성공',
                text: '배너가 등록되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: (err) => Swal.fire('실패', '배너 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editingBanner) return;
            // File is optional here
            await updateBanner(editingBanner.bannerId, editForm, selectedFile || undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            closeEditModal();
            Swal.fire({
                title: '성공',
                text: '배너가 수정되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: (err) => Swal.fire('실패', '배너 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            Swal.fire({
                title: '삭제됨',
                text: '배너가 삭제되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', '배너 삭제에 실패했습니다.', 'error')
    });

    // Handlers
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "이 작업은 되돌릴 수 없습니다.",
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

    const openCreateModal = () => {
        setCreateForm({ title: '', description: '' });
        setSelectedFile(null);
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateForm({ title: '', description: '' });
        setSelectedFile(null);
    };

    const openEditModal = (banner: BannerDto) => {
        setEditingBanner(banner);
        setEditForm({
            title: banner.title || '',
            description: banner.description || '',
            orderIndex: banner.orderIndex,
            isActive: banner.isActive
        });
        setSelectedFile(null);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingBanner(null);
        setSelectedFile(null);
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
                <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    배너 등록
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[100px] text-center">이미지</TableHead>
                            <TableHead className="w-[80px] text-center">순서</TableHead>
                            <TableHead>제목 / 설명</TableHead>
                            <TableHead className="w-[100px] text-center">상태</TableHead>
                            <TableHead className="w-[120px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : banners && banners.length > 0 ? (
                            banners.sort((a, b) => a.orderIndex - b.orderIndex).map((banner) => (
                                <TableRow key={banner.bannerId} className="hover:bg-gray-50">
                                    <TableCell className="text-center p-2">
                                        <div className="w-20 h-10 relative mx-auto rounded overflow-hidden bg-gray-100 group">
                                            {banner.imageUrl ? (
                                                <img
                                                    src={getImageUrl(banner.imageUrl)}
                                                    alt={banner.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-600">
                                        {banner.orderIndex}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{banner.title}</span>
                                            {banner.description && (
                                                <span className="text-xs text-gray-500 truncate max-w-[300px]">
                                                    {banner.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {banner.isActive ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">활성</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200">비활성</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(banner)}
                                                className="text-gray-500 hover:text-primary hover:bg-blue-50 h-8 w-8 p-0"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(banner.bannerId)}
                                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-gray-500">
                                    등록된 배너가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>배너 등록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-title">제목 <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-title"
                                value={createForm.title}
                                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                placeholder="배너 제목"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-desc">설명</Label>
                            <Textarea
                                id="create-desc"
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                placeholder="배너 설명"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-file">이미지 <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setSelectedFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeCreateModal}>취소</Button>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !createForm.title || !selectedFile}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            등록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>배너 수정</DialogTitle>
                    </DialogHeader>
                    {editingBanner && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">제목</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-desc">설명</Label>
                                <Textarea
                                    id="edit-desc"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-order">표시 순서</Label>
                                    <Input
                                        id="edit-order"
                                        type="number"
                                        value={editForm.orderIndex}
                                        onChange={(e) => setEditForm({ ...editForm, orderIndex: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-active">상태</Label>
                                    <div className="flex items-center space-x-2 h-10">
                                        <Switch
                                            id="edit-active"
                                            checked={editForm.isActive}
                                            onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                                        />
                                        <Label htmlFor="edit-active" className="cursor-pointer">
                                            {editForm.isActive ? '활성' : '비활성'}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-file">이미지 (변경 시 선택)</Label>
                                <div className="space-y-2">
                                    {editingBanner.imageUrl && !selectedFile && (
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            현재 이미지 유지 중
                                        </div>
                                    )}
                                    <Input
                                        id="edit-file"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setSelectedFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEditModal}>취소</Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            수정
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
