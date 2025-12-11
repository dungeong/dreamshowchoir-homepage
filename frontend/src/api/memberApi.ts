import axios from '@/lib/axios';

export interface Member {
    id: number;
    name: string;
    part: string;
    interests: string;
    myDream: string;
    hashTags: string;
    profileImageUrl: string;
}

export interface MemberResponse {
    content: Member[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface UserProfile {
    userId: number;
    email: string;
    name: string;
    profileImageKey?: string;
    memberProfileImageKey?: string;
    profileImageUrl?: string;
    role: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: string;
    termsAgreed?: boolean;
    part?: string;
    interests?: string;
    myDream?: string;
    hashTags?: string;
    isPublic?: boolean;
}

export interface UserProfileUpdate {
    name?: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: string;
    part?: string;
    interests?: string;
    myDream?: string;
    hashTags?: string;
}

export interface Donation {
    donationId: number;
    userId: number;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
}

export interface Notification {
    notificationId: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface JoinApplication {
    joinId: number;
    userId: number;
    part: string;
    interests: string;
    myDream: string;
    hashTags: string;
    status: string;
    createdAt: string;
}

export interface SignUpRequest {
    name: string;
    phoneNumber: string;
    birthDate: string;
    gender: string;
    termsAgreed: boolean;
    terms_agreed?: boolean;
}

export const getMembers = async (page: number = 0, size: number = 20, part?: string): Promise<MemberResponse> => {
    try {
        let url = `/api/info/members?page=${page}&size=${size}`;
        if (part && part !== '전체') {
            url += `&part=${part}`;
        }
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch members:', error);
        throw error;
    }
};

export const getMyProfile = async (): Promise<UserProfile> => {
    const response = await axios.get('/api/users/me');
    return response.data;
};

export const updateMyProfile = async (data: UserProfileUpdate): Promise<UserProfile> => {
    const response = await axios.patch('/api/users/me', data);
    return response.data;
};

export const updateProfileImage = async (file: File, target: 'USER' | 'MEMBER'): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await axios.patch(`/api/users/me/image?target=${target}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const withdraw = async (): Promise<void> => {
    await axios.delete('/api/users/me');
};

export const getMyDonations = async (): Promise<Donation[]> => {
    const response = await axios.get('/api/donations/my');
    return response.data;
};

export const getMyNotifications = async (): Promise<Notification[]> => {
    const response = await axios.get('/api/notifications');
    return response.data;
};

export const markNotificationRead = async (notificationId: number): Promise<void> => {
    await axios.patch(`/api/notifications/${notificationId}/read`);
};

export const getMyJoinApplication = async (): Promise<JoinApplication> => {
    const response = await axios.get('/api/join/me');
    return response.data;
};

export const signUp = async (data: SignUpRequest): Promise<void> => {
    const payload = {
        ...data,
        terms_agreed: data.termsAgreed
    };
    await axios.patch('/api/users/sign-up', payload);
};

export const getRoleLabel = (role: string) => {
    switch (role) {
        case 'ADMIN': return '관리자';
        case 'MEMBER': return '정단원';
        case 'GUEST': return '준회원';
        default: return role;
    }
};
