'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getInquiryDetail, Inquiry } from '@/api/inquiryApi';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Lock, Calendar, User } from 'lucide-react';
import { getMyProfile } from '@/api/memberApi';

function InquiryDetailContent() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getInquiryDetail(id);
                setInquiry(data);
            } catch (err: any) {
                console.error("Failed to fetch inquiry detail", err);
                if (err.response && err.response.status === 403) {
                    setError('비공개 글입니다. 작성자만 확인할 수 있습니다.');
                } else {
                    setError('문의 내용을 불러올 수 없습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetail();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl mb-6 inline-block">
                    <Lock className="w-10 h-10 mx-auto mb-2" />
                    <p>{error}</p>
                </div>
                <div>
                    <Button onClick={() => router.back()}>돌아가기</Button>
                </div>
            </div>
        );
    }

    if (!inquiry) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-8 px-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
            </Button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {inquiry.status === 'ANSWERED' ? (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">답변완료</span>
                            ) : (
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">대기중</span>
                            )}
                            {/* {inquiry.isSecret && <Lock className="w-4 h-4 text-gray-400" />} */}
                        </div>
                        {/* Title removed, using content truncated or just header */}
                        <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{inquiry.content}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{inquiry.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 min-h-[200px]">
                    <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                        {inquiry.content}
                    </div>
                </div>

                {/* Answer Section */}
                {inquiry.answer && (
                    <div className="bg-blue-50/50 p-8 border-t border-blue-100">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded text-sm shrink-0">
                                답변
                            </div>
                            <div className="space-y-2 w-full">
                                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                                    {inquiry.answer}
                                </div>
                                {inquiry.answeredAt && (
                                    <p className="text-xs text-gray-400 text-right pt-2">
                                        답변일: {new Date(inquiry.answeredAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InquiryDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <InquiryDetailContent />
        </Suspense>
    );
}
