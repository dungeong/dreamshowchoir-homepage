import axios from '@/lib/axios';

export interface Comment {
    commentId: number;
    content: string;
    authorName: string;
    authorId: number;
    authorProfileImage?: string;
    authorProfileImageKey?: string;
    createdAt: string;
    updatedAt: string;
}

// GET /api/posts/{postId}/comments
export const getComments = async (postId: number): Promise<Comment[]> => {
    try {
        const response = await axios.get<Comment[]>(`/api/posts/${postId}/comments`);
        return response.data;
    } catch (error: any) {
        // Fallback if the first endpoint fails (as per user request)
        if (error.response && error.response.status === 404) {
            const response = await axios.get<Comment[]>(`/api/comments`, {
                params: { postId }
            });
            return response.data;
        }
        throw error;
    }
};

// POST /api/posts/{postId}/comments
export const createComment = async (postId: number, content: string): Promise<Comment> => {
    const response = await axios.post<Comment>(`/api/posts/${postId}/comments`, { content });
    return response.data;
};

// PATCH /api/posts/{postId}/comments/{commentId}
export const updateComment = async (postId: number, commentId: number, content: string): Promise<Comment> => {
    try {
        const response = await axios.patch<Comment>(`/api/posts/${postId}/comments/${commentId}`, { content });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            // Fallback to flat path
            const response = await axios.patch<Comment>(`/api/comments/${commentId}`, { content });
            return response.data;
        }
        throw error;
    }
};

// DELETE /api/posts/{postId}/comments/{commentId}
export const deleteComment = async (postId: number, commentId: number): Promise<void> => {
    try {
        await axios.delete(`/api/posts/${postId}/comments/${commentId}`);
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            // Fallback to flat path
            await axios.delete(`/api/comments/${commentId}`);
        } else {
            throw error;
        }
    }
};
