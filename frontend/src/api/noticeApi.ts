import axios from '@/lib/axios';

export interface Notice {
    noticeId: number;
    title: string;
    authorName: string;
    createdAt: string;
}

export interface NoticeImage {
    imageId: number;
    imageUrl: string;
}

export interface NoticeDetail {
    noticeId: number;
    title: string;
    content: string;
    authorName: string;
    authorId: number;
    createdAt: string;
    updatedAt: string;
    images: NoticeImage[];
}

export interface NoticeResponse {
    content: Notice[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export const getNotices = async (page: number = 0, size: number = 20): Promise<NoticeResponse> => {
    const response = await axios.get<NoticeResponse>(`/api/notices`, {
        params: { page, size }
    });
    return response.data;
};

export const getNoticeDetail = async (noticeId: number): Promise<NoticeDetail> => {
    const response = await axios.get<NoticeDetail>(`/api/notices/${noticeId}`);
    return response.data;
};
