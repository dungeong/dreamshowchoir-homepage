import axios from '@/lib/axios';

export interface Faq {
    faqId: number;
    question: string;
    answer: string;
    category?: string;
    order?: number;
}


// GET /api/faq (Public) - Changed to singular as requested
export const getFaqList = async (): Promise<Faq[]> => {
    const response = await axios.get('/api/faq');
    return response.data;
};

// -- Admin --

export interface FaqDto {
    question: string;
    answer: string;
}

// POST /api/admin/faq
export const createFaq = async (dto: FaqDto): Promise<void> => {
    await axios.post('/api/admin/faq', dto);
};

// PATCH /api/admin/faq/{id}
export const updateFaq = async (faqId: number, dto: FaqDto): Promise<void> => {
    await axios.patch(`/api/admin/faq/${faqId}`, dto);
};

// DELETE /api/admin/faq/{id}
export const deleteFaq = async (faqId: number): Promise<void> => {
    await axios.delete(`/api/admin/faq/${faqId}`);
};

