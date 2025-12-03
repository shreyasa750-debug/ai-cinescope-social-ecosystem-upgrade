import { ExploreSection } from '@/components/ExploreSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'Explore Movies | CineScope+',
  description: 'Discover thousands of movies from around the world with advanced filters and search',
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExploreSection />
    </Suspense>
  );
}
