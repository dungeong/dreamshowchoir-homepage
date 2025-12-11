import axios from '@/lib/axios';

export interface ContentResponse {
    contentKey: string;
    content: string;
    updatedAt: string;
}

// GET /api/content/{contentKey}
export const getContent = async (contentKey: string): Promise<ContentResponse> => {
    const response = await axios.get<ContentResponse>(`/api/content/${contentKey}`);
    return response.data;
};

// PATCH /api/admin/content/{contentKey}
export const updateContent = async (contentKey: string, content: string): Promise<void> => {
    await axios.patch(`/api/admin/content/${contentKey}`, { content });
};

// POST /api/s3/upload
export const uploadImage = async (file: File, dir: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('/api/s3/upload', formData, {
        params: { dir },
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // Expecting direct URL string or object depending on backend. User said "Backend returns the Image URL".
};
