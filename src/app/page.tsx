"use client";

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Navigation } from '@/components/Navigation';
import { HomeSection } from '@/components/HomeSection';
import { AuthSection } from '@/components/AuthSection';
import { DiscoverSection } from '@/components/DiscoverSection';
import { AnalyticsSection } from '@/components/AnalyticsSection';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { SocialSection } from '@/components/SocialSection';
import { BadgesSection } from '@/components/BadgesSection';
import { ChallengesSection } from '@/components/ChallengesSection';
import { WatchPartiesSection } from '@/components/WatchPartiesSection';
import { DashboardSection } from '@/components/DashboardSection';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function CineScopePage() {
  const [currentSection, setCurrentSection] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'h',
      action: () => handleNavigate('home'),
      description: 'Go to home',
    },
    {
      key: 'd',
      action: () => handleNavigate('discover'),
      description: 'Go to discover',
    },
    {
      key: 'a',
      action: () => handleNavigate('analytics'),
      description: 'Go to analytics',
    },
    {
      key: 's',
      action: () => handleNavigate('social'),
      description: 'Go to social',
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus search',
    },
  ]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <HomeSection onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthSection onSuccess={() => handleNavigate('home')} />;
      case 'discover':
        return <DiscoverSection />;
      case 'dashboard':
        return <DashboardSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'recommendations':
        return <RecommendationsSection />;
      case 'social':
        return <SocialSection />;
      case 'badges':
        return <BadgesSection />;
      case 'challenges':
        return <ChallengesSection />;
      case 'watch-parties':
        return <WatchPartiesSection />;
      default:
        return <HomeSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navigation onNavigate={handleNavigate} currentSection={currentSection} />
          <main>{renderSection()}</main>
          
          {/* Footer */}
          <footer className="border-t border-border mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-bold mb-4">CineScope</h3>
                  <p className="text-sm text-muted-foreground">
                    Your AI-powered movie companion for discovering, tracking, and sharing your cinematic journey.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Advanced Search</li>
                    <li>AI Recommendations</li>
                    <li>Watch Analytics</li>
                    <li>Social Features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Community</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Movie Clubs</li>
                    <li>Reviews</li>
                    <li>Watch Rooms</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">About</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>How It Works</li>
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                    <li>Contact</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                <p>© 2024 CineScope. Built with Next.js, AI, and ❤️ for movie lovers.</p>
              </div>
            </div>
          </footer>

          {/* Onboarding Dialog */}
          <OnboardingDialog
            open={showOnboarding}
            onComplete={handleOnboardingComplete}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}