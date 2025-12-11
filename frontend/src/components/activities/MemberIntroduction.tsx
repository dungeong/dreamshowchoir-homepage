'use client';

import { useState, useEffect } from 'react';
import { getMembers, Member } from '@/api/memberApi';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const parts = ['전체', '소프라노', '알토', '테너', '베이스'];

export function MemberIntroduction() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPart, setSelectedPart] = useState('전체');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setPage(0); // Reset page when part changes
    }, [selectedPart]);

    useEffect(() => {
        fetchMembers(selectedPart, page);
    }, [selectedPart, page]);

    const fetchMembers = async (part: string, pageNum: number) => {
        setLoading(true);
        try {
            const data = await getMembers(pageNum, 12, part === '전체' ? undefined : part);

            if (data && Array.isArray(data.content)) {
                setMembers(data.content);
                setTotalPages(data.totalPages);
            } else {
                setMembers([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
            // Fallback dummy data
            const dummyMembers: Member[] = [
                {
                    id: 1,
                    name: '강호동',
                    part: '베이스',
                    interests: '씨름, 바베큐, 예능 토크',
                    myDream: '웃음 전파',
                    hashTags: '#씨름보스 #고기마스터 #베이스폭소',
                    profileImageUrl: ''
                },
                {
                    id: 2,
                    name: '김유신',
                    part: '테너',
                    interests: '화랑 훈련, 삼국 통일, 말타기, 전술',
                    myDream: '신라의 화음 장악',
                    hashTags: '#화랑테너 #삼국스타 #전장의록스타',
                    profileImageUrl: ''
                },
                {
                    id: 3,
                    name: '노진구',
                    part: '테너',
                    interests: '도라에몽, 만화책, 게임기, 잠자기',
                    myDream: '시험 100점',
                    hashTags: '#도라에몽친구 #실뜨기고수',
                    profileImageUrl: ''
                },
                {
                    id: 4,
                    name: '신짱구',
                    part: '테너',
                    interests: '초코비, 액션가면, 이쁜 누나',
                    myDream: '초코비 왕국',
                    hashTags: '#짱구는못말려 #테너장난꾸러기 #초코비매니아',
                    profileImageUrl: ''
                },
                {
                    id: 5,
                    name: '아이유',
                    part: '소프라노',
                    interests: '작곡, 기타 연주, 독서',
                    myDream: '음악으로 위로하기',
                    hashTags: '#국힙원탑 #음색요정 #소프라노여신',
                    profileImageUrl: ''
                },
                {
                    id: 6,
                    name: '박보영',
                    part: '알토',
                    interests: '연기, 베이킹, 게임',
                    myDream: '국민 여동생',
                    hashTags: '#뽀블리 #알토요정 #연기천재',
                    profileImageUrl: ''
                }
            ];

            let filtered = part === '전체' ? dummyMembers : dummyMembers.filter(m => m.part === part);

            // Simulate pagination for dummy data
            const start = pageNum * 12;
            const end = start + 12;
            setMembers(filtered.slice(start, end));
            setTotalPages(Math.ceil(filtered.length / 12));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h3 className="text-3xl font-bold mb-4 text-primary">단원 소개</h3>
                <p className="text-gray-600 mb-8">드림쇼콰이어와 함께하는 단원들을 소개합니다.</p>

                {/* Part Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-2">
                    {parts.map((part) => (
                        <button
                            key={part}
                            onClick={() => setSelectedPart(part)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                selectedPart === part
                                    ? "bg-primary text-white shadow-md transform scale-105"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-primary/30"
                            )}
                        >
                            {part}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
            ) : members.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {members.map((member, index) => (
                            <div key={member.id || index} className="flex gap-6 bg-white border border-gray-100 p-6 rounded-xl hover:shadow-lg transition-shadow group">
                                {/* Profile Image */}
                                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden group-hover:ring-2 ring-primary/20 transition-all">
                                    {member.profileImageUrl ? (
                                        <img src={member.profileImageUrl} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-300 group-hover:text-primary/50 transition-colors" />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-2 text-sm">
                                    <div className="flex items-center mb-2">
                                        <span className="text-lg font-bold text-gray-900 mr-2">{member.name}</span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium border border-blue-100">
                                            {member.part}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex">
                                            <span className="w-16 font-semibold text-gray-500 shrink-0">관심사</span>
                                            <span className="text-gray-700 break-keep">{member.interests}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-16 font-semibold text-gray-500 shrink-0">나의 꿈</span>
                                            <span className="text-gray-700 break-keep">{member.myDream}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 flex flex-wrap gap-2">
                                        {member.hashTags && member.hashTags.split(' ').map((tag, idx) => (
                                            <span key={idx} className="text-blue-500 text-xs font-medium bg-blue-50 px-2 py-1 rounded-md">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-12">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                이전
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={cn(
                                        "w-10 h-10 rounded-lg font-medium transition-colors",
                                        page === i
                                            ? "bg-primary text-white"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    해당 파트의 단원 정보가 없습니다.
                </div>
            )}
        </div>
    );
}
