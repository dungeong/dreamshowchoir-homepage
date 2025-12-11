'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFaqList } from '@/api/faqApi';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, HelpCircle } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

function FaqContent() {
    const { data: faqs, isLoading, isError } = useQuery({
        queryKey: ['faqs'],
        queryFn: getFaqList,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-20 text-red-500">
                데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">자주 묻는 질문</h1>
                <p className="text-gray-500">드림쇼콰이어에 대해 자주 묻는 질문들을 모았습니다.</p>
            </div>

            {faqs && faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={faq.faqId} value={`item-${index}`} className="border-b border-gray-100 last:border-0">
                            <AccordionTrigger className="hover:no-underline hover:text-primary text-left py-4">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                                    <span className="font-medium text-lg text-gray-800">{faq.question}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6 pl-11 pr-4 bg-gray-50/50 rounded-lg mb-2">
                                {/* Use ql-editor/ql-snow for Quill compatibility, plus prose for base styles */}
                                <div className="ql-snow">
                                    <div
                                        className="ql-editor prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 !p-0 !min-h-0"
                                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    등록된 FAQ가 없습니다.
                </div>
            )}
        </div>
    );
}

export default function FaqPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <FaqContent />
        </Suspense>
    );
}
