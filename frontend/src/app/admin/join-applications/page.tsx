'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJoinApplications, updateJoinStatus, JoinApplication } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, User } from 'lucide-react';
import Swal from 'sweetalert2';

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

export default function JoinApplicationPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);

    const { data, isLoading } = useQuery({
        queryKey: ['join-applications', page],
        queryFn: () => getJoinApplications(page, 10)
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ joinId, status }: { joinId: number; status: 'APPROVED' | 'REJECTED' }) =>
            updateJoinStatus(joinId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['join-applications'] });
            Swal.fire('처리완료', '신청이 처리되었습니다.', 'success');
        },
        onError: () => {
            Swal.fire('실패', '처리에 실패했습니다.', 'error');
        }
    });

    const handleAction = (joinId: number, status: 'APPROVED' | 'REJECTED') => {
        Swal.fire({
            title: status === 'APPROVED' ? '가입을 승인하시겠습니까?' : '가입을 거절하시겠습니까?',
            icon: status === 'APPROVED' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'APPROVED' ? '#3085d6' : '#d33',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: status === 'APPROVED' ? '승인' : '거절',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                updateStatusMutation.mutate({ joinId, status });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">가입 신청 관리</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[60px] pl-6">No</TableHead>
                            <TableHead className="w-[80px]">프로필</TableHead>
                            <TableHead className="w-[200px]">신청자 정보</TableHead>
                            <TableHead className="w-[100px]">파트</TableHead>
                            <TableHead>상세 내용</TableHead>
                            <TableHead className="w-[120px]">신청일</TableHead>
                            <TableHead className="w-[160px] text-right pr-6">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((app, index) => (
                                <TableRow key={app.joinId}>
                                    <TableCell className="font-medium pl-6">
                                        {(data.totalElements || 0) - (page * (data.size || 10)) - index}
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                            {app.profileImageKey ? (
                                                <img
                                                    src={app.profileImageKey.startsWith('http') ? app.profileImageKey : `${IMAGE_BASE_URL}${app.profileImageKey}`}
                                                    alt={app.userName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{app.userName}</span>
                                            <span className="text-xs text-gray-500">{app.userEmail}</span>
                                            <span className="text-xs text-gray-400">{app.userPhoneNumber || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded text-xs border border-gray-200">
                                            {app.part}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2 py-2">
                                            {app.hashTags && (
                                                <div className="text-primary font-bold text-base">
                                                    {app.hashTags}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                                                {app.myDream && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-semibold text-gray-500 shrink-0 bg-gray-100 px-2 py-0.5 rounded text-xs">나의 꿈</span>
                                                        <span>{app.myDream}</span>
                                                    </div>
                                                )}
                                                {app.interests && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-semibold text-gray-500 shrink-0 bg-gray-100 px-2 py-0.5 rounded text-xs">관심사</span>
                                                        <span>{app.interests}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => handleAction(app.joinId, 'APPROVED')}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                승인
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleAction(app.joinId, 'REJECTED')}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                거절
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                                    대기 중인 가입 신청이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center px-4 font-medium text-sm">
                            {page + 1} / {data.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                            disabled={page === data.totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
