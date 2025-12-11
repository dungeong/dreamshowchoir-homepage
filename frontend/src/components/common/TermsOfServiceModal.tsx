'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface TermsOfServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900">서비스 이용약관</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto text-gray-700 space-y-6 leading-relaxed text-lg">
                    <section>
                        <h4 className="font-bold text-xl mb-2">제1조 (목적)</h4>
                        <p>이 약관은 <strong>사회적협동조합 드림쇼콰이어(이하 "단체")</strong>가 제공하는 웹사이트 및 관련 서비스(이하 "서비스")의 이용과 관련하여 단체와 이용자 간의 권리, 의무 및 책임을 규정함을 목적으로 합니다.</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제2조 (정의)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>이용자 : 본 약관에 따라 단체가 제공하는 서비스를 이용하는 모든 개인 또는 단체</li>
                            <li>회원 : 단체에 개인정보를 제공하여 회원가입을 한 자로, OAuth(네이버, 카카오, 구글, 페이스북)를 통해 인증된 사용자</li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제3조 (이용 계약의 성립)</h4>
                        <p>이용계약은 이용자가 본 약관에 동의하고, OAuth 인증 절차를 완료함으로써 성립합니다.</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제4조 (서비스 이용 및 제한)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>회원은 단원 전용 서비스(공지사항, 자료실 등)에 접근 가능하며, 단체 관리자의 승인을 통해 단원 자격을 부여받습니다.</li>
                            <li>단체는 법령, 약관, 또는 서비스 정책에 따라 회원의 서비스 이용을 제한할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제5조 (개인정보 보호)</h4>
                        <p>단체는 이용자의 개인정보를 「개인정보보호법」 및 관련 법령에 따라 안전하게 관리하며, 개인정보취급방침에 따릅니다. <strong>특히 회원 탈퇴 시 개인정보는 즉시 파기하는 것을 원칙으로 하나, 부정 이용 방지 및 서비스 혼선 방지를 위해 일부 정보(OAuth ID, 이메일 등)는 탈퇴일로부터 6개월간 보관됩니다.</strong> 개인정보는 단체의 개인정보 보호책임자(이동영, 이메일 : dreamshowchoir0524@gmail.com, 전화 : 010-2535-2095)가 관리하며, 열람/수정/삭제 요청은 마이페이지 또는 문의로 가능합니다.</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제6조 (면책 조항)</h4>
                        <p>단체는 천재지변, 서비스 유지보수, 통신 장애, 또는 제3자에 의한 서비스 공격(예 : DDoS) 등 불가항력적인 사유로 인해 발생한 서비스 중단에 대해서는 책임을 지지 않습니다. 단, 정기 점검 시 사전 공지를 하여 이용자 불편을 최소화합니다.</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제7조 (저작권 정책)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>서비스에 게시된 모든 콘텐츠(글, 이미지, 음원 등)는 단체 또는 해당 저작권자에게 귀속됩니다.</li>
                            <li>회원이 업로드한 콘텐츠에 대한 저작권은 회원에게 있으며, 서비스 이용 시 단체는 이를 홍보 목적으로 사용할 수 있습니다(이용자 동의 필요).</li>
                            <li>저작권 침해 신고는 개인정보 보호책임자에게 연락(이메일 : dreamshowchoir0524@gmail.com) 가능.</li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제8조 (서비스 중단 정책)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>단체는 시스템 점검, 서버 유지보수, 또는 긴급 상황 시 서비스를 일시 중단할 수 있습니다.</li>
                            <li>중단 전 최소 24시간 전 공지(웹사이트 또는 이메일)를 하며, 긴급 상황 시 사후 공지 가능.</li>
                            <li>중단으로 인한 손해에 대해서는 제6조 면책 조항에 따름.</li>
                        </ol>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        확인했습니다
                    </button>
                </div>
            </div>

            {/* Backdrop Click to Close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
