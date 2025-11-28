"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Users,
  BarChart3,
  Trophy,
  Target,
  UserPlus,
  List,
  Clock,
  UserCircle,
  TrendingUp,
  Film,
  Star,
  Calendar,
  Activity,
  Award,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardPageSectionProps {
  onNavigate: (section: string) => void;
}

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  stats?: string;
  action: string;
}

export function DashboardPageSection({ onNavigate }: DashboardPageSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    moviesWatched: 0,
    hoursWatched: 0,
    badgesEarned: 0,
    friends: 0,
    watchlistCount: 0,
    reviewsWritten: 0,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserStats();
    }
  }, [isAuthenticated, user]);

  const fetchUserStats = async () => {
    try {
      const [analyticsRes, badgesRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/user/badges'),
      ]);

      const [analyticsData, badgesData] = await Promise.all([
        analyticsRes.json(),
        badgesRes.json(),
      ]);

      setStats({
        moviesWatched: analyticsData.totalMoviesWatched || 0,
        hoursWatched: Math.round((analyticsData.totalWatchTime || 0) / 60),
        badgesEarned: badgesData.badges?.length || 0,
        friends: 0, // TODO: Add friends API
        watchlistCount: 0, // TODO: Add watchlist API
        reviewsWritten: 0, // TODO: Add reviews count API
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const dashboardCards: DashboardCard[] = [
    {
      id: 'explore',
      title: 'Explore',
      description: 'Discover trending movies and get personalized recommendations',
      icon: Compass,
      color: 'from-purple-500 to-pink-500',
      stats: '10K+ Movies',
      action: 'explore',
    },
    {
      id: 'social',
      title: 'Social Feed',
      description: 'Connect with friends, join clubs, and share your movie journey',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      stats: `${stats.friends} Friends`,
      action: 'social',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track your watching habits and discover insights',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      stats: `${stats.moviesWatched} Movies Watched`,
      action: 'analytics',
    },
    {
      id: 'badges',
      title: 'Badges',
      description: 'Earn achievements and unlock exclusive rewards',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      stats: `${stats.badgesEarned} Earned`,
      action: 'badges',
    },
    {
      id: 'challenges',
      title: 'Challenges',
      description: 'Complete daily and weekly movie challenges',
      icon: Target,
      color: 'from-red-500 to-pink-500',
      stats: '3 Active',
      action: 'challenges',
    },
    {
      id: 'friends',
      title: 'Friends',
      description: 'Manage your connections and see what they\'re watching',
      icon: UserPlus,
      color: 'from-indigo-500 to-purple-500',
      stats: `${stats.friends} Connected`,
      action: 'social',
    },
    {
      id: 'watchlist',
      title: 'Watchlist',
      description: 'Movies you want to watch later',
      icon: List,
      color: 'from-teal-500 to-cyan-500',
      stats: `${stats.watchlistCount} Movies`,
      action: 'social',
    },
    {
      id: 'recent',
      title: 'Recently Viewed',
      description: 'Continue watching where you left off',
      icon: Clock,
      color: 'from-slate-500 to-gray-500',
      stats: 'Last 30 days',
      action: 'analytics',
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your account and preferences',
      icon: UserCircle,
      color: 'from-violet-500 to-purple-500',
      stats: 'Settings',
      action: 'profile',
    },
  ];

  const recentActivity = [
    { icon: Star, text: 'Rated "Inception" 5 stars', time: '2 hours ago', color: 'text-yellow-500' },
    { icon: Trophy, text: 'Earned "Movie Buff" badge', time: '5 hours ago', color: 'text-orange-500' },
    { icon: MessageSquare, text: 'Commented on "The Dark Knight"', time: '1 day ago', color: 'text-blue-500' },
    { icon: Award, text: 'Completed "Weekend Warrior" challenge', time: '2 days ago', color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-600/20 p-8 md:p-12">
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome back, {isAuthenticated && user ? user.username : 'Movie Lover'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personalized CineScope+ dashboard
            </p>
            
            {/* Quick Stats */}
            {isAuthenticated && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                <div className="bg-background/50 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Film className="h-4 w-4" />
                    <span>Movies</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.moviesWatched}</div>
                </div>
                <div className="bg-background/50 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span>Hours</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.hoursWatched}</div>
                </div>
                <div className="bg-background/50 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Trophy className="h-4 w-4" />
                    <span>Badges</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.badgesEarned}</div>
                </div>
                <div className="bg-background/50 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Star className="h-4 w-4" />
                    <span>Reviews</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.reviewsWritten}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <Card
                key={card.id}
                className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 overflow-hidden"
                onClick={() => onNavigate(card.action)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    {card.stats && (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {card.stats}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button
                    variant="ghost"
                    className="w-full justify-start group-hover:bg-primary/10"
                  >
                    Open →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {isAuthenticated && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.text}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Continue Watching Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Watching</h2>
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="w-full bg-primary/20 h-1 rounded-full mb-2">
                    <div className="bg-primary h-1 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <p className="text-xs text-white font-medium">Continue watching</p>
                </div>
                <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                  <Film className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
