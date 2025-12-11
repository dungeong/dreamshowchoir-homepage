
import axios from '@/lib/axios';

export interface ScheduleDto {
    id: string; // Google Event ID
    summary: string;
    description: string;
    location: string;
    start: string; // ISO String
    end: string;   // ISO String
}

export interface ScheduleCreateDto {
    summary: string;
    description?: string;
    location?: string;
    start: string; // ISO String
    end: string;   // ISO String
}

export interface ScheduleUpdateDto {
    summary?: string;
    description?: string;
    location?: string;
    start?: string;
    end?: string;
}

export type ScheduleType = 'practice' | 'performance';

// GET /api/schedule/{type}
export const getSchedules = async (type: ScheduleType, year?: number, month?: number): Promise<ScheduleDto[]> => {
    // Endpoints: /api/schedule/practice?year=2024&month=12
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    // axios handles query params nicely too, but string construction is fine
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axios.get(`/api/schedule/${type}${queryString}`);
    return response.data;
};

// POST /api/admin/schedule/{type}
export const createSchedule = async (type: ScheduleType, dto: ScheduleCreateDto): Promise<void> => {
    await axios.post(`/api/admin/schedule/${type}`, dto);
};

// PATCH /api/admin/schedule/{type}/{eventId}
export const updateSchedule = async (type: ScheduleType, eventId: string, dto: ScheduleUpdateDto): Promise<void> => {
    await axios.patch(`/api/admin/schedule/${type}/${eventId}`, dto);
};

// DELETE /api/admin/schedule/{type}/{eventId}
export const deleteSchedule = async (type: ScheduleType, eventId: string): Promise<void> => {
    await axios.delete(`/api/admin/schedule/${type}/${eventId}`);
};
