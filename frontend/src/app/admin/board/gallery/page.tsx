'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getGalleries,
    getGalleryDetail,
    createGallery,
    updateGallery,
    deleteGallery,
    GalleryItem,
    GalleryRequestDto,
    GalleryType,
    GalleryMediaDto
} from '@/api/adminBoardApi';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Swal from 'sweetalert2';
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Calendar, User } from 'lucide-react';

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

const GalleryTypes: { value: GalleryType; label: string }[] = [
    { value: 'REGULAR', label: '정기공연' },
    { value: 'IRREGULAR', label: '비정기공연' },
    { value: 'EVENT', label: '주요행사' },
];

export default function GalleryManagementPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [selectedType, setSelectedType] = useState<GalleryType | 'ALL'>('ALL');

    // Modal & Selection State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<GalleryType>('REGULAR');
    const [files, setFiles] = useState<File[]>([]);
    const [existingMedia, setExistingMedia] = useState<GalleryMediaDto[]>([]);

    // List Query
    const { data, isLoading } = useQuery({
        queryKey: ['admin-gallery', page, selectedType],
        queryFn: () => getGalleries(page, 12, selectedType === 'ALL' ? undefined : selectedType)
    });

    // Detail Query (Enabled only when selectedGalleryId is set)
    const { data: detailData, isLoading: isDetailLoading } = useQuery({
        queryKey: ['admin-gallery-detail', selectedGalleryId],
        queryFn: () => getGalleryDetail(selectedGalleryId!),
        enabled: !!selectedGalleryId,
    });

    // Populate Form on Detail Data Load
    useEffect(() => {
        if (selectedGalleryId && detailData) {
            setTitle(detailData.title);
            setDescription(detailData.description);
            setType(detailData.type);
            setExistingMedia(detailData.mediaList || []);
            setFiles([]); // Reset new files
        }
    }, [detailData, selectedGalleryId]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('REGULAR');
        setFiles([]);
        setExistingMedia([]);
        setSelectedGalleryId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (id: number) => {
        resetForm(); // Clear request first
        setSelectedGalleryId(id);
        setIsModalOpen(true);
    };

    const createMutation = useMutation({
        mutationFn: (data: { dto: GalleryRequestDto, files: File[] }) => createGallery(data.dto, data.files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
            setIsModalOpen(false);
            Swal.fire('성공', '갤러리가 등록되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '갤러리 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number, dto: GalleryRequestDto, files?: File[] }) => updateGallery(data.id, data.dto, data.files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
            if (selectedGalleryId) {
                queryClient.invalidateQueries({ queryKey: ['admin-gallery-detail', selectedGalleryId] });
            }
            setIsModalOpen(false);
            Swal.fire('성공', '갤러리가 수정되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '갤러리 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteGallery(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
            Swal.fire('성공', '갤러리가 삭제되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '갤러리 삭제에 실패했습니다.', 'error')
    });

    const handleSubmit = () => {
        if (!title.trim()) {
            Swal.fire('경고', '제목을 입력해주세요.', 'warning');
            return;
        }

        const dto: GalleryRequestDto = { title, type, description };

        if (selectedGalleryId) {
            updateMutation.mutate({ id: selectedGalleryId, dto, files: files.length > 0 ? files : undefined });
        } else {
            if (files.length === 0) {
                Swal.fire('경고', '이미지를 최소 1개 이상 업로드해주세요.', 'warning');
                return;
            }
            createMutation.mutate({ dto, files });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 갤러리는 복구할 수 없습니다.",
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

    const getImageUrl = (media: GalleryMediaDto) => {
        if (media.fileUrl) return media.fileUrl;
        if (media.fileKey) {
            if (media.fileKey.startsWith('http')) return media.fileKey;
            // Ensure slash between base and key
            const key = media.fileKey.startsWith('/') ? media.fileKey : `/${media.fileKey}`;
            return `${IMAGE_BASE_URL}${key}`;
        }
        return '';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">갤러리 관리</h1>
                    <Select
                        value={selectedType}
                        onValueChange={(val) => { setSelectedType(val as any); setPage(0); }}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">전체</SelectItem>
                            {GalleryTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    갤러리 등록
                </Button>
            </div>

            {isLoading ? (
                <div className="h-60 flex justify-center items-center">
                    <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                </div>
            ) : data?.content && data.content.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.content.map((item) => {
                        const thumbnailUrl = item.thumbnailUrl;

                        return (
                            <div key={item.galleryId} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    {thumbnailUrl ? (
                                        <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" onClick={() => handleOpenEdit(item.galleryId)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleDelete(item.galleryId)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">
                                        {GalleryTypes.find(t => t.value === item.type)?.label}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate mb-1">{item.title}</h3>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                        <div className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {item.createdAt.replace('T', ' ')}
                                        </div>
                                        {item.authorName && (
                                            <div className="flex items-center">
                                                <User className="w-3 h-3 mr-1" />
                                                {item.authorName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-60 flex justify-center items-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    등록된 갤러리가 없습니다.
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
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
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedGalleryId ? '갤러리 수정' : '갤러리 등록'}</DialogTitle>
                    </DialogHeader>
                    {selectedGalleryId && isDetailLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">제목</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="제목을 입력하세요"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">분류</label>
                                <Select value={type} onValueChange={(val: GalleryType) => setType(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GalleryTypes.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">설명</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="갤러리 설명을 입력하세요"
                                    className="h-24 resize-none"
                                />
                            </div>

                            {/* Existing Images */}
                            {existingMedia.length > 0 && (
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">등록된 이미지</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {existingMedia.map((media) => (
                                            <div key={media.mediaId} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={getImageUrl(media)}
                                                    alt={media.fileName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">
                                    {selectedGalleryId ? '추가 이미지 업로드' : '이미지 업로드'}
                                </label>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const selectedFiles = Array.from(e.target.files);
                                            const invalidFiles = selectedFiles.filter(f => f.size > 300 * 1024 * 1024);

                                            if (invalidFiles.length > 0) {
                                                Swal.fire('오류', '300MB를 초과하는 파일이 존재합니다.', 'error');
                                                e.target.value = ''; // Reset input
                                                setFiles([]);
                                                return;
                                            }
                                            setFiles(selectedFiles);
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500">
                                    {selectedGalleryId ? '새 파일을 선택하면 기존 갤러리에 추가됩니다.' : '최소 1개의 파일을 선택해주세요.'}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending || (selectedGalleryId !== null && isDetailLoading)}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            )}
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
