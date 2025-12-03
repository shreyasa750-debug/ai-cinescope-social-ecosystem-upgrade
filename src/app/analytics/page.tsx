import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Suspense } from 'react';

export const metadata = {
  title: 'Analytics | CineScope+',
  description: 'Analyze your movie watching patterns and trends',
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
