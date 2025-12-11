import axios from '@/lib/axios';

// DTO Interface
export interface ActivityMaterial {
    materialId: number;
    title: string;
    description: string;
    authorName: string | null;
    fileName: string;
    fileKey: string;
    createdAt: string;
}

export interface ActivityMaterialsResponse {
    content: ActivityMaterial[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

// GET /api/activity-materials (Public/Member)
export const getActivityMaterials = async (page: number = 0, size: number = 20): Promise<ActivityMaterialsResponse> => {
    const response = await axios.get(`/api/activity-materials?page=${page}&size=${size}`);
    return response.data;
};

// GET /api/activity-materials/{id} (Public/Member)
export const getActivityMaterialById = async (id: number): Promise<ActivityMaterial> => {
    const response = await axios.get(`/api/activity-materials/${id}`);
    return response.data;
};

// GET /api/admin/activity-materials (Admin)
export const getAdminActivityMaterials = async (page: number = 0, size: number = 20): Promise<ActivityMaterialsResponse> => {
    const response = await axios.get(`/api/admin/activity-materials`, {
        params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
};

// POST /api/admin/activity-materials
export const createActivityMaterial = async (dto: { title: string; description: string }, file: File): Promise<void> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('dto', jsonBlob);
    formData.append('file', file);

    await axios.post('/api/admin/activity-materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// PATCH /api/admin/activity-materials/{id}
export const updateActivityMaterial = async (id: number, dto: { title: string; description: string }): Promise<void> => {
    await axios.patch(`/api/admin/activity-materials/${id}`, dto);
};

// DELETE /api/admin/activity-materials/{id}
export const deleteActivityMaterial = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/activity-materials/${id}`);
};
