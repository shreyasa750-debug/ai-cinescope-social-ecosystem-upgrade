"use client";

import { useEffect } from 'react';
import { HomeSection } from '@/components/HomeSection';

export default function HomePage() {
  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  return <HomeSection />;
}