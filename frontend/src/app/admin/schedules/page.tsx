
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import {
    Plus, Pencil, Trash2, Loader2, Calendar, MapPin, AlignLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    ScheduleDto,
    ScheduleCreateDto,
    ScheduleUpdateDto,
    ScheduleType
} from '@/api/scheduleApi';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from 'date-fns';

export default function ScheduleManagementPage() {
    const queryClient = useQueryClient();

    // State
    const [activeTab, setActiveTab] = useState<ScheduleType>('practice');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleDto | null>(null);

    // Derived State
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-indexed for backend

    // Form
    const [formData, setFormData] = useState<ScheduleCreateDto>({
        summary: '',
        location: '',
        description: '',
        start: '',
        end: ''
    });

    // Query
    const { data: schedules, isLoading } = useQuery({
        queryKey: ['schedules', activeTab, year, month],
        queryFn: () => getSchedules(activeTab, year, month),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (dto: ScheduleCreateDto) => {
            const isoDto = {
                ...dto,
                start: new Date(dto.start).toISOString(),
                end: new Date(dto.end).toISOString()
            };
            return createSchedule(activeTab, isoDto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules', activeTab] });
            closeCreateModal();
            Swal.fire({
                title: '성공',
                text: '일정이 등록되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', '일정 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: () => {
            if (!editingSchedule) throw new Error("수정할 일정이 없습니다.");
            const isoDto = {
                ...formData,
                start: new Date(formData.start).toISOString(),
                end: new Date(formData.end).toISOString()
            };
            return updateSchedule(activeTab, editingSchedule.id, isoDto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules', activeTab] });
            closeEditModal();
            Swal.fire({
                title: '성공',
                text: '일정이 수정되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', '일정 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSchedule(activeTab, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules', activeTab] });
            Swal.fire({
                title: '삭제됨',
                text: '일정이 삭제되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', '일정 삭제에 실패했습니다.', 'error')
    });

    // Handlers
    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDelete = (id: string) => {
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
        setFormData({
            summary: '',
            location: '',
            description: '',
            start: '',
            end: ''
        });
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const openEditModal = (schedule: ScheduleDto) => {
        setEditingSchedule(schedule);
        const formatForInput = (iso: string) => {
            if (!iso) return '';
            try {
                const date = new Date(iso);
                return format(date, "yyyy-MM-dd'T'HH:mm");
            } catch (e) {
                return '';
            }
        };

        setFormData({
            summary: schedule.summary,
            location: schedule.location || '',
            description: schedule.description || '',
            start: formatForInput(schedule.start),
            end: formatForInput(schedule.end)
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingSchedule(null);
    };

    const formatDisplayDate = (start: string, end: string) => {
        try {
            const s = new Date(start);
            const e = new Date(end);
            return `${format(s, 'yyyy.MM.dd HH:mm')} ~ ${format(e, 'HH:mm')}`;
        } catch {
            return start;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
                <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    일정 등록
                </Button>
            </div>

            <Tabs
                defaultValue="practice"
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as ScheduleType)}
                className="w-full"
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="practice">연습 일정</TabsTrigger>
                        <TabsTrigger value="performance">공연 일정</TabsTrigger>
                    </TabsList>

                    {/* Month Navigation */}
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                        <span className="text-lg font-bold text-gray-900 min-w-[100px] text-center">
                            {year}. {month.toString().padStart(2, '0')}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToday} className="ml-2">
                            Today
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[250px]">일시</TableHead>
                                <TableHead>제목</TableHead>
                                <TableHead className="w-[200px]">장소</TableHead>
                                <TableHead className="w-[100px] text-center">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : Array.isArray(schedules) && schedules.length > 0 ? (
                                // Sort desc (Latest first) and avoid mutation
                                [...schedules].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
                                    .map((schedule) => (
                                        <TableRow key={schedule.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {formatDisplayDate(schedule.start, schedule.end)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 text-lg">{schedule.summary}</span>
                                                    {schedule.description && (
                                                        <span className="text-xs text-gray-500 truncate max-w-[400px]">
                                                            {schedule.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {schedule.location && (
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        {schedule.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(schedule)}
                                                        className="text-gray-500 hover:text-primary hover:bg-blue-50 h-8 w-8 p-0"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(schedule.id)}
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
                                    <TableCell colSpan={4} className="h-40 text-center text-gray-500">
                                        등록된 일정이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>

            {/* Create/Edit Component - Shared Logic UI */}
            <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
                if (!open) {
                    closeCreateModal();
                    closeEditModal();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditModalOpen ? '일정 수정' : '일정 등록'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="summary">제목 <span className="text-red-500">*</span></Label>
                            <Input
                                id="summary"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="일정 제목 (예: 정기연습)"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start">시작 일시 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="start"
                                    type="datetime-local"
                                    value={formData.start}
                                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end">종료 일시 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="end"
                                    type="datetime-local"
                                    value={formData.end}
                                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">장소</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="장소 입력"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">설명</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="상세 내용"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { closeCreateModal(); closeEditModal(); }}>취소</Button>
                        <Button
                            onClick={() => {
                                if (isEditModalOpen) updateMutation.mutate();
                                else createMutation.mutate(formData);
                            }}
                            disabled={createMutation.isPending || updateMutation.isPending || !formData.summary || !formData.start || !formData.end}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditModalOpen ? '수정' : '등록'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
