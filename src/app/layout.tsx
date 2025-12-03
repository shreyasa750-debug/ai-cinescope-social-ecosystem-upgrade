import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineScope+ | AI-Powered Movie Discovery Platform",
  description: "Discover, track, and share your cinematic journey with CineScope+. Advanced movie search, AI recommendations, and social features.",
  keywords: "movies, films, cinema, reviews, recommendations, watchlist, movie database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="pb-20 md:pb-0">
                {children}
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
      </body>
    </html>
  );
}