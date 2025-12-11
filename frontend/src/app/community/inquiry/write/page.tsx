'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiry } from '@/api/inquiryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const inquirySchema = z.object({
    title: z.string().min(1, '제목을 입력해주세요.'),
    content: z.string().min(1, '내용을 입력해주세요.'),
    isSecret: z.boolean().optional(),
    password: z.string().optional(),
});

type InquiryForm = z.infer<typeof inquirySchema>;

export default function InquiryWritePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, watch, control, formState: { errors } } = useForm<InquiryForm>({
        resolver: zodResolver(inquirySchema),
        defaultValues: {
            isSecret: true,
            title: '',
            content: '',
            password: ''
        }
    });

    const isSecret = watch('isSecret');

    const onSubmit = async (data: InquiryForm) => {
        setSubmitting(true);
        try {
            // Validate password if secret
            if (data.isSecret && !data.password) {
                alert('비공개 글은 비밀번호가 필요합니다.');
                setSubmitting(false);
                return;
            }

            await createInquiry({
                ...data,
                isSecret: !!data.isSecret // Ensure boolean
            });
            alert('문의가 등록되었습니다.');
            router.push('/community/inquiry');
        } catch (error) {
            console.error("Failed to create inquiry", error);
            alert('등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
            <div>
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    돌아가기
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">문의하기</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input id="title" placeholder="제목을 입력해주세요" {...register('title')} />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">내용</Label>
                        <Textarea id="content" placeholder="문의하실 내용을 입력해주세요" className="min-h-[200px]" {...register('content')} />
                        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="isSecret"
                            render={({ field }) => (
                                <Checkbox
                                    id="isSecret"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="isSecret" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            비공개 (관리자와 작성자만 볼 수 있습니다)
                        </Label>
                    </div>

                    {isSecret && (
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input id="password" type="password" placeholder="비밀번호 4자리 이상" {...register('password')} />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            취소
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            등록하기
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
