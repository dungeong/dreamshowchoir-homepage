import axios from '@/lib/axios';

export interface HistoryItem {
    historyId: number;
    year: number;
    month: number;
    content: string;
}

export const getHistory = async (): Promise<HistoryItem[]> => {
    const response = await axios.get('/api/history');
    return response.data;
};

// POST /api/admin/history
export const createHistory = async (data: Omit<HistoryItem, 'historyId'>): Promise<HistoryItem> => {
    const response = await axios.post('/api/admin/history', data);
    return response.data;
};

// PATCH /api/admin/history/{id}
export const updateHistory = async (id: number, data: Partial<HistoryItem>): Promise<HistoryItem> => {
    const response = await axios.patch(`/api/admin/history/${id}`, data);
    return response.data;
};

// DELETE /api/admin/history/{id}
export const deleteHistory = async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/history/${id}`);
};
