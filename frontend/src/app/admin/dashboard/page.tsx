'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardCommon } from '@/api/dashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    MessageCircle,
    DollarSign,
    Calendar,
    FileText,
    ArrowRight,
    TrendingUp,
    UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { data: dashboard, isLoading, isError } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: getDashboardCommon,
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !dashboard) {
        return <div className="p-8 text-center text-red-500">대시보드 데이터를 불러오는데 실패했습니다.</div>;
    }

    // Currency Formatter
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

            {/* 1. Status Cards (Pending Tasks) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard
                    title="가입 대기"
                    count={dashboard.pendingJoins}
                    icon={<UserPlus className="h-6 w-6 text-blue-500" />}
                    href="/admin/users"
                    alertColor="text-blue-600"
                />
                <StatusCard
                    title="문의 대기"
                    count={dashboard.pendingInquiries}
                    icon={<MessageCircle className="h-6 w-6 text-orange-500" />}
                    href="/admin/inquiries"
                    alertColor="text-orange-600"
                />
                <StatusCard
                    title="후원 대기"
                    count={dashboard.pendingDonations}
                    icon={<DollarSign className="h-6 w-6 text-green-500" />}
                    href="/admin/donations"
                    alertColor="text-green-600"
                />
            </div>

            {/* 2. Monthly Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="총 단원 수"
                    value={`${dashboard.totalMembers}명`}
                    icon={<Users className="h-4 w-4 text-gray-500" />}
                />
                <StatCard
                    title="이번 달 신규 가입"
                    value={`${dashboard.newMembersCount}명`}
                    icon={<TrendingUp className="h-4 w-4 text-gray-500" />}
                />
                <StatCard
                    title="이번 달 후원금"
                    value={formatCurrency(dashboard.monthlyDonationAmount)}
                    icon={<DollarSign className="h-4 w-4 text-gray-500" />}
                />
            </div>

            {/* 3. Bottom Row: Schedules & Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Schedules */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">곧 다가오는 일정</CardTitle>
                        <Link href="/admin/schedules" className="text-sm text-gray-500 hover:text-primary flex items-center">
                            전체보기 <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboard?.upcomingSchedules.length > 0 ? (
                                dashboard.upcomingSchedules.map((schedule) => (
                                    <div key={schedule.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 w-12 h-12">
                                                <span className="text-xs font-bold text-gray-500">{format(new Date(schedule.start), 'MMM')}</span>
                                                <span className="text-sm font-bold text-gray-900">{format(new Date(schedule.start), 'dd')}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{schedule.summary}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(schedule.start), 'HH:mm')}
                                                    {schedule.location ? ` | ${schedule.location}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <DDayBadge date={schedule.start} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">예정된 일정이 없습니다.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Posts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">최근 게시글</CardTitle>
                        <Link href="/admin/board/posts" className="text-sm text-gray-500 hover:text-primary flex items-center">
                            전체보기 <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboard?.recentPosts.length > 0 ? (
                                dashboard.recentPosts.map((post) => (
                                    <div key={post.postId} className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-gray-900 truncate pr-2">{post.title}</span>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">{format(new Date(post.createdAt), 'yyyy.MM.dd')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <FileText className="h-3 w-3" />
                                            <span>{post.authorName}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">게시글이 없습니다.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Helper Components ---

function StatusCard({ title, count, icon, href, alertColor }: { title: string, count: number, icon: React.ReactNode, href: string, alertColor: string }) {
    return (
        <Link href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <h3 className={`text-2xl font-bold mt-1 ${count > 0 ? alertColor : 'text-gray-900'}`}>{count}건</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-full">
                        {icon}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">{title}</span>
                    {icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
            </CardContent>
        </Card>
    );
}

function DDayBadge({ date }: { date: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let label = '';
    let colorClass = 'bg-gray-100 text-gray-600';

    if (diffDays === 0) {
        label = 'D-Day';
        colorClass = 'bg-red-100 text-red-600';
    } else if (diffDays > 0) {
        label = `D-${diffDays}`;
        if (diffDays <= 3) colorClass = 'bg-orange-100 text-orange-600';
        else if (diffDays <= 7) colorClass = 'bg-blue-100 text-blue-600';
    } else {
        return null; // Past event
    }

    return (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${colorClass}`}>
            {label}
        </span>
    );
}
