import { GalleryDetail } from '@/components/activities/GalleryDetail';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function GalleryDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <GalleryDetail id={parseInt(id)} />;
}
