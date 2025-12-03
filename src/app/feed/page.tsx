import { SocialFeedSection } from '@/components/SocialFeedSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'Social Feed | CineScope+',
  description: 'See what friends are watching and discover trending movies',
};

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SocialFeedSection />
    </Suspense>
  );
}
