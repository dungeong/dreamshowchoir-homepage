import axios from '@/lib/axios';

// DTO Interfaces
export interface BannerDto {
    bannerId: number;
    title: string;
    description: string;
    imageUrl: string;
    orderIndex: number;
    isActive: boolean;
}

export interface BannerCreateDto {
    title: string;
    description?: string;
}

export interface BannerUpdateDto {
    title?: string;
    description?: string;
    orderIndex?: number;
    isActive?: boolean;
}

// GET /api/admin/banners (Admin List)
export const getAdminBanners = async (): Promise<BannerDto[]> => {
    const response = await axios.get('/api/admin/banners');
    return response.data;
};

// GET /api/banners (Public List - keeping it if needed elsewhere, though requirement focused on admin)
export const getBanners = async (): Promise<BannerDto[]> => {
    const response = await axios.get('/api/banners');
    return response.data;
};

// POST /api/admin/banners
export const createBanner = async (dto: BannerCreateDto, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('title', dto.title);
    if (dto.description) formData.append('description', dto.description);
    formData.append('file', file);

    await axios.post('/api/admin/banners', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// PATCH /api/admin/banners/{id}
export const updateBanner = async (id: number, dto: BannerUpdateDto, file?: File): Promise<void> => {
    const formData = new FormData();

    // Append File if exists
    if (file) {
        formData.append('file', file);
    }

    // Append DTO as Blob
    const json = JSON.stringify(dto);
    const blob = new Blob([json], { type: 'application/json' });
    formData.append('dto', blob);

    await axios.patch(`/api/admin/banners/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// DELETE /api/admin/banners/{id}
export const deleteBanner = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/banners/${id}`);
};
