'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, deleteUser } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserListPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    const handleSearch = () => {
        setDebouncedSearch(searchTerm);
        setPage(0);
    };

    const { data, isLoading } = useQuery({
        queryKey: ['users', page, roleFilter, debouncedSearch],
        queryFn: () => getUsers(page, 10, roleFilter, debouncedSearch)
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: 'ADMIN' | 'MEMBER' | 'USER' }) =>
            updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            Swal.fire('성공', '회원 권한이 수정되었습니다.', 'success');
        },
        onError: () => {
            Swal.fire('실패', '권한 수정에 실패했습니다.', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: number) => deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            Swal.fire('삭제됨', '회원이 삭제되었습니다.', 'success');
        },
        onError: () => {
            Swal.fire('실패', '사용자 삭제에 실패했습니다.', 'error');
        }
    });

    const handleDelete = (userId: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "이 작업은 되돌릴 수 없습니다!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(userId);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(0); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="권한 전체" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">전체</SelectItem>
                            <SelectItem value="USER">가입자 (USER)</SelectItem>
                            <SelectItem value="MEMBER">정회원 (MEMBER)</SelectItem>
                            <SelectItem value="ADMIN">관리자 (ADMIN)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-1 md:max-w-sm">
                    <Input
                        placeholder="이름 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} size="icon" variant="secondary">
                        <Search className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] pl-6">No</TableHead>
                            <TableHead>이름 / 이메일</TableHead>
                            <TableHead>파트</TableHead>
                            <TableHead className="w-[180px]">권한</TableHead>
                            <TableHead className="w-[150px]">가입일</TableHead>
                            <TableHead className="w-[100px] text-right pr-6">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((user, index) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="font-medium pl-6">
                                        {/* Calculate index based on page */}
                                        {(data.totalElements || 0) - (page * (data.size || 10)) - index}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{user.name}</span>
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.part || '-'}</TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(val) => updateRoleMutation.mutate({
                                                userId: user.userId,
                                                role: val as 'ADMIN' | 'MEMBER' | 'USER'
                                            })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USER">가입자</SelectItem>
                                                <SelectItem value="MEMBER">정회원</SelectItem>
                                                <SelectItem value="ADMIN">관리자</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(user.userId)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                                    검색 결과가 없습니다.
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
