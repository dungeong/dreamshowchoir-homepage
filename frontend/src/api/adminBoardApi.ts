import axios from '@/lib/axios';
import { BoardPost } from './boardApi';

// -- Notice Management --
export interface Notice {
    noticeId: number;
    title: string;
    content: string;
    createdAt: string;
    viewCount: number;
    writerName?: string;
    attachments?: NoticeAttachment[];
}

export interface NoticeAttachment {
    fileId: number;
    originalFileName: string;
    fileUrl: string;
}

export interface NoticeResponse {
    content: Notice[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

export interface NoticeDto {
    title: string;
    content: string;
}

// GET /api/notices (Public/Admin use same list?) - usually Admin needs all, but public is fine too.
// If admin needs specific endpoint: /api/admin/notices? currently plan says GET /api/notices
export const getNotices = async (page: number = 0, size: number = 10): Promise<NoticeResponse> => {
    const response = await axios.get('/api/notices', {
        params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
};

// POST /api/admin/notices
export const createNotice = async (dto: NoticeDto, files: File[]): Promise<void> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);
    files.forEach(file => formData.append('files', file));

    await axios.post('/api/admin/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// PATCH /api/admin/notices/{id}
export const updateNotice = async (id: number, dto: NoticeDto, files: File[]): Promise<void> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);
    files.forEach(file => formData.append('files', file));

    await axios.patch(`/api/admin/notices/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// DELETE /api/admin/notices/{id}
export const deleteNotice = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/notices/${id}`);
};


// -- Gallery Management --
export type GalleryType = 'REGULAR' | 'IRREGULAR' | 'EVENT';

export interface GalleryMediaDto {
    mediaId: number;
    fileKey: string;
    fileName: string;
    mediaType: 'IMAGE' | 'VIDEO';
    fileUrl?: string; // S3/CloudFront URL
}

// Response DTO
export interface GalleryItem {
    galleryId: number;
    type: GalleryType;
    title: string;
    description: string;
    createdAt: string; // YYYY-MM-DD
    authorName?: string;
    thumbnailUrl?: string; // Explicit field from backend
    mediaList: GalleryMediaDto[];
}

export interface GalleryResponse {
    content: GalleryItem[];
    totalPages: number;
    totalElements: number;
    number: number; // current page index
    size: number;
}

// Request DTO
export interface GalleryRequestDto {
    title: string;
    type: GalleryType;
    description: string;
    // Date might be createdAt or separate event date? User said "Date: createdAt". 
    // Usually we allow setting a specific date for the gallery event. 
    // If backend only accepts title/desc/type, we stick to that. 
    // But the previous code had 'date': string. I will include it if the backend supports it, 
    // but the user requirement for DTO only listed title, description, type, createdAt(response).
    // I will assume for Creating/Updating, we send title, description, type.
}

// GET /api/gallery
export const getGalleries = async (page: number = 0, size: number = 10, type?: GalleryType): Promise<GalleryResponse> => {
    const params: any = { page, size, sort: 'createdAt,desc' };
    if (type) params.type = type;
    const response = await axios.get('/api/gallery', { params });
    return response.data;
};

// GET /api/gallery/{id} (Detail)
export const getGalleryDetail = async (id: number): Promise<GalleryItem> => {
    const response = await axios.get(`/api/gallery/${id}`);
    return response.data;
};

// POST /api/admin/gallery
export const createGallery = async (dto: GalleryRequestDto, files: File[]): Promise<void> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);
    files.forEach(file => formData.append('files', file));

    await axios.post('/api/admin/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// PATCH /api/admin/gallery/{id}
export const updateGallery = async (id: number, dto: GalleryRequestDto, newFiles?: File[]): Promise<void> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);
    if (newFiles) {
        newFiles.forEach(file => formData.append('files', file));
    }
    // Note: If backend supports deleteMediaIds, we would add it here.

    await axios.patch(`/api/admin/gallery/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// DELETE /api/admin/gallery/{id}
export const deleteGallery = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/gallery/${id}`);
};


// -- Sheet Music Management --
export interface SheetMusic {
    sheetId: number;
    fileName: string;
    fileKey: string; // URL
    fileSize: number;
    uploaderName: string;
    createdAt: string;
}

export interface SheetResponse {
    content: SheetMusic[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

// GET /api/sheets
export const getSheets = async (page: number = 0, size: number = 10): Promise<SheetResponse> => {
    const response = await axios.get('/api/sheets', {
        params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
};

// POST /api/admin/sheets
export const uploadSheet = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('/api/admin/sheets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// DELETE /api/admin/sheets/{id}
export const deleteSheet = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/sheets/${id}`);
};


// -- Post Management (Moderation) --

// GET /api/posts already exists in boardApi.ts (getPosts)
// We need Admin Delete
// DELETE /api/admin/posts/{id}
export const adminDeletePost = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/posts/${id}`);
};
