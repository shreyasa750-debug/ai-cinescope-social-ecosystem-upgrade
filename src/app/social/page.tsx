import { SocialSection } from '@/components/SocialSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'Social | CineScope+',
  description: 'Connect with movie lovers, join clubs, and share reviews',
};

export default function SocialPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SocialSection />
    </Suspense>
  );
}
