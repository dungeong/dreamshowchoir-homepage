'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPostDetail, updatePost, BoardPostDetail } from '@/api/boardApi';
import QuillEditor from '@/components/board/QuillEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Upload, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

export default function BoardEditPage() {
    const router = useRouter();
    const params = useParams();
    const postId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [existingImages, setExistingImages] = useState<{ imageId: number; imageUrl: string }[]>([]);
    const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPostDetail(postId);
                setTitle(data.title);
                setContent(data.content);
                setExistingImages(data.images || []);
            } catch (error) {
                console.error("Failed to fetch post", error);
                Swal.fire('오류', '게시글 정보를 불러오지 못했습니다.', 'error');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchData();
        }
    }, [postId, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewFiles((prev) => [...prev, ...files]);
        }
        e.target.value = '';
    };

    const removeNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId: number) => {
        // Mark for deletion
        setDeleteImageIds((prev) => [...prev, imageId]);
        // Remove from UI list
        setExistingImages((prev) => prev.filter(img => img.imageId !== imageId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            Swal.fire('알림', '제목을 입력해주세요.', 'warning');
            return;
        }

        const cleanContent = content.replace(/<(.|\n)*?>/g, '').trim();
        if (!cleanContent && existingImages.length === 0 && newFiles.length === 0) {
            if (!cleanContent) {
                Swal.fire('알림', '내용을 입력해주세요.', 'warning');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            await updatePost(postId, {
                title,
                content,
                deleteImageIds
            }, newFiles);

            await Swal.fire({
                icon: 'success',
                title: '수정 완료',
                text: '게시글이 수정되었습니다.',
                timer: 1500,
                showConfirmButton: false
            });
            router.push(`/members/board/${postId}`);
        } catch (error) {
            console.error('Failed to update post', error);
            Swal.fire('오류', '게시글 수정에 실패했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="p-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">게시글 수정</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">제목</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="text-lg py-6"
                        maxLength={100}
                    />
                </div>

                {/* Editor */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">내용</label>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[400px]">
                        <QuillEditor
                            value={content}
                            onChange={setContent}
                            placeholder="내용을 입력하세요..."
                            className="h-[400px]"
                        />
                    </div>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">기존 첨부파일</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingImages.map((img) => (
                                <div key={img.imageId} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                                    <img
                                        src={img.imageUrl.startsWith('http') ? img.imageUrl : `${IMAGE_BASE_URL}${img.imageUrl}`}
                                        alt="Existing"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.imageId)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* New File Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">새 첨부파일 추가</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium transition-colors">
                            <Upload className="w-4 h-4" />
                            파일 선택
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        <span className="text-xs text-gray-500">
                            (추가할 파일을 선택하세요)
                        </span>
                    </div>

                    {/* New File List */}
                    {newFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {newFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-700 truncate max-w-[80%]">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                    <button
                                        type="button"
                                        onClick={() => removeNewFile(index)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            '수정하기'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
