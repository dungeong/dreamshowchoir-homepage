'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Swal from 'sweetalert2';
import axios from '@/lib/axios';
import { getMyApplication, submitApplication, JoinApplication } from '@/api/joinApi';
import { getMyProfile, UserProfile } from '@/api/memberApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Clock, XCircle, Camera } from 'lucide-react';

const PARTS = ['SOPRANO', 'ALTO', 'TENOR', 'BASS'] as const;

const formSchema = z.object({
    part: z.enum(PARTS as unknown as [string, ...string[]], {
        message: '희망 파트를 선택해주세요.'
    }),
    interests: z.string().min(1, "자기소개 및 관심사를 입력해주세요."),
    myDream: z.string().min(1, "이루고 싶은 꿈을 입력해주세요."),
    hashTags: z.string().min(1, "나를 표현하는 해시태그를 입력해주세요."),
    profileImage: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplicationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [application, setApplication] = useState<JoinApplication | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const profileImage = form.watch('profileImage');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, appData] = await Promise.all([
                    getMyProfile().catch(() => null),
                    getMyApplication().catch(() => [])
                ]);

                if (!userData) {
                    alert('로그인이 필요한 서비스입니다.');
                    router.push('/login?returnUrl=/join/application');
                    return;
                }

                setUser(userData);

                // Pre-fill profile image if user has one
                if (userData.profileImageUrl) {
                    form.setValue('profileImage', userData.profileImageUrl);
                }

                if (appData && appData.length > 0) {
                    setApplication(appData[0]);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router, form]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (5MB limit)
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            Swal.fire({
                icon: 'warning',
                title: '용량 초과',
                text: '이미지 파일 크기는 5MB 이하여야 합니다.',
                confirmButtonColor: '#f59e0b',
            });
            e.target.value = ''; // Reset input
            return;
        }

        // Immediate preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/s3/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Assuming response.data is the key (string) or contains 'key'/'url'
            const imageKey = typeof response.data === 'string' ? response.data : (response.data.key || response.data.url);

            form.setValue('profileImage', imageKey);

        } catch (error) {
            console.error('Image upload failed:', error);
            Swal.fire({
                icon: 'error',
                title: '업로드 실패',
                text: '이미지 업로드 중 오류가 발생했습니다.',
            });
            setPreviewUrl(null); // Reset preview on failure
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: FormValues) => {
        try {
            await submitApplication(data);
            await Swal.fire({
                icon: 'success',
                title: '신청 완료',
                text: '가입 신청서가 성공적으로 접수되었습니다. 결과는 알림으로 알려드립니다.',
                confirmButtonColor: '#000000',
            });
            router.push('/');
        } catch (error) {
            console.error("Failed to submit application", error);
            Swal.fire({
                icon: 'error',
                title: '오류 발생',
                text: '신청서 제출 중 오류가 발생했습니다. 다시 시도해주세요.',
                confirmButtonColor: '#d33',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    if (!user) return null;

    if (user.role === 'MEMBER' || application?.status === 'APPROVED') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-20 h-20 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">이미 정단원입니다!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    드림쇼콰이어와 함께해주셔서 감사합니다.<br />
                    단원 전용 페이지에서 활동 내용을 확인해보세요.
                </p>
                <Button onClick={() => router.push('/members')} size="lg" className="text-lg px-8">
                    단원 페이지로 이동
                </Button>
            </div>
        );
    }

    // Block non-USER roles (e.g. ADMIN)
    // Note: If the user role string is GUEST in some contexts, this might need adjustment,
    // but we strictly follow the requirement "role must be User".
    if (user.role !== 'USER') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <XCircle className="w-20 h-20 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    일반 회원(User)만 입단 신청이 가능합니다.<br />
                    관리자 계정이거나 권한이 없는 경우 접근할 수 없습니다.
                </p>
                <Button onClick={() => router.push('/')} variant="outline" size="lg" className="text-lg px-8">
                    홈으로 돌아가기
                </Button>
            </div>
        );
    }

    if (application?.status === 'PENDING') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <Clock className="w-20 h-20 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">가입 심사 중입니다</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    제출하신 가입 신청서를 꼼꼼히 검토하고 있습니다.<br />
                    조금만 기다려주시면 결과를 알려드리겠습니다.
                </p>
                <Button onClick={() => router.push('/')} variant="outline" size="lg" className="text-lg px-8">
                    홈으로 돌아가기
                </Button>
            </div>
        );
    }

    const handleHashtagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Allows typing, auto-adds # to words.
        // Logic: Split by spaces. If a part doesn't start with #, add it.
        // We also need to handle trailing spaces to allow typing new words.

        const endsWithSpace = value.endsWith(' ');
        const parts = value.split(/\s+/).filter(Boolean);

        const formatted = parts.map(part => part.startsWith('#') ? part : `#${part}`).join(' ');

        form.setValue('hashTags', endsWithSpace ? formatted + ' ' : formatted);
    };

    return (
        <div className="max-w-3xl mx-auto px-4">
            <div className="mb-10 text-center">
                <p className="text-gray-600">
                    드림쇼콰이어의 가족이 되어주세요.<br />
                    작성해주신 내용은 단원 선발을 위한 소중한 자료로 활용됩니다.
                </p>
                {application?.status === 'REJECTED' && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        <span>지난 신청이 반려되었습니다. 다시 신청하실 수 있습니다.</span>
                    </div>
                )}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Label className="text-base font-medium text-gray-700">프로필 사진</Label>
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="w-32 h-32 border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors">
                            <AvatarImage src={previewUrl || profileImage || user.profileImageUrl} className="object-cover" />
                            <AvatarFallback className="bg-gray-50">
                                <Camera className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">사진 변경</span>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <p className="text-sm text-gray-500">
                        본인임을 확인할 수 있는 사진을 등록해주세요.
                    </p>
                </div>

                {/* Part Selection */}
                <div className="space-y-3">
                    <Label className="text-base">희망 파트 <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(value) => form.setValue('part', value as any)} defaultValue={form.getValues('part')}>
                        <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder="파트를 선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SOPRANO">소프라노 (Soprano)</SelectItem>
                            <SelectItem value="ALTO">알토 (Alto)</SelectItem>
                            <SelectItem value="TENOR">테너 (Tenor)</SelectItem>
                            <SelectItem value="BASS">베이스 (Bass)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.part && (
                        <p className="text-sm text-red-500">{form.formState.errors.part.message}</p>
                    )}
                </div>

                {/* Interests */}
                <div className="space-y-3">
                    <Label htmlFor="interests" className="text-base">자기소개 및 관심사 <span className="text-red-500">*</span></Label>
                    <Textarea
                        id="interests"
                        {...form.register('interests')}
                        placeholder="평소 좋아하는 것, 취미 또는 음악 장르 등 뭐든지 자유롭게 적어주세요."
                        className="min-h-[120px] resize-none text-base"
                    />
                    {form.formState.errors.interests && (
                        <p className="text-sm text-red-500">{form.formState.errors.interests.message}</p>
                    )}
                </div>

                {/* My Dream */}
                <div className="space-y-3">
                    <Label htmlFor="myDream" className="text-base">이루고 싶은 꿈은? <span className="text-red-500">*</span></Label>
                    <Input
                        id="myDream"
                        {...form.register('myDream')}
                        placeholder="예: 예술의 전당 무대 서기, 가족들에게 멋진 모습 보여주기"
                        className="h-12 text-base"
                    />
                    {form.formState.errors.myDream && (
                        <p className="text-sm text-red-500">{form.formState.errors.myDream.message}</p>
                    )}
                </div>

                {/* Hashtags */}
                <div className="space-y-3">
                    <Label htmlFor="hashTags" className="text-base">나를 표현하는 해시태그 <span className="text-red-500">*</span></Label>
                    <Input
                        id="hashTags"
                        {...form.register('hashTags')}
                        onChange={(e) => {
                            handleHashtagChange(e);
                        }}
                        placeholder="#열정 #성실 #분위기메이커"
                        className="h-12 text-base"
                    />
                    {form.formState.errors.hashTags && (
                        <p className="text-sm text-red-500">{form.formState.errors.hashTags.message}</p>
                    )}
                </div>

                <div className="pt-6">
                    <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={form.formState.isSubmitting || uploading}>
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                제출 중...
                            </>
                        ) : (
                            '가입 신청서 제출하기'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
