'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDonations,
    updateDonationStatus,
    DonationStatus
} from '@/api/adminApi';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';
import { Loader2, Star, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function DonationManagementPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [activeTab, setActiveTab] = useState<DonationStatus>('PENDING');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-donations', page, activeTab],
        queryFn: () => getDonations(page, 10, activeTab)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: DonationStatus }) =>
            updateDonationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-donations'] });
            Swal.fire({
                title: '성공',
                text: '상태가 변경되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', '상태 변경에 실패했습니다.', 'error')
    });

    const handleStatusChange = (id: number, newStatus: DonationStatus, confirmMessage?: string) => {
        if (confirmMessage) {
            Swal.fire({
                title: '확인',
                text: confirmMessage,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '확인',
                cancelButtonText: '취소'
            }).then((result) => {
                if (result.isConfirmed) {
                    statusMutation.mutate({ id, status: newStatus });
                }
            });
        } else {
            statusMutation.mutate({ id, status: newStatus });
        }
    };

    const tabs: { label: string; value: DonationStatus }[] = [
        { label: '대기', value: 'PENDING' },
        { label: '완료', value: 'COMPLETED' },
        { label: '실패/취소', value: 'FAILED' },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    const getStatusBadge = (status: DonationStatus) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">대기</Badge>;
            case 'COMPLETED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">완료</Badge>;
            case 'FAILED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">실패/취소</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">후원 관리</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => {
                            setActiveTab(tab.value);
                            setPage(0); // Reset page on tab change
                        }}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.value
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">No</TableHead>
                            <TableHead>후원자 정보</TableHead>
                            <TableHead className="w-[120px] text-center">유형</TableHead>
                            <TableHead className="w-[150px] text-right">금액</TableHead>
                            <TableHead className="w-[150px] text-center">신청일</TableHead>
                            <TableHead className="w-[100px] text-center">상태</TableHead>
                            <TableHead className="w-[200px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((donation, index) => (
                                <TableRow key={donation.donationId} className="hover:bg-gray-50">
                                    <TableCell className="text-center font-medium">
                                        {(data.totalElements || 0) - (page * (data.size || 10)) - index}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {donation.donorName ? (
                                                <>
                                                    <span className="font-medium text-gray-900">{donation.donorName}</span>
                                                    <span className="text-xs text-gray-500">{donation.donorEmail}</span>
                                                    <span className="text-xs text-gray-400">{donation.donorPhone}</span>
                                                </>
                                            ) : (
                                                <span className="font-medium text-gray-400 italic">탈퇴한 계정</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {donation.type === 'REGULAR' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                                <Star className="w-3 h-3 fill-indigo-800" />
                                                정기후원
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                일시후원
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-900">
                                        {formatCurrency(donation.amount)}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500 text-sm">
                                        {new Date(donation.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(donation.status)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            {donation.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleStatusChange(donation.donationId, 'COMPLETED')}
                                                    >
                                                        승인
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8"
                                                        onClick={() => handleStatusChange(donation.donationId, 'FAILED')}
                                                    >
                                                        거절
                                                    </Button>
                                                </>
                                            )}
                                            {donation.status === 'COMPLETED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleStatusChange(donation.donationId, 'FAILED', '정말 이 후원을 취소/실패 처리하시겠습니까?')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    취소
                                                </Button>
                                            )}
                                            {donation.status === 'FAILED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-green-200 text-green-600 hover:bg-green-50"
                                                    onClick={() => handleStatusChange(donation.donationId, 'COMPLETED', '이 후원을 다시 완료 상태로 복구하시겠습니까?')}
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                    복구
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                                    데이터가 없습니다.
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
        </div>
    );
}
