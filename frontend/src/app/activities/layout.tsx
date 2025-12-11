import { ActivitiesLayout } from '@/components/activities/ActivitiesLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ActivitiesLayout>{children}</ActivitiesLayout>;
}
