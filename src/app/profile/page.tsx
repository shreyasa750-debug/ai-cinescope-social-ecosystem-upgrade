import { ProfileSection } from '@/components/ProfileSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'Profile | CineScope+',
  description: 'Manage your profile and preferences',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProfileSection />
    </Suspense>
  );
}
