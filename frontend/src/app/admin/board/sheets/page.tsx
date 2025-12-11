'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getSheets,
    uploadSheet,
    deleteSheet
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import Swal from 'sweetalert2';
import { Loader2, Plus, Trash2, FileText, Download } from 'lucide-react';

export default function SheetManagementPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-sheets', page],
        queryFn: () => getSheets(page, 10)
    });

    const handleOpenUpload = () => {
        setFile(null);
        setIsModalOpen(true);
    };

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadSheet(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sheets'] });
            setIsModalOpen(false);
            Swal.fire('성공', '악보가 등록되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '악보 등록에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteSheet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sheets'] });
            Swal.fire('성공', '악보가 삭제되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '악보 삭제에 실패했습니다.', 'error')
    });

    const handleSubmit = () => {
        if (!file) {
            Swal.fire('경고', '파일을 선택해주세요.', 'warning');
            return;
        }
        uploadMutation.mutate(file);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 악보는 복구할 수 없습니다.",
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

    const handleDownload = (fileUrl: string, fileName: string) => {
        const encodedUrl = encodeURIComponent(fileUrl);
        const encodedName = encodeURIComponent(fileName);
        const downloadUrl = `/api/download?url=${encodedUrl}&filename=${encodedName}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">악보 관리</h1>
                <Button onClick={handleOpenUpload}>
                    <Plus className="w-4 h-4 mr-2" />
                    악보 등록
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">No</TableHead>
                            <TableHead>파일명</TableHead>
                            <TableHead className="w-[150px] text-center">등록일</TableHead>
                            <TableHead className="w-[150px] text-center">다운로드</TableHead>
                            <TableHead className="w-[100px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((sheet, index) => (
                                <TableRow key={sheet.sheetId} className="hover:bg-gray-50">
                                    <TableCell className="text-center font-medium">
                                        {(data.totalElements || 0) - (page * (data.pageSize || 10)) - index}
                                    </TableCell>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        {sheet.fileName}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500">
                                        {new Date(sheet.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(sheet.fileKey, sheet.fileName)}
                                            className="rounded-full hover:bg-gray-100 text-gray-600"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(sheet.sheetId)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-gray-500">
                                    등록된 악보가 없습니다.
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>악보 등록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">파일 선택</label>
                            <Input
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const selectedFile = e.target.files[0];
                                        if (selectedFile.size > 300 * 1024 * 1024) {
                                            Swal.fire('오류', '파일 크기는 300MB를 초과할 수 없습니다.', 'error');
                                            e.target.value = ''; // Reset input
                                            setFile(null);
                                            return;
                                        }
                                        setFile(selectedFile);
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-500">PDF 등의 악보 파일을 업로드해주세요.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
                        <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
                            {uploadMutation.isPending && (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            )}
                            업로드
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
