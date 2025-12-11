import axios from '@/lib/axios';
import { ScheduleDto } from './scheduleApi';

export interface LatestPostDto {
    postId: number;
    title: string;
    authorName: string;
    createdAt: string;
}

export interface DashboardDto {
    pendingJoins: number;
    pendingInquiries: number;
    pendingDonations: number;
    totalMembers: number;
    monthlyDonationAmount: number;
    newMembersCount: number;
    upcomingSchedules: ScheduleDto[];
    recentPosts: LatestPostDto[];
}

export const getDashboardCommon = async (): Promise<DashboardDto> => {
    console.log('[DashboardApi] Requesting dashboard data...');
    try {
        const response = await axios.get('/api/admin/dashboard');
        console.log('[DashboardApi] API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[DashboardApi] Failed to fetch dashboard data:', error);
        throw error;
    }
};
