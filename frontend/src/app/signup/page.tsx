'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, getMyProfile } from '@/api/memberApi';
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        birthDate: '',
        gender: 'MALE',
        termsAgreed: false
    });
    const [loading, setLoading] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

    useEffect(() => {
        // Pre-fill form with available profile data
        getMyProfile().then(profile => {
            setFormData(prev => ({
                ...prev,
                name: profile.name || prev.name,
                phoneNumber: profile.phoneNumber || prev.phoneNumber,
                birthDate: profile.birthDate || prev.birthDate,
                gender: profile.gender || prev.gender
            }));
        }).catch(() => {
            // Ignore error if profile fetch fails
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.termsAgreed) {
            alert('개인정보 취급방침에 동의해주세요.');
            return;
        }

        setLoading(true);
        try {
            await signUp({
                ...formData,
                // Ensure format matches API expectations
                phoneNumber: formData.phoneNumber,
                birthDate: formData.birthDate,
                gender: formData.gender
            });
            alert('가입이 완료되었습니다!');
            window.location.href = '/mypage';
        } catch (error) {
            console.error('Sign up failed:', error);
            alert('가입 처리에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
                        추가 정보 입력
                    </h2>
                    <p className="mt-4 text-center text-lg text-gray-600">
                        원활한 활동을 위해 추가 정보를 입력해주세요.
                    </p>
                </div>
                <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="-space-y-px">
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-lg font-bold text-gray-700 mb-2">이름</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-4 border-0 bg-gray-50 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="phoneNumber" className="block text-lg font-bold text-gray-700 mb-2">전화번호 (010-0000-0000)</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                placeholder="010-1234-5678"
                                className="appearance-none rounded-xl relative block w-full px-4 py-4 border-0 bg-gray-50 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    let formatted = value;
                                    if (value.length > 3 && value.length <= 7) {
                                        formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
                                    } else if (value.length > 7) {
                                        formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
                                    }
                                    setFormData({ ...formData, phoneNumber: formatted });
                                }}
                                maxLength={13}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="birthDate" className="block text-lg font-bold text-gray-700 mb-2">생년월일</label>
                            <input
                                id="birthDate"
                                name="birthDate"
                                type="text"
                                inputMode="numeric"
                                required
                                placeholder="생년월일 8자리 (예: 19901225)"
                                className="appearance-none rounded-xl relative block w-full px-4 py-4 border-0 bg-gray-50 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.birthDate}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    let formatted = value;
                                    if (value.length > 4 && value.length <= 6) {
                                        formatted = `${value.slice(0, 4)}-${value.slice(4)}`;
                                    } else if (value.length > 6) {
                                        formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
                                    }
                                    setFormData({ ...formData, birthDate: formatted });
                                }}
                                maxLength={10}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="gender" className="block text-lg font-bold text-gray-700 mb-2">성별</label>
                            <select
                                id="gender"
                                name="gender"
                                className="appearance-none rounded-xl relative block w-full px-4 py-4 border-0 bg-gray-50 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="MALE">남성</option>
                                <option value="FEMALE">여성</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            className="h-6 w-6 text-primary focus:ring-primary border-gray-300 rounded"
                            checked={formData.termsAgreed}
                            onChange={(e) => setFormData({ ...formData, termsAgreed: e.target.checked })}
                        />
                        <label htmlFor="terms" className="ml-3 block text-base text-gray-900">
                            <button
                                type="button"
                                onClick={() => setIsPrivacyModalOpen(true)}
                                className="text-primary hover:underline cursor-pointer font-bold focus:outline-none"
                            >
                                개인정보 취급방침
                            </button>
                            에 동의합니다.
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                        >
                            {loading ? '처리 중...' : '가입 완료'}
                        </button>
                    </div>
                </form>
            </div>
            <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
            />
        </div>
    );
}
