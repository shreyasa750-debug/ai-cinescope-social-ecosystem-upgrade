"use client";

import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Navigation } from '@/components/Navigation';
import { HomeSection } from '@/components/HomeSection';
import { Toaster } from '@/components/ui/sonner';

export default function HomePage() {
  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <HomeSection />
          </main>
          
          {/* Footer */}
          <footer className="border-t border-border mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    CineScope+
                  </h3>
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
                <p>© 2024 CineScope+. Built with Next.js, AI, and ❤️ for movie lovers.</p>
              </div>
            </div>
          </footer>

          {/* Toast Notifications */}
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}