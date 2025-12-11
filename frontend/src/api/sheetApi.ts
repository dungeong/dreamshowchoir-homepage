import axios from '@/lib/axios';

export interface Sheet {
    sheetId: number;
    fileName: string;
    fileKey: string;
    fileSize: number;
    uploaderName: string;
    createdAt: string;
}

export interface SheetResponse {
    content: Sheet[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export const getSheets = async (page: number, size: number = 10): Promise<SheetResponse> => {
    const response = await axios.get<SheetResponse>('/api/sheets', {
        params: { page, size }
    });
    return response.data;
};

export const uploadSheet = async (file: File): Promise<Sheet> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<Sheet>('/api/sheets', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteSheet = async (sheetId: number): Promise<void> => {
    await axios.delete(`/api/sheets/${sheetId}`);
};
