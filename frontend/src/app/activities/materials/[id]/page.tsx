import { ActivityDetail } from '@/components/activities/ActivityDetail';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ActivityMaterialDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <ActivityDetail id={parseInt(id)} />;
}
