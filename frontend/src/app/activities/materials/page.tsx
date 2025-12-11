import { Suspense } from 'react';
import { ActivityBoard } from '@/components/activities/ActivityBoard';

export default function MaterialsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <ActivityBoard />
        </Suspense>
    );
}
