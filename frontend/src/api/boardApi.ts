import axios from '@/lib/axios';

export interface BoardPost {
    postId: number;
    title: string;
    authorName: string;
    authorProfileImage?: string;
    createdAt: string;
    commentCount: number;
}

export interface BoardPostDetail {
    postId: number;
    title: string;
    content: string;
    authorName: string;
    authorId: number;
    authorProfileImage?: string;
    authorProfileImageKey?: string;
    createdAt: string;
    updatedAt: string;
    images: BoardImage[];
}

export interface BoardImage {
    imageId: number;
    imageUrl: string;
}

export interface BoardResponse {
    content: BoardPost[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

export interface BoardPostDto {
    title: string;
    content: string;
    deleteImageIds?: number[];
}

// GET /api/posts
export const getPosts = async (page: number = 0, size: number = 10): Promise<BoardResponse> => {
    const response = await axios.get('/api/posts', {
        params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
};

// GET /api/posts/{postId}
export const getPostDetail = async (postId: number): Promise<BoardPostDetail> => {
    const response = await axios.get(`/api/posts/${postId}`);
    return response.data;
};

// POST /api/posts
export const createPost = async (dto: BoardPostDto, files: File[]): Promise<BoardPostDetail> => {
    const formData = new FormData();

    // JSON data as Blob with application/json type
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);

    // Files
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await axios.post('/api/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// PATCH /api/posts/{postId}
export const updatePost = async (postId: number, dto: BoardPostDto, files: File[]): Promise<BoardPostDetail> => {
    const formData = new FormData();

    // JSON data as Blob with application/json type
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);

    // Files (only new ones)
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await axios.patch(`/api/posts/${postId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// DELETE /api/posts/{postId}
export const deletePost = async (postId: number): Promise<void> => {
    await axios.delete(`/api/posts/${postId}`);
};
