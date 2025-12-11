'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminInquiries, replyInquiry, Inquiry } from '@/api/inquiryApi';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageCircle } from 'lucide-react';

export default function InquiryManagementPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('PENDING'); // Default to PENDING
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch Inquiries
    const { data, isLoading } = useQuery({
        queryKey: ['admin-inquiries', page, statusFilter],
        queryFn: () => getAdminInquiries(page, 10, statusFilter),
    });

    // Reply Mutation
    const replyMutation = useMutation({
        mutationFn: async () => {
            if (!selectedInquiry) return;
            await replyInquiry(selectedInquiry.inquiryId, replyText);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
            setIsModalOpen(false);
            setReplyText('');
            Swal.fire('완료', '답변이 등록되었습니다.', 'success');
        },
        onError: (error) => {
            console.error(error);
            Swal.fire('오류', '답변 등록에 실패했습니다.', 'error');
        }
    });

    const openReplyModal = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setReplyText(inquiry.answer || '');
        setIsModalOpen(true);
    };

    const handleReply = () => {
        if (!replyText.trim()) {
            Swal.fire('알림', '답변 내용을 입력해주세요.', 'warning');
            return;
        }
        replyMutation.mutate();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">1:1 문의 관리</h1>

            {/* Filter Tabs - Removed ALL as requested */}
            <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }} className="w-full">
                <TabsList>
                    <TabsTrigger value="PENDING">대기중</TabsTrigger>
                    <TabsTrigger value="ANSWERED">답변완료</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* List Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[100px] text-center">상태</TableHead>
                            <TableHead className="w-[200px]">작성자</TableHead>
                            <TableHead>문의 내용</TableHead>
                            <TableHead className="w-[150px]">등록일</TableHead>
                            <TableHead className="w-[100px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                                </TableCell>
                            </TableRow>
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((inquiry) => (
                                <TableRow key={inquiry.inquiryId} className="hover:bg-gray-50">
                                    <TableCell className="text-center">
                                        <Badge variant={inquiry.status === 'ANSWERED' ? 'secondary' : 'default'}
                                            className={inquiry.status === 'ANSWERED'
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                            }
                                        >
                                            {inquiry.status === 'ANSWERED' ? '답변완료' : '대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{inquiry.name}</span>
                                            <span className="text-xs text-gray-500">{inquiry.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[400px] truncate text-gray-600 font-medium" title={inquiry.content}>
                                            {inquiry.content}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {format(new Date(inquiry.createdAt), 'yyyy-MM-dd')}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openReplyModal(inquiry)}
                                            className="text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                        >
                                            {inquiry.status === 'ANSWERED' ? '답변수정' : '답변하기'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-gray-500">
                                    문의 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination (Simple) */}
            <div className="flex justify-center gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    이전
                </Button>
                <div className="flex items-center px-4 text-sm text-gray-600">
                    Page {page + 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={data ? (page + 1) >= data.totalPages : true}
                >
                    다음
                </Button>
            </div>

            {/* Reply Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-indigo-600" />
                            문의 답변하기
                        </DialogTitle>
                        <DialogDescription>
                            사용자의 문의 내용을 확인하고 답변을 등록합니다.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInquiry && (
                        <div className="space-y-6 py-4">
                            {/* Read-Only User Question */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                                <div className="flex justify-between text-sm text-gray-500 border-b border-gray-200 pb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-700">{selectedInquiry.name}</span>
                                        <span className="text-xs">{selectedInquiry.email}</span>
                                    </div>
                                    <span>{format(new Date(selectedInquiry.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                                        {selectedInquiry.content}
                                    </div>
                                </div>
                            </div>

                            {/* Answer Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">답변 내용</label>
                                <Textarea
                                    className="min-h-[200px] resize-none focus:ring-indigo-500"
                                    placeholder="답변을 입력하세요..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
                        <Button
                            onClick={handleReply}
                            disabled={replyMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {replyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            답변 등록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
