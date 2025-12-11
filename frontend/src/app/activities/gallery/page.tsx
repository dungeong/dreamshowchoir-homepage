import { Suspense } from 'react';
import { GalleryGrid } from '@/components/activities/GalleryGrid';

export default function GalleryPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <GalleryGrid />
        </Suspense>
    );
}
