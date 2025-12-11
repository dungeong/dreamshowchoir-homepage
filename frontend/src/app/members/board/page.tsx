'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getPosts, BoardPost } from '@/api/boardApi';
import { Button } from "@/components/ui/button";
import { Loader2, PenSquare, MessageSquare, ChevronLeft, ChevronRight, User } from 'lucide-react';

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

function BoardListContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 0;

    const [posts, setPosts] = useState<BoardPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    const fetchPosts = async (page: number) => {
        setLoading(true);
        try {
            const data = await getPosts(page, 10);
            setPosts(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">자유게시판</h1>
                    <p className="text-gray-500 mt-1">단원들의 자유로운 소통 공간입니다.</p>
                </div>
                <Link href="/members/board/write">
                    <Button>
                        <PenSquare className="w-4 h-4 mr-2" />
                        글쓰기
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 w-20 text-center">번호</th>
                                        <th className="px-6 py-4">제목</th>
                                        <th className="px-6 py-4 w-32 text-center">작성자</th>
                                        <th className="px-6 py-4 w-32 text-center hidden md:table-cell">작성일</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {posts.map((post) => (
                                        <tr
                                            key={post.postId}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/members/board/${post.postId}?page=${currentPage}`)}
                                        >
                                            <td className="px-6 py-4 text-center text-gray-500">{post.postId}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 hover:text-primary transition-colors">
                                                        {post.title}
                                                    </span>
                                                    {post.commentCount > 0 && (
                                                        <span className="flex items-center text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                                            <MessageSquare className="w-3 h-3 mr-1" />
                                                            {post.commentCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {post.authorName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500 hidden md:table-cell">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="flex items-center px-4 font-medium text-sm">
                                    {currentPage + 1} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        등록된 게시글이 없습니다.
                    </div>
                )}
            </div>
        </div >
    );
}

export default function BoardListPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <BoardListContent />
        </Suspense>
    );
}
