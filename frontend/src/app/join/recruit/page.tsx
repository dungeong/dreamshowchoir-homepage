'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getContent } from '@/api/contentApi';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import 'react-quill-new/dist/quill.snow.css';
import { useAuthStore } from '@/store/authStore';

function RecruitContent() {
    const router = useRouter();
    const { data: content, isLoading, isError } = useQuery({
        queryKey: ['content', 'RECRUIT_GUIDE'],
        queryFn: () => getContent('RECRUIT_GUIDE'),
    });

    const handleApply = () => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            router.push('/join/application');
        } else {
            Swal.fire({
                title: '로그인이 필요합니다',
                text: "입단 신청은 로그인 후 가능합니다. 로그인 페이지로 이동하시겠습니까?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '네, 로그인합니다',
                cancelButtonText: '아니오'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/login?returnUrl=/join/application');
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-40">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    if (isError || !content) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">내용을 불러올 수 없습니다.</h2>
                <p className="text-gray-600">잠시 후 다시 시도해주시거나 관리자에게 문의해주세요.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Content Body */}
            <div className="bg-white p-4">
                {/*  Use a more constrained width for the text content itself if needed, or keep it full width */}
                <div className="ql-snow">
                    <div
                        className="ql-editor prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-primary prose-a:text-blue-600 !p-0 text-center !h-auto !overflow-visible"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-8 border-t border-gray-100">
                <Button
                    size="lg"
                    className="w-full md:w-auto text-xl font-bold px-16 py-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-gradient-to-r from-primary to-orange-400 text-white border-0"
                    onClick={handleApply}
                >
                    입단 신청하기
                </Button>
            </div>
        </div>
    );
}

export default function RecruitPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <RecruitContent />
        </Suspense>
    );
}
