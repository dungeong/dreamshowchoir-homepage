import axios from '@/lib/axios';

export interface Inquiry {
    inquiryId: number;
    name: string;
    email: string;
    content: string;
    status: 'PENDING' | 'ANSWERED';
    answer?: string;
    createdAt: string;
    answeredAt?: string;
    // Removed fields not in user provided JSON: title, authorName, isSecret
}

export interface InquiryResponse {
    content: Inquiry[];
    totalPages: number;
    totalElements: number;
    pageNumber: number; // Updated from page
    pageSize: number;   // Updated from size
    last: boolean;
}

export interface CreateInquiryDto {
    title: string;
    content: string;
    isSecret: boolean;
    password?: string; // For non-logged in users?
}

// GET /api/inquiries
export const getInquiries = async (page: number = 0, size: number = 10): Promise<InquiryResponse> => {
    const response = await axios.get('/api/inquiries', {
        params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
};

// GET /api/inquiries/{id}
export const getInquiryDetail = async (id: number): Promise<Inquiry> => {
    const response = await axios.get(`/api/inquiries/${id}`);
    return response.data;
};

// POST /api/inquiries
export const createInquiry = async (dto: CreateInquiryDto): Promise<Inquiry> => {
    const response = await axios.post('/api/inquiries', dto);
    return response.data;
};

// --- Admin Endpoints ---

// GET /api/admin/inquiry
export const getAdminInquiries = async (page: number = 0, size: number = 10, status?: string): Promise<InquiryResponse> => {
    const params: any = { page, size, sort: 'createdAt,desc' };
    if (status && status !== 'ALL') {
        params.status = status;
    }
    const response = await axios.get('/api/admin/inquiry', { params });
    return response.data;
};

// PATCH /api/admin/inquiry/{id}
export const replyInquiry = async (id: number, answer: string): Promise<void> => {
    await axios.patch(`/api/admin/inquiry/${id}`, { answer });
};
// POST /api/inquiry (Public)
export interface InquiryRequest {
    name: string;
    email: string;
    content: string;
    recaptchaToken: string;
}

export const submitInquiry = async (data: InquiryRequest): Promise<void> => {
    await axios.post('/api/inquiry', data);
};
