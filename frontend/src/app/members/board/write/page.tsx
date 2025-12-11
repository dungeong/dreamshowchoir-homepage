'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/api/boardApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';

export default function BoardWritePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            // Revoke URL to avoid memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await createPost({ title, content }, files);
            alert('게시글이 등록되었습니다.');
            router.push('/members/board');
        } catch (error) {
            console.error('Failed to create post', error);
            alert('게시글 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">글쓰기</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">제목</label>
                    <Input
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">내용</label>
                    <textarea
                        className="w-full min-h-[400px] p-4 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        placeholder="내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        이미지 첨부
                        <span className="text-xs text-gray-400 font-normal">(최대 10장)</span>
                    </label>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                        {/* Upload Button */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        >
                            <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">이미지 추가</span>
                        </div>

                        {/* Previews */}
                        {previews.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        등록하기
                    </Button>
                </div>
            </form>
        </div>
    );
}
