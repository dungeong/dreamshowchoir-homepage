import axios from '@/lib/axios';

export interface GalleryItem {
    galleryId: number;
    type: string; // 'REGULAR' | 'IRREGULAR' | 'EVENT'
    title: string;
    authorName: string;
    createdAt: string;
    thumbnailUrl: string;
    // Fields that might be in detail view but not in list view (optional)
    content?: string;
    url?: string;
    mediaType?: 'IMAGE' | 'VIDEO';
}

export interface MediaItem {
    mediaId: number;
    fileKey: string;
    mediaType: 'IMAGE' | 'VIDEO';
}

export interface GalleryDetailResponse {
    galleryId: number;
    type: string;
    title: string;
    description: string;
    author: {
        userId: number;
        email: string;
        name: string;
        profileImageKey: string;
        role: string;
        part: string;
        interests: string;
        myDream: string;
        hashTags: string;
        memberProfileImageKey: string;
    };
    createdAt: string;
    mediaList: MediaItem[];
}

export interface GalleryPageResponse {
    content: GalleryItem[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        direction: string;
        nullHandling: string;
        ascending: boolean;
        property: string;
        ignoreCase: boolean;
    }[];
    first: boolean;
    last: boolean;
    numberOfElements: number;
    pageable: {
        offset: number;
        sort: any[];
        pageNumber: number;
        pageSize: number;
        unpaged: boolean;
        paged: boolean;
    };
    empty: boolean;
}

export const getGalleries = async (page: number = 0, size: number = 12, type?: string): Promise<GalleryPageResponse> => {
    try {
        let url = `/api/gallery?page=${page}&size=${size}`;
        if (type && type !== 'all') {
            url += `&type=${type}`;
        }
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch galleries:', error);
        throw error;
    }
};

export const getGalleryDetail = async (id: number): Promise<GalleryDetailResponse> => {
    try {
        const response = await axios.get(`/api/gallery/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch gallery detail for id ${id}:`, error);
        throw error;
    }
};
