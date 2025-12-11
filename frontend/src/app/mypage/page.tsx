'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getMyProfile,
    updateMyProfile,
    withdraw,
    getMyDonations,
    getMyNotifications,
    markNotificationRead,
    getMyJoinApplication,
    UserProfile,
    Donation,
    Notification,
    JoinApplication,
    updateProfileImage
} from '@/api/memberApi';
const IMAGE_BASE_URL = 'https://d33178k8dca6a2.cloudfront.net';
import { Bell, CreditCard, User, FileText, LogOut, Edit2, Trash2, Check, X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';

export default function MyPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [joinApplication, setJoinApplication] = useState<JoinApplication | null>(null);
    const [loading, setLoading] = useState(true);

    // Active Section State
    const [activeSection, setActiveSection] = useState<'JOIN' | 'NOTIFICATIONS' | 'DONATIONS' | null>(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phoneNumber: '',
        birthDate: '',
        gender: '',
        part: '',
        interests: '',
        myDream: '',
        hashTags: ''
    });

    // Formatters
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatBirthDate = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 4) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    };

    const formatHashTags = (value: string) => {
        const parts = value.split(' ');
        const formattedParts = parts.map(part => {
            if (part === '') return '';
            if (part.startsWith('#')) return part;
            return '#' + part;
        });
        return formattedParts.join(' ');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, donationsData, notificationsData] = await Promise.all([
                getMyProfile(),
                getMyDonations(),
                getMyNotifications()
            ]);

            console.log('Profile Data:', profileData);

            setProfile(profileData);

            // Safely set donations (handle if it's not an array or has a content field)
            const donationsList = Array.isArray(donationsData)
                ? donationsData
                : (Array.isArray((donationsData as any)?.content) ? (donationsData as any).content : []);
            setDonations(donationsList);

            // Safely set notifications
            const notificationsList = Array.isArray(notificationsData)
                ? notificationsData
                : (Array.isArray((notificationsData as any)?.content) ? (notificationsData as any).content : []);
            setNotifications(notificationsList);

            // Initialize edit form
            setEditForm({
                name: profileData.name || '',
                phoneNumber: profileData.phoneNumber || '',
                birthDate: profileData.birthDate || '',
                gender: profileData.gender || 'MALE',
                part: profileData.part || '',
                interests: profileData.interests || '',
                myDream: profileData.myDream || '',
                hashTags: profileData.hashTags || ''
            });

            // Fetch join application separately as it might not exist
            try {
                const joinData = await getMyJoinApplication();
                setJoinApplication(joinData);
            } catch (e) {
                // Ignore if no application found
                console.log('No join application found');
            }
        } catch (error) {
            console.error('Failed to fetch my page data:', error);
            // Handle error (e.g., redirect to login if 401)
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const updated = await updateMyProfile(editForm);
            setProfile(updated);
            setIsEditing(false);
            alert('정보가 수정되었습니다.');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('정보 수정에 실패했습니다.');
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'USER': return '일반 회원';
            case 'MEMBER': return '단원';
            case 'ADMIN': return '관리자';
            default: return '';
        }
    };

    const isMemberOrAdmin = profile && (profile.role === 'MEMBER' || profile.role === 'ADMIN');

    const handleWithdraw = async () => {
        const result = await Swal.fire({
            title: '정말 탈퇴하시겠습니까?',
            html: '탈퇴 시 <scan class="text-red-600 font-bold">계정이 즉시 삭제</scan>되며,<br/>이후 <span class="text-red-600 font-bold">6개월 동안 재가입이 불가능</span>합니다.<br/><br/>이 작업은 되돌릴 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네, 탈퇴합니다',
            cancelButtonText: '취소'
        });

        if (!result.isConfirmed) return;

        try {
            await withdraw();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            await Swal.fire('탈퇴 완료', '회원 탈퇴가 처리되었습니다.', 'success');
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to withdraw:', error);
            Swal.fire('오류', '탈퇴 처리에 실패했습니다.', 'error');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'USER' | 'MEMBER') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        try {
            await updateProfileImage(file, target);
            // Refresh profile to show new image
            const updatedProfile = await getMyProfile();
            setProfile(updatedProfile);
            alert('프로필 이미지가 변경되었습니다.');
        } catch (error) {
            console.error('Failed to update profile image:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
        }
    };

    const handleReadNotification = async (id: number) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n =>
                n.notificationId === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">마이페이지</h1>

            <div className="space-y-8">
                {/* Top Section: Profile */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6 text-primary" />
                            내 정보
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-primary transition-colors font-medium"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>정보 수정</span>
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-md"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>저장</span>
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    <X className="w-4 h-4" />
                                    <span>취소</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* Header: Name & Role */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* User Profile Image */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all">
                                        {profile.profileImageKey ? (
                                            <img
                                                src={profile.profileImageKey.startsWith('http') ? profile.profileImageKey : `${IMAGE_BASE_URL}${profile.profileImageKey}`}
                                                alt={profile.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-primary" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => document.getElementById('user-image-input')?.click()}
                                        className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-primary hover:border-primary transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="file"
                                        id="user-image-input"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'USER')}
                                    />
                                </div>
                                <span className="text-xs font-medium text-gray-500">기본 프로필</span>
                            </div>

                            {/* Member Profile Image (MEMBER or ADMIN) */}
                            {(profile.role === 'MEMBER' || profile.role === 'ADMIN') && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative group">
                                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-transparent group-hover:border-blue-200 transition-all">
                                            {profile.memberProfileImageKey ? (
                                                <img
                                                    src={profile.memberProfileImageKey.startsWith('http') ? profile.memberProfileImageKey : `${IMAGE_BASE_URL}${profile.memberProfileImageKey}`}
                                                    alt="Member Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-blue-300">
                                                    <User className="w-8 h-8 mb-1" />
                                                    <span className="text-[10px] font-bold">단원용</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => document.getElementById('member-image-input')?.click()}
                                            className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="file"
                                            id="member-image-input"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'MEMBER')}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-blue-500">단원 프로필</span>
                                </div>
                            )}
                            <div className="flex-grow text-center md:text-left space-y-2">
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="text-2xl font-bold text-gray-900 border-b-2 border-primary/20 focus:border-primary outline-none px-2 py-1"
                                        />
                                    ) : (
                                        <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
                                    )}
                                    {profile.role !== 'GUEST' && (
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-sm font-bold",
                                            profile.role === 'ADMIN' ? "bg-red-100 text-red-700" :
                                                profile.role === 'MEMBER' ? "bg-blue-100 text-blue-700" :
                                                    "bg-green-100 text-green-700"
                                        )}>
                                            {getRoleLabel(profile.role)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500">{profile.email}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Phone */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm text-gray-500 block mb-2 font-medium">전화번호</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editForm.phoneNumber}
                                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: formatPhoneNumber(e.target.value) })}
                                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        placeholder="010-0000-0000"
                                        maxLength={13}
                                    />
                                ) : (
                                    <p className="font-bold text-gray-900">{profile.phoneNumber || '-'}</p>
                                )}
                            </div>

                            {/* Birth Date */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm text-gray-500 block mb-2 font-medium">생년월일</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.birthDate}
                                        onChange={(e) => setEditForm({ ...editForm, birthDate: formatBirthDate(e.target.value) })}
                                        placeholder="YYYY-MM-DD"
                                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        maxLength={10}
                                    />
                                ) : (
                                    <p className="font-bold text-gray-900">{profile.birthDate || '-'}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm text-gray-500 block mb-2 font-medium">성별</label>
                                {isEditing ? (
                                    <select
                                        value={editForm.gender}
                                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    >
                                        <option value="">선택</option>
                                        <option value="MALE">남성</option>
                                        <option value="FEMALE">여성</option>
                                    </select>
                                ) : (
                                    <p className="font-bold text-gray-900">
                                        {profile.gender === 'MALE' ? '남성' :
                                            profile.gender === 'FEMALE' ? '여성' : '-'}
                                    </p>
                                )}
                            </div>

                            {/* Part (Member Only) */}
                            {isMemberOrAdmin && (
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="text-sm text-gray-500 block mb-2 font-medium">파트</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.part}
                                            onChange={(e) => setEditForm({ ...editForm, part: e.target.value })}
                                            placeholder="예: 소프라노"
                                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    ) : (
                                        <p className="font-bold text-gray-900">{profile.part || '-'}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Extended Info (Member Only) - Full Width Grid */}
                        {isMemberOrAdmin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-5 rounded-xl">
                                    <label className="text-sm text-gray-500 block mb-2 font-medium">관심사</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.interests}
                                            onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                                            placeholder="예: 여행, 독서"
                                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{profile.interests || '-'}</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-5 rounded-xl">
                                    <label className="text-sm text-gray-500 block mb-2 font-medium">나의 꿈</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.myDream}
                                            onChange={(e) => setEditForm({ ...editForm, myDream: e.target.value })}
                                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{profile.myDream || '-'}</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-5 rounded-xl md:col-span-2">
                                    <label className="text-sm text-gray-500 block mb-2 font-medium">해시태그</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.hashTags}
                                            onChange={(e) => setEditForm({ ...editForm, hashTags: formatHashTags(e.target.value) })}
                                            placeholder="#음악 #합창"
                                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900 text-primary">{profile.hashTags || '-'}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                회원 탈퇴
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Activities */}
                <div className="space-y-6">
                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setActiveSection(activeSection === 'JOIN' ? null : 'JOIN')}
                            className={cn(
                                "p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 group",
                                activeSection === 'JOIN'
                                    ? "bg-primary text-white border-primary shadow-lg scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:shadow-md"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-full transition-colors",
                                activeSection === 'JOIN' ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                            )}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">입단 신청 현황</span>
                        </button>
                        <button
                            onClick={() => setActiveSection(activeSection === 'NOTIFICATIONS' ? null : 'NOTIFICATIONS')}
                            className={cn(
                                "p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 group",
                                activeSection === 'NOTIFICATIONS'
                                    ? "bg-primary text-white border-primary shadow-lg scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:shadow-md"
                            )}
                        >
                            <div className="relative">
                                <div className={cn(
                                    "p-3 rounded-full transition-colors",
                                    activeSection === 'NOTIFICATIONS' ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                                )}>
                                    <Bell className="w-6 h-6" />
                                </div>
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <span className="font-bold text-lg">알림</span>
                        </button>
                        <button
                            onClick={() => setActiveSection(activeSection === 'DONATIONS' ? null : 'DONATIONS')}
                            className={cn(
                                "p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 group",
                                activeSection === 'DONATIONS'
                                    ? "bg-primary text-white border-primary shadow-lg scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:shadow-md"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-full transition-colors",
                                activeSection === 'DONATIONS' ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                            )}>
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">후원 내역</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="transition-all duration-300 ease-in-out">
                        {/* Join Application Status */}
                        {activeSection === 'JOIN' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <FileText className="w-6 h-6 text-primary" />
                                    입단 신청 현황
                                </h2>
                                {joinApplication ? (
                                    <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg mb-2">드림쇼콰이어 입단 신청</p>
                                            <p className="text-gray-500">신청일: {new Date(joinApplication.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={cn(
                                            "px-4 py-2 rounded-full font-bold",
                                            joinApplication.status === 'APPROVED' ? "bg-green-100 text-green-700" :
                                                joinApplication.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {joinApplication.status === 'APPROVED' ? '승인됨' :
                                                joinApplication.status === 'REJECTED' ? '반려됨' : '심사중'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
                                        <p className="text-lg">입단 신청 내역이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications */}
                        {activeSection === 'NOTIFICATIONS' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <Bell className="w-6 h-6 text-primary" />
                                    알림
                                </h2>
                                {notifications.length > 0 ? (
                                    <div className="space-y-4">
                                        {notifications.map((noti) => (
                                            <div
                                                key={noti.notificationId}
                                                onClick={() => !noti.isRead && handleReadNotification(noti.notificationId)}
                                                className={cn(
                                                    "p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                                                    noti.isRead
                                                        ? "bg-white border-gray-100 text-gray-500"
                                                        : "bg-blue-50/50 border-blue-100 text-gray-900 hover:bg-blue-50"
                                                )}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="flex-grow text-base">{noti.message}</p>
                                                    <span className="text-sm whitespace-nowrap opacity-60">
                                                        {new Date(noti.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
                                        <p className="text-lg">새로운 알림이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Donation History */}
                        {activeSection === 'DONATIONS' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    후원 내역
                                </h2>
                                {donations.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600">
                                                <tr>
                                                    <th className="px-6 py-4 rounded-l-lg">날짜</th>
                                                    <th className="px-6 py-4">유형</th>
                                                    <th className="px-6 py-4">금액</th>
                                                    <th className="px-6 py-4 rounded-r-lg">상태</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {donations.map((donation) => (
                                                    <tr key={donation.donationId} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">{new Date(donation.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            {donation.type === 'REGULAR' ? '정기후원' : '일시후원'}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            {donation.amount.toLocaleString()}원
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                                donation.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                                                                    donation.status === 'FAILED' ? "bg-red-100 text-red-700" :
                                                                        "bg-yellow-100 text-yellow-700"
                                                            )}>
                                                                {donation.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
                                        <p className="text-lg">후원 내역이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
