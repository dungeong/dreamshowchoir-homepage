'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getHistory,
    createHistory,
    updateHistory,
    deleteHistory,
    HistoryItem
} from '@/api/historyApi';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from 'sweetalert2';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

export default function HistoryManagementPage() {
    const queryClient = useQueryClient();

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    // Form State (Create)
    const [createYear, setCreateYear] = useState<string>(new Date().getFullYear().toString());
    const [createMonth, setCreateMonth] = useState<string>('1');
    const [createContent, setCreateContent] = useState('');

    // Form State (Edit)
    const [editYear, setEditYear] = useState<string>('');
    const [editMonth, setEditMonth] = useState<string>('');
    const [editContent, setEditContent] = useState('');

    // --- Query ---
    const { data: historyList, isLoading } = useQuery({
        queryKey: ['history'],
        queryFn: getHistory,
        select: (data) => {
            // Client-side sorting: Year Desc, then Month Desc
            return [...data].sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
        }
    });

    // --- Mutations ---
    const createMutation = useMutation({
        mutationFn: async () => {
            await createHistory({
                year: parseInt(createYear),
                month: parseInt(createMonth),
                content: createContent
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
            Swal.fire('성공', '연혁이 등록되었습니다.', 'success');
            setIsCreateOpen(false);
            resetCreateForm();
        },
        onError: () => Swal.fire('실패', '연혁 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!selectedItem) return;
            await updateHistory(selectedItem.historyId, {
                year: parseInt(editYear),
                month: parseInt(editMonth),
                content: editContent
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
            Swal.fire('성공', '연혁이 수정되었습니다.', 'success');
            setIsEditOpen(false);
        },
        onError: () => Swal.fire('실패', '연혁 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteHistory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
            Swal.fire('성공', '연혁이 삭제되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '연혁 삭제에 실패했습니다.', 'error')
    });

    // --- Handlers ---
    const resetCreateForm = () => {
        setCreateYear(new Date().getFullYear().toString());
        setCreateMonth('1');
        setCreateContent('');
    };

    const handleOpenEdit = (item: HistoryItem) => {
        setSelectedItem(item);
        setEditYear(item.year.toString());
        setEditMonth(item.month.toString());
        setEditContent(item.content);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제된 연혁은 복구할 수 없습니다.",
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
                <h1 className="text-2xl font-bold text-gray-900">연혁 관리</h1>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    연혁 등록
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">No</TableHead>
                            <TableHead className="w-[120px] text-center">날짜</TableHead>
                            <TableHead>내용</TableHead>
                            <TableHead className="w-[150px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : historyList && historyList.length > 0 ? (
                            historyList.map((item, index) => (
                                <TableRow key={item.historyId} className="hover:bg-gray-50">
                                    <TableCell className="text-center font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="text-center font-semibold text-gray-700">
                                        {item.year}.{item.month.toString().padStart(2, '0')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-gray-900 whitespace-pre-wrap">{item.content}</span>
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
                                                onClick={() => handleDelete(item.historyId)}
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
                                <TableCell colSpan={4} className="h-40 text-center text-gray-500">
                                    등록된 연혁이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>연혁 등록</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-year">년도 (Year) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="create-year"
                                    type="number"
                                    value={createYear}
                                    onChange={(e) => setCreateYear(e.target.value)}
                                    placeholder="2024"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-month">월 (Month) <span className="text-red-500">*</span></Label>
                                <Select value={createMonth} onValueChange={setCreateMonth}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="월 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={m.toString()}>{m}월</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-content">내용 <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="create-content"
                                value={createContent}
                                onChange={(e) => setCreateContent(e.target.value)}
                                placeholder="연혁 내용을 입력하세요"
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !createYear || !createMonth || !createContent}
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
                        <DialogTitle>연혁 수정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-year">년도</Label>
                                <Input
                                    id="edit-year"
                                    type="number"
                                    value={editYear}
                                    onChange={(e) => setEditYear(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-month">월</Label>
                                <Select value={editMonth} onValueChange={setEditMonth}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="월 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={m.toString()}>{m}월</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-content">내용</Label>
                            <Textarea
                                id="edit-content"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>취소</Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending || !editYear || !editMonth || !editContent}
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
