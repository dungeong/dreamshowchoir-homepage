'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/api/boardApi';
import QuillEditor from '@/components/board/QuillEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BoardWritePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
        // Reset input value to allow selecting the same file again if needed
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            Swal.fire('알림', '제목을 입력해주세요.', 'warning');
            return;
        }

        // Quill editor content might be "<p><br></p>" when empty, check text content
        const cleanContent = content.replace(/<(.|\n)*?>/g, '').trim();
        if (!cleanContent && !files.length) {
            // Allow content to be optional if files are attached? Usually no.
            // But technically one could just upload a file. 
            // Let's enforce content or file? Or just content.
            // User didn't specify validation rules. Let's enforce content for now.
            if (!cleanContent) {
                Swal.fire('알림', '내용을 입력해주세요.', 'warning');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            await createPost({ title, content }, files);
            await Swal.fire({
                icon: 'success',
                title: '작성 완료',
                text: '게시글이 등록되었습니다.',
                timer: 1500,
                showConfirmButton: false
            });
            router.push('/members/board');
        } catch (error) {
            console.error('Failed to create post', error);
            Swal.fire('오류', '게시글 등록에 실패했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <h1 className="text-2xl font-bold text-gray-900">게시글 작성</h1>
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

                {/* File Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">첨부파일</label>
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
                            (최대 5개, 개당 10MB 이하 권장)
                            {/* Validations are typically backend, but we can add frontend limit if needed */}
                        </span>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-sm text-gray-700 truncate max-w-[80%]">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
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
                            '등록하기'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
