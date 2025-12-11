import axios from '@/lib/axios';

export interface JoinApplication {
    joinId: number;
    userId: number;
    part: string;
    interests: string;
    myDream: string;
    hashTags: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface ApplicationForm {
    part: string;
    interests: string;
    myDream: string;
    hashTags: string;
    profileImage?: string;
}

export const getMyApplication = async (): Promise<JoinApplication[]> => {
    const response = await axios.get('/api/join/me');
    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
};

export const submitApplication = async (data: ApplicationForm): Promise<void> => {
    await axios.post('/api/join', data);
};
