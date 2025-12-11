'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getContent } from '@/api/contentApi';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

function DonationGuideContent() {
    const { data: content, isLoading, isError } = useQuery({
        queryKey: ['content', 'DONATION_GUIDE'],
        queryFn: () => getContent('DONATION_GUIDE'),
    });

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
                <div className="ql-snow">
                    <div
                        className="ql-editor prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-primary prose-a:text-blue-600 !p-0 text-center !h-auto !overflow-visible"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-8 border-t border-gray-100">
                <Link href="/join/donate">
                    <Button
                        size="lg"
                        className="w-full md:w-auto text-xl font-bold px-16 py-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-gradient-to-r from-primary to-orange-400 text-white border-0"
                    >
                        후원 신청하기
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function DonationGuidePage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <DonationGuideContent />
        </Suspense>
    );
}
