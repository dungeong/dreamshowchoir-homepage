'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Swal from 'sweetalert2';
import { Loader2, Copy, CheckCircle2, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { submitDonation } from '@/api/donationApi';
import { cn } from '@/lib/utils';

// Schema
const donationSchema = z.object({
    type: z.enum(['REGULAR', 'ONE_TIME']),
    amount: z.union([z.string(), z.number()])
        .transform((val) => {
            if (val === '') return 0; // Handle empty string
            if (typeof val === 'number') return val;
            const strVal = val.replace(/,/g, '');
            return Number(strVal);
        })
        .pipe(
            z.number()
                .min(1000, '최소 1,000원 이상부터 가능합니다.')
        ),
});

type DonationFormOutput = z.output<typeof donationSchema>;
type DonationFormInput = z.input<typeof donationSchema>;

export default function DonationPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Auth Check
    useEffect(() => {
        // Hydration safe check
        const timer = setTimeout(() => {
            if (!useAuthStore.getState().accessToken) {
                Swal.fire({
                    icon: 'warning',
                    title: '로그인 필요',
                    text: '후원 신청은 로그인 후 이용 가능합니다.',
                    confirmButtonColor: '#f59e0b',
                }).then(() => {
                    router.push('/login?returnUrl=/join/donate');
                });
            } else {
                setIsLoading(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [router]);

    const form = useForm<DonationFormInput, any, DonationFormOutput>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            type: 'REGULAR',
            amount: 0,
        },
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    const currentType = watch('type');
    const currentAmount = watch('amount');

    const formatNumber = (num: number | string) => {
        const n = typeof num === 'string' ? Number(num.replace(/,/g, '')) : num;
        if (isNaN(n)) return '';
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '' || !isNaN(Number(rawValue))) {
            setValue('amount', rawValue);
        }
    };

    const onSubmit = async (data: DonationFormOutput) => {
        try {
            setIsSubmitting(true);
            await submitDonation({
                amount: data.amount,
                type: data.type,
            });
            setIsSubmitted(true);
            window.scrollTo(0, 0);
        } catch (error: any) {
            console.error('Donation failed:', error);
            Swal.fire({
                icon: 'error',
                title: '신청 실패',
                text: error.response?.data?.message || '후원 신청 중 오류가 발생했습니다.',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            icon: 'success',
            title: '복사 완료',
            text: '계좌번호가 클립보드에 복사되었습니다.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    // Success View
    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">후원 신청이 접수되었습니다</h1>
                    <p className="text-gray-600 text-lg">
                        드림쇼콰이어와 함께해주셔서 진심으로 감사드립니다.<br />
                        아래 계좌로 입금해 주시면 관리자 확인 후 승인됩니다.
                    </p>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="bg-primary/5 p-6 border-b border-primary/10">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                            <Heart className="w-5 h-5 fill-primary" />
                            후원 계좌 안내
                        </h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                            <div>
                                <span className="text-sm text-gray-500 block mb-1">은행명</span>
                                <span className="text-lg font-bold text-gray-900">경남은행</span>
                            </div>
                            <div className="h-px md:h-10 w-full md:w-px bg-gray-200"></div>
                            <div>
                                <span className="text-sm text-gray-500 block mb-1">예금주</span>
                                <span className="text-lg font-bold text-gray-900">(사협) 드림쇼콰이어</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                            <p className="text-sm text-yellow-800 mb-2">계좌번호</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-wider">
                                    207-0188-0911-01
                                </span>
                                <button
                                    onClick={() => copyToClipboard('207-0188-0911-01')}
                                    className="p-2 hover:bg-yellow-100 rounded-full transition-colors text-yellow-700"
                                    title="계좌번호 복사"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        className="px-8"
                        onClick={() => router.push('/')}
                    >
                        홈으로
                    </Button>
                    <Button
                        size="lg"
                        className="px-8"
                        onClick={() => router.push('/mypage')}
                    >
                        나의 후원 내역 확인
                    </Button>
                </div>
            </div>
        );
    }

    // Application Form
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">후원 신청</h1>
                <p className="text-gray-600">
                    드림쇼콰이어의 활동을 후원해주세요.<br />
                    보내주신 후원금은 단원들의 활동과 공연을 위해 소중하게 사용됩니다.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Donation Type */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">후원 방식</label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={cn(
                            "cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:bg-gray-50",
                            currentType === 'REGULAR'
                                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                                : "border-gray-200 text-gray-600"
                        )}>
                            <input
                                type="radio"
                                value="REGULAR"
                                className="sr-only"
                                {...register('type')}
                            />
                            <span className="block text-lg font-bold mb-1">정기 후원</span>
                            <span className="text-xs opacity-75">매월 일정 금액 후원</span>
                        </label>

                        <label className={cn(
                            "cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:bg-gray-50",
                            currentType === 'ONE_TIME'
                                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                                : "border-gray-200 text-gray-600"
                        )}>
                            <input
                                type="radio"
                                value="ONE_TIME"
                                className="sr-only"
                                {...register('type')}
                            />
                            <span className="block text-lg font-bold mb-1">일시 후원</span>
                            <span className="text-xs opacity-75">한 번만 후원</span>
                        </label>
                    </div>
                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.type.message}</p>
                    )}
                </div>

                {/* Amount */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">후원 금액 (원)</label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="금액을 입력해주세요 (예: 10,000)"
                            className="text-right text-lg font-bold py-6 pr-12"
                            value={currentAmount ? formatNumber(currentAmount) : ''}
                            onChange={handleAmountChange}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                            원
                        </span>
                    </div>
                    {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}

                    {/* Quick Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {[10000, 30000, 50000, 100000].map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setValue('amount', amt, { shouldValidate: true })}
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                            >
                                + {formatNumber(amt)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-8">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full text-lg py-6 font-bold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            '후원 신청하기'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
