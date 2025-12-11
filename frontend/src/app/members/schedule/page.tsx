'use client';

import { PerformanceCalendar } from '@/components/activities/PerformanceCalendar';
import { PRACTICE_CALENDAR_ID } from '@/api/calendarApi';

export default function PracticeSchedulePage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">연습일정</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <p className="text-gray-600">
                        드림쇼콰이어의 정기 연습 및 특별 연습 일정입니다.
                        일정을 클릭하시면 상세 정보를 확인하실 수 있습니다.
                    </p>
                </div>

                <PerformanceCalendar calendarId={PRACTICE_CALENDAR_ID} />
            </div>
        </div>
    );
}
