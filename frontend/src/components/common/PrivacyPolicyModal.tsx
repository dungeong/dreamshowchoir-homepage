'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
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
                    <h3 className="text-2xl font-bold text-gray-900">개인정보 취급방침</h3>
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
                        <h4 className="font-bold text-xl mb-2">제1조 (개인정보의 수집 항목 및 이용 목적)</h4>
                        <p>단체는 다음과 같은 개인정보를 수집·이용합니다:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>필수 항목</strong> : 이름, 이메일, OAuth 제공자 ID</li>
                            <li><strong>선택 항목</strong> : 생년월일, 연락처, 프로필 사진</li>
                            <li><strong>이용 목적</strong> : 회원 식별 및 서비스 제공, 단원 가입 심사, 후원 관리, 알림 전달</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제2조 (개인정보의 수집 방법)</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>OAuth 인증(네이버, 카카오, 구글, 페이스북)을 통해 수집</li>
                            <li>회원가입 시 추가 입력 정보 및 프로필 업로드</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제3조 (개인정보의 보유 및 이용 기간)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>단체는 원칙적으로 이용자의 회원 탈퇴 요청 시 수집된 개인정보를 <strong>즉시 파기</strong>합니다.</li>
                            <li>단, <strong>부정 이용 방지 및 서비스 혼선 방지</strong>를 위해 <strong>내부 방침</strong>에 따라 아래 정보를 일정 기간 보관합니다:
                                <ul className="list-circle pl-5 mt-1 space-y-1">
                                    <li><strong>보존 항목</strong>: OAuth 제공자, OAuth ID, 이메일(식별용), 탈퇴 일시</li>
                                    <li><strong>보존 사유</strong>: 불량 회원의 부정한 이용 재발 방지, 악의적 재가입 제한, 서비스 운영의 혼선 방지</li>
                                    <li><strong>보존 기간</strong>: <strong>탈퇴일로부터 6개월</strong></li>
                                </ul>
                            </li>
                            <li>관련 법령에 따라 보존이 필요한 경우, 아래와 같이 해당 기간 동안 보관합니다:
                                <ul className="list-circle pl-5 mt-1 space-y-1">
                                    <li><strong>후원 및 결제 기록</strong>: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                                    <li><strong>로그인 기록(IP, 접속일시 등)</strong>: 3개월 (통신비밀보호법)</li>
                                </ul>
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제4조 (개인정보의 제3자 제공)</h4>
                        <p>단체는 원칙적으로 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다 :</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>이용자가 사전에 동의한 경우</li>
                            <li>법령에 따라 제출 의무가 있는 경우</li>
                            <li>후원 결제 및 소득공제 증빙 등을 위해 결제대행사 및 국세청 등 관계기관에 제공하는 경우</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제5조 (개인정보 처리 위탁)</h4>
                        <p>단체는 원활한 서비스 제공을 위하여 일부 업무를 외부에 위탁할 수 있으며, 위탁 시 <strong>팝업 알림 또는 이메일로 고지합니다</strong>:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>예</strong>: 서버 운영 및 관리 업체, 결제대행사</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제6조 (개인정보의 국외 이전)</h4>
                        <p>구글, 페이스북 OAuth 인증 과정에서 개인정보가 국외(미국 등)로 이전될 수 있으며, 단체는 관련 법령에 따라 필요한 보호조치를 이행합니다.</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제7조 (이용자 및 법정대리인의 권리와 행사 방법)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>이용자는 언제든지 자신의 개인정보에 대해 <strong>열람, 정정, 삭제, 처리정지, 동의철회</strong>를 요청할 수 있습니다.</li>
                            <li>만 14세 미만 아동의 경우, 법정대리인이 해당 권리를 행사할 수 있습니다.</li>
                            <li><strong>권리 행사는 마이페이지 또는 문의(이메일: dreamshowchoir0524@gmail.com, 전화: 010-5592-0970)를 통해 가능합니다.</strong></li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제8조 (개인정보의 안전성 확보 조치)</h4>
                        <p>단체는 「개인정보보호법」에 따라 개인정보가 분실, 도난, 유출, 위조·변조 또는 훼손되지 않도록 안전성 확보를 위해 합리적인 기술적·관리적 조치를 취하고 있습니다 :</p>
                        <ol className="list-decimal pl-5 mt-2 space-y-1">
                            <li><strong>OAuth 인증 사용</strong>: 단체는 자체 비밀번호를 수집·저장하지 않으며, 네이버·카카오·구글·페이스북 등 외부 인증기관의 OAuth를 통해 안전하게 로그인 및 회원가입을 제공합니다.</li>
                            <li><strong>접근 권한 최소화</strong>: 개인정보 접근 권한은 최소한의 관리자에게만 부여됩니다.</li>
                            <li><strong>암호화 및 보안 통신</strong>: 개인정보는 암호화된 통신 구간(SSL/TLS)을 통해 전송됩니다.</li>
                            <li><strong>시스템 보호</strong>: 서버 및 데이터는 보안 솔루션을 사용하여 외부 침입 및 해킹에 대비하고 있으며, <strong>분기별 정기 보안 점검</strong>을 실시합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제9조 (개인정보 보호책임자)</h4>
                        <p><strong>개인정보 보호책임자</strong>: 이동영</p>
                        <p><strong>연락처</strong>: 이메일: dreamshowchoir0524@gmail.com, 전화: 010-2535-2095</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제10조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>단체는 서비스 개선 및 맞춤형 서비스 제공을 위해 쿠키를 사용할 수 있습니다.</li>
                            <li>쿠키 설정은 브라우저에서 거부 가능하며, 일부 서비스 기능이 제한될 수 있습니다.</li>
                            <li>쿠키 운영 정책: [링크 또는 세부 내용 추가 예정]</li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="font-bold text-xl mb-2">제11조 (이의 제기 및 분쟁 해결)</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>이용자는 개인정보 처리에 대한 이의가 있을 경우, 개인정보 보호책임자(<strong>이동영</strong>)에게 문의할 수 있습니다.</li>
                            <li>분쟁이 발생할 경우, <strong>한국소비자원(www.kca.go.kr, 1372)</strong> 또는 <strong>개인정보 분쟁조정위원회</strong>를 통해 해결할 수 있습니다.</li>
                            <li>단체와 이용자 간의 분쟁은 대한민국 법률에 따라 서울중앙지방법원을 관할로 합니다.</li>
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
