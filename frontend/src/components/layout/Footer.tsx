'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import { TermsOfServiceModal } from '@/components/common/TermsOfServiceModal';

export function Footer() {
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    return (
        <footer className="bg-secondary text-secondary-foreground py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 mb-8">
                        <h3 className="text-2xl font-bold text-primary mb-4 md:mb-0">Dream Show Choir</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsTermsOpen(true)}
                                className="text-sm hover:text-primary transition-colors"
                            >
                                서비스 이용약관
                            </button>
                            <button
                                onClick={() => setIsPrivacyOpen(true)}
                                className="text-sm hover:text-primary transition-colors"
                            >
                                개인정보취급방침
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm opacity-80">
                        <p>상호 : 사회적협동조합 드림쇼콰이어 | 대표 : 조이안 | 고유번호 : 731-80-02083</p>
                        <p>주소 : 울산광역시 중구 학성로 101 4층</p>
                        <p>전화번호 : 010-5592-0970 | 이메일 : dreamshowchoir0524@gmail.com</p>
                        <p>사이트 제작 : 이동영</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 text-center text-xs opacity-60">
                    Copyright© 사회적협동조합 드림쇼콰이어, All rights reserved
                </div>
            </div>

            <PrivacyPolicyModal
                isOpen={isPrivacyOpen}
                onClose={() => setIsPrivacyOpen(false)}
            />
            <TermsOfServiceModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
            />
        </footer>
    );
}
