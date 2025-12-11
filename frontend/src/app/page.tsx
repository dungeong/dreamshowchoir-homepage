import { HeroSection } from '@/components/home/HeroSection';
import { QuickLinks } from '@/components/home/QuickLinks';
import { VideoNewsSection } from '@/components/home/VideoNewsSection';
import { ExternalLinks } from '@/components/home/ExternalLinks';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeroSection />

      <div className="space-y-0">
        <QuickLinks />
        <VideoNewsSection />
        <ExternalLinks />
      </div>
    </div>
  );
}
