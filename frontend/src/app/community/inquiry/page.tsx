'use client';

import { Suspense, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { submitInquiry } from '@/api/inquiryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const inquirySchema = z.object({
    name: z.string().min(1, '이름을 입력해주세요.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    content: z.string().min(1, '내용을 입력해주세요.').max(1000, '1000자 이내로 입력해주세요.'),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

function InquiryForm() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryFormValues>({
        resolver: zodResolver(inquirySchema)
    });

    const onSubmit = useCallback(async (data: InquiryFormValues) => {
        if (!executeRecaptcha) {
            Swal.fire({
                icon: 'warning',
                title: '로딩 중',
                text: '보안 확인을 위해 잠시만 기다려주세요.',
            });
            return;
        }

        setSubmitting(true);
        try {
            // 1. Get reCAPTCHA Token
            const token = await executeRecaptcha('inquiry_submit');

            if (!token) {
                throw new Error('reCAPTCHA verifying failed');
            }

            // 2. Submit Authorization
            await submitInquiry({
                ...data,
                recaptchaToken: token
            });

            await Swal.fire({
                icon: 'success',
                title: '문의 접수 완료',
                text: '담당자 확인 후 빠르게 답변 드리겠습니다.',
                confirmButtonColor: '#000000',
            });
            reset();
        } catch (error) {
            console.error("Failed to submit inquiry", error);
            Swal.fire({
                icon: 'error',
                title: '오류 발생',
                text: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                confirmButtonColor: '#d33',
            });
        } finally {
            setSubmitting(false);
        }
    }, [executeRecaptcha, reset]);

    return (
        <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">문의하기</h1>
                <p className="text-gray-600">
                    궁금하신 점을 남겨주시면 친절하게 답변해드리겠습니다.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">이름</label>
                    <Input
                        id="name"
                        placeholder="이름을 입력하세요"
                        {...register('name')}
                        disabled={submitting}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="답변 받으실 이메일을 입력하세요"
                        {...register('email')}
                        disabled={submitting}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-gray-700">문의 내용</label>
                    <Textarea
                        id="content"
                        placeholder="문의하실 내용을 자유롭게 적어주세요"
                        className="min-h-[200px] resize-none"
                        {...register('content')}
                        disabled={submitting}
                    />
                    {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            전송 중...
                        </>
                    ) : (
                        '문의하기'
                    )}
                </Button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-4">
                This site is protected by reCAPTCHA and the Google
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mx-1">Privacy Policy</a> and
                <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mx-1">Terms of Service</a> apply.
            </p>
        </div>
    );
}

export default function InquiryPage() {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        console.error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined in environment variables.");
        return (
            <div className="flex justify-center items-center h-[50vh] text-red-500 bg-red-50 rounded-xl p-8 max-w-lg mx-auto border border-red-100">
                <div>
                    <h3 className="font-bold text-lg mb-2">설정 오류</h3>
                    <p>reCAPTCHA Site Key가 설정되지 않았습니다.</p>
                    <p className="text-sm mt-2 text-gray-600">관리자에게 문의해주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
            <div className="px-4 py-8">
                <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
                    <InquiryForm />
                </Suspense>
            </div>
        </GoogleReCaptchaProvider>
    );
}
