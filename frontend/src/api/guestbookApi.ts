import axios from '@/lib/axios';

export interface GuestbookEntry {
    id: number;
    authorName: string;
    content: string;
    createdAt: string;
}

export interface GuestbookResponse {
    content: GuestbookEntry[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

export interface CreateGuestbookDto {
    authorName: string;
    password?: string;
    content: string;
}

// GET /api/guestbooks
export const getGuestbookEntries = async (page: number = 0, size: number = 10): Promise<GuestbookResponse> => {
    const response = await axios.get('/api/guestbooks', {
        params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
};

// POST /api/guestbooks
export const createGuestbookEntry = async (dto: CreateGuestbookDto): Promise<GuestbookEntry> => {
    const response = await axios.post('/api/guestbooks', dto);
    return response.data;
};

// DELETE /api/guestbooks/{id}
export const deleteGuestbookEntry = async (id: number, password?: string): Promise<void> => {
    await axios.delete(`/api/guestbooks/${id}`, {
        data: { password } // Send password in body for verification if needed, or query param. Using body common for delete with auth.
    });
};
