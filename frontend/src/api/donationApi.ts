import axios from '@/lib/axios';

export interface DonationRequest {
    amount: number;
    type: 'REGULAR' | 'ONE_TIME'; // Using ONE_TIME to match common conventions, will confirm if user meant ONETIME literal. Prompt said "ONETIME" but consistency with enums is usually ONE_TIME. I will stick to prompt "ONETIME" if strictly required but usually it's upper snake case. Let me use string union to be safe or check if Zod schema was discussed before.
    // Previous logs showed "ONE_TIME" in donation checks. I'll support both or stick to one. User prompt said: type: "REGULAR" | "ONETIME" // or equivalent string
    // I will use 'REGULAR' | 'ONE_TIME' as it is standard.
}

export interface DonationResponse {
    donationId: number;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
}

export const submitDonation = async (data: DonationRequest): Promise<DonationResponse> => {
    // Ensuring type matches backend expectation.
    const response = await axios.post('/api/donations', data);
    return response.data;
};

export interface DonorDto {
    donorName: string | null;
    amount: number;
    date: string;
    type: 'REGULAR' | 'ONE_TIME';
}

export const getDonors = async (): Promise<DonorDto[]> => {
    const response = await axios.get('/api/donations/donors');
    return response.data;
};
