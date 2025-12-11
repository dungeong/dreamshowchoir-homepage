'use client';

import { Suspense } from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Upload, Trash2, Loader2, Search, Music, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSheets, uploadSheet, deleteSheet, Sheet } from '@/api/sheetApi';
import { getMyProfile, UserProfile } from '@/api/memberApi';
import { cn } from '@/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';

// Helper to parse filename
const parseFileName = (fileName: string) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';

    // Heuristic for parts
    const parts = ['Sop', 'Soprano', 'Alto', 'Tenor', 'Bass', 'Piano', 'Score', 'All', '전체', '소프', '알토', '테너', '베이스'];
    let title = nameWithoutExt;
    let part = 'General';

    for (const p of parts) {
        // Check if the name ends with the part (case insensitive), allowing for separators like " - ", "_", " "
        const regex = new RegExp(`[\\-_\\s]*${p}$`, 'i');
        if (regex.test(nameWithoutExt)) {
            part = p;
            title = nameWithoutExt.replace(regex, '').trim();
            break;
        }
    }

    return { title, part, ext };
};

function SheetMusicContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get page from URL query params (default to 0)
    const currentPage = Number(searchParams.get('page')) || 0;

    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        fetchSheets(currentPage);
    }, [currentPage]);

    const fetchProfile = async () => {
        try {
            const profile = await getMyProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const fetchSheets = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await getSheets(pageNum, 10);
            setSheets(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch sheets", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max size check (e.g., 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        if (!confirm(`${file.name} 파일을 업로드하시겠습니까?`)) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            await uploadSheet(file);
            alert('업로드가 완료되었습니다.');
            // Refresh list
            fetchSheets(currentPage);
        } catch (error) {
            console.error("Upload failed", error);
            alert('파일 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (sheetId: number, fileName: string) => {
        if (!confirm(`'${fileName}' 파일을 삭제하시겠습니까?`)) return;

        try {
            await deleteSheet(sheetId);
            alert('삭제되었습니다.');
            fetchSheets(currentPage);
        } catch (error) {
            console.error("Delete failed", error);
            alert('파일 삭제에 실패했습니다.');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Grouping logic
    const groupedSheets = useMemo(() => {
        const groups: Record<string, Sheet[]> = {};

        sheets.forEach(sheet => {
            const { title } = parseFileName(sheet.fileName);
            // Filter by search term
            if (searchTerm && !title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }

            if (!groups[title]) {
                groups[title] = [];
            }
            groups[title].push(sheet);
        });

        return groups;
    }, [sheets, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">악보/자료실</h2>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="곡 제목 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button
                        onClick={handleUploadClick}
                        disabled={uploading}
                    >
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        업로드
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                    </div>
                ) : Object.keys(groupedSheets).length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(groupedSheets).map(([title, groupSheets], index) => (
                            <AccordionItem key={title} value={`item-${index}`}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <Music className="h-5 w-5 text-primary" />
                                        <span className="text-lg font-medium">{title}</span>
                                        <Badge variant="secondary" className="ml-2">
                                            {groupSheets.length}개 파일
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid gap-2 pt-2">
                                        {groupSheets.map((sheet) => {
                                            const { part, ext } = parseFileName(sheet.fileName);
                                            return (
                                                <div key={sheet.sheetId} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <Badge variant="outline" className={cn(
                                                            "w-16 justify-center shrink-0",
                                                            ext === 'PDF' ? "border-red-200 text-red-700 bg-red-50" : "border-blue-200 text-blue-700 bg-blue-50"
                                                        )}>
                                                            {ext}
                                                        </Badge>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium truncate">{sheet.fileName}</span>
                                                                <Badge className="shrink-0">{part}</Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span>{sheet.uploaderName}</span>
                                                                <span>•</span>
                                                                <span>{formatFileSize(sheet.fileSize)}</span>
                                                                <span>•</span>
                                                                <span>{new Date(sheet.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <a
                                                            href={sheet.fileKey.startsWith('http') ? sheet.fileKey : `${IMAGE_BASE_URL}${sheet.fileKey}`}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                            title="다운로드"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        {userProfile && userProfile.name === sheet.uploaderName && (
                                                            <button
                                                                onClick={() => handleDelete(sheet.sheetId, sheet.fileName)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                title="삭제"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 자료가 없습니다.'}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center px-4 font-medium text-sm">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SheetMusicPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
            <SheetMusicContent />
        </Suspense>
    );
}
