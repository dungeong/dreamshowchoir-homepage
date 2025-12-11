import { AboutLayout } from '@/components/about/AboutLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AboutLayout>{children}</AboutLayout>;
}
