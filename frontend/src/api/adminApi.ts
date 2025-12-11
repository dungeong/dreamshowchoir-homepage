import axios from '@/lib/axios';

// -- User Management --

export interface User {
    userId: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER' | 'USER';
    part?: string;
    createdAt: string;
}

export interface UserResponse {
    content: User[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

// GET /api/admin/users
export const getUsers = async (
    page: number = 0,
    size: number = 10,
    role?: string,
    name?: string
): Promise<UserResponse> => {
    const params: any = { page, size, sort: 'userId,desc' };
    if (role && role !== 'ALL') params.role = role;
    if (name) params.name = name;

    const response = await axios.get('/api/admin/users', { params });
    return response.data;
};

// PATCH /api/admin/users/{userId}/role
export const updateUserRole = async (userId: number, role: 'ADMIN' | 'MEMBER' | 'USER'): Promise<void> => {
    await axios.patch(`/api/admin/users/${userId}/role`, { role });
};

// DELETE /api/admin/users/{userId}
export const deleteUser = async (userId: number): Promise<void> => {
    await axios.delete(`/api/admin/users/${userId}`);
};

// -- Join Application Management --

export interface JoinApplication {
    joinId: number;
    userId: number;
    userName: string;
    userEmail: string;
    userPhoneNumber: string;
    part: string;
    interests?: string;
    myDream?: string;
    hashTags?: string;
    profileImageKey?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface JoinApplicationResponse {
    content: JoinApplication[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

// GET /api/admin/join-applications
export const getJoinApplications = async (page: number = 0, size: number = 10): Promise<JoinApplicationResponse> => {
    const response = await axios.get('/api/admin/join-applications', {
        params: { page, size, sort: 'createdAt,desc', status: 'PENDING' }
    });
    return response.data;
};

// PATCH /api/admin/join-applications/{joinId}
export const updateJoinStatus = async (joinId: number, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    await axios.patch(`/api/admin/join-applications/${joinId}`, { status });
};

// -- Donation Management --

export type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type DonationType = 'REGULAR' | 'ONE_TIME';

export interface Donation {
    donationId: number;
    donorName: string | null;
    donorEmail: string | null;
    donorPhone: string | null;
    amount: number;
    type: DonationType;
    status: DonationStatus;
    createdAt: string;
}

export interface DonationResponse {
    content: Donation[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
}

// GET /api/admin/donations
export const getDonations = async (
    page: number = 0,
    size: number = 10,
    status?: DonationStatus | 'ALL'
): Promise<DonationResponse> => {
    const params: any = { page, size, sort: 'createdAt,desc' };
    if (status && status !== 'ALL') {
        params.status = status;
    }
    const response = await axios.get('/api/admin/donations', { params });
    return response.data;
};

// PATCH /api/admin/donations/{donationId}
export const updateDonationStatus = async (donationId: number, status: DonationStatus): Promise<void> => {
    await axios.patch(`/api/admin/donations/${donationId}`, { status });
};
