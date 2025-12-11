'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContent, updateContent, uploadImage } from '@/api/contentApi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, ImageIcon, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-md" />
});
import 'react-quill-new/dist/quill.snow.css';

const CONTENT_KEYS = {
    GREETING: '인사말',
    ORGANIZATION: '조직도',
    RECRUIT_GUIDE: '단원 모집',
    DONATION_GUIDE: '후원 안내',
} as const;

type ContentKey = keyof typeof CONTENT_KEYS;

export default function SiteContentPage() {
    const [activeTab, setActiveTab] = useState<ContentKey>('GREETING');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">사이트 콘텐츠 관리</h1>

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ContentKey)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    {Object.entries(CONTENT_KEYS).map(([key, label]) => (
                        <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
                    ))}
                </TabsList>

                <div className="mt-6">
                    <ContentEditor contentKey={activeTab} />
                </div>
            </Tabs>
        </div>
    );
}

function ContentEditor({ contentKey }: { contentKey: ContentKey }) {
    const queryClient = useQueryClient();
    const [editContent, setEditContent] = useState('');
    const [isImageUploading, setIsImageUploading] = useState(false);
    const isOrganization = contentKey === 'ORGANIZATION';

    // Fetch Content (Public API - Live Data)
    const { data: liveData, isLoading, refetch } = useQuery({
        queryKey: ['site-content', contentKey],
        queryFn: () => getContent(contentKey),
    });

    // Initialize Edit Content with Live Data
    useEffect(() => {
        if (liveData) {
            setEditContent(liveData.content);
        }
    }, [liveData, contentKey]);

    // Update Content Mutation (Admin API)
    const updateMutation = useMutation({
        mutationFn: (newContent: string) => updateContent(contentKey, newContent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', contentKey] });
            Swal.fire('성공', '콘텐츠가 저장되었습니다.', 'success');
        },
        onError: () => Swal.fire('실패', '저장에 실패했습니다.', 'error')
    });

    // Image Upload Handler (Specifically for ORGANIZATION)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            setIsImageUploading(true);
            const imageUrl = await uploadImage(file, 'organization');
            setEditContent(imageUrl);
        } catch (error) {
            console.error(error);
            Swal.fire('실패', '이미지 업로드에 실패했습니다.', 'error');
        } finally {
            setIsImageUploading(false);
        }
    };

    if (isLoading) {
        return <div className="h-60 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
    }

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            {/* Section A: Current Live Content */}
            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">현재 등록된 내용</h2>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded">Live View</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                    {isOrganization ? (
                        liveData?.content ? (
                            <img src={liveData.content} alt="Current Organization" className="max-w-full h-auto rounded shadow-sm" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                <span>등록된 이미지가 없습니다.</span>
                            </div>
                        )
                    ) : (
                        <div
                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: liveData?.content || "등록된 내용이 없습니다." }}
                        />
                    )}
                </div>
                <div className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-gray-500 text-xs gap-1">
                        <RefreshCw className="w-3 h-3" /> 새로고침
                    </Button>
                </div>
            </div>

            {/* Section B: Edit Content */}
            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-indigo-700">내용 수정</h2>
                    <Button
                        onClick={() => updateMutation.mutate(editContent)}
                        disabled={updateMutation.isPending}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        저장하기
                    </Button>
                </div>

                <div className="bg-white border border-indigo-100 rounded-lg p-6 min-h-[400px] shadow-sm">
                    {isOrganization ? (
                        <div className="space-y-6">
                            <div className="p-4 border border-indigo-50 bg-indigo-50/30 rounded-md">
                                <p className="text-sm text-indigo-900 font-medium mb-2">미리보기 (저장 전)</p>
                                {editContent ? (
                                    <img src={editContent} alt="Preview" className="max-w-full h-auto rounded border border-indigo-200" />
                                ) : (
                                    <div className="h-40 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
                                        이미지를 업로드하세요
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <label htmlFor="org-upload-edit" className="cursor-pointer w-full">
                                    <div className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition p-4">
                                        {isImageUploading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : <Upload className="w-6 h-6 text-indigo-600" />}
                                        <div className="text-center">
                                            <span className="text-indigo-600 font-medium block">클릭하여 이미지 업로드</span>
                                            <span className="text-xs text-gray-400">JPG, PNG, GIF files</span>
                                        </div>
                                    </div>
                                    <input
                                        id="org-upload-edit"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isImageUploading}
                                    />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="quill-wrapper flex-1">
                                <ReactQuill
                                    theme="snow"
                                    value={editContent}
                                    onChange={setEditContent}
                                    className="h-[350px]"
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            [{ 'align': [] }],
                                            ['link'],
                                            ['clean']
                                        ]
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
