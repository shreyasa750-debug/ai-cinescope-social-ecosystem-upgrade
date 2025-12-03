"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Film,
  Star,
  Calendar,
  Activity,
  Award,
  MessageSquare,
  TrendingUp,
  Zap,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  stats?: string;
  path: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    moviesWatched: 0,
    hoursWatched: 0,
    badgesEarned: 0,
    friends: 0,
    watchlistCount: 0,
    reviewsWritten: 0,
  });

  const [genreStats, setGenreStats] = useState<{ genre: string; count: number; percentage: number }[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<{ month: string; movies: number }[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserStats();
      generateMockAnalytics();
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
        friends: 0,
        watchlistCount: 0,
        reviewsWritten: 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const generateMockAnalytics = () => {
    // Generate mock genre statistics
    const genres = [
      { genre: 'Action', count: 45, percentage: 30 },
      { genre: 'Drama', count: 38, percentage: 25 },
      { genre: 'Comedy', count: 30, percentage: 20 },
      { genre: 'Sci-Fi', count: 22, percentage: 15 },
      { genre: 'Horror', count: 15, percentage: 10 },
    ];
    setGenreStats(genres);

    // Generate mock monthly activity
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const activity = months.map((month, index) => ({
      month,
      movies: Math.floor(Math.random() * 30) + 10,
    }));
    setMonthlyActivity(activity);
  };

  const dashboardCards: DashboardCard[] = [
    {
      id: 'explore',
      title: 'Explore',
      description: 'Discover trending movies and get personalized recommendations',
      icon: Compass,
      color: 'from-purple-500 to-pink-500',
      stats: '510+ Movies',
      path: '/explore',
    },
    {
      id: 'social',
      title: 'Social Feed',
      description: 'Connect with friends, join clubs, and share your movie journey',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      stats: `${stats.friends} Friends`,
      path: '/social',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track your watching habits and discover insights',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      stats: `${stats.moviesWatched} Movies Watched`,
      path: '/analytics',
    },
    {
      id: 'badges',
      title: 'Badges',
      description: 'Earn achievements and unlock exclusive rewards',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      stats: `${stats.badgesEarned} Earned`,
      path: '/badges',
    },
    {
      id: 'challenges',
      title: 'Challenges',
      description: 'Complete daily and weekly movie challenges',
      icon: Target,
      color: 'from-red-500 to-pink-500',
      stats: '3 Active',
      path: '/challenges',
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your account and preferences',
      icon: UserCircle,
      color: 'from-violet-500 to-purple-500',
      stats: 'Settings',
      path: '/profile',
    },
  ];

  const recentActivity = [
    { icon: Star, text: 'Rated "Inception" 5 stars', time: '2 hours ago', color: 'text-yellow-500' },
    { icon: Trophy, text: 'Earned "Movie Buff" badge', time: '5 hours ago', color: 'text-orange-500' },
    { icon: MessageSquare, text: 'Commented on "The Dark Knight"', time: '1 day ago', color: 'text-blue-500' },
    { icon: Award, text: 'Completed "Weekend Warrior" challenge', time: '2 days ago', color: 'text-purple-500' },
  ];

  const topGenres = genreStats.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
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

        {/* Analytics Section */}
        {isAuthenticated && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Genre Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Favorite Genres
                </CardTitle>
                <CardDescription>Your top movie genres this year</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {genreStats.map((item, index) => (
                  <div key={item.genre} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.genre}</span>
                      <span className="text-muted-foreground">{item.count} movies ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Monthly Activity
                </CardTitle>
                <CardDescription>Movies watched per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyActivity.map((item, index) => (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-8">{item.month}</span>
                      <div className="flex-1">
                        <div className="h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded" style={{ width: `${(item.movies / 40) * 100}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{item.movies}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Dashboard Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <Card
                key={card.id}
                className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 overflow-hidden"
                onClick={() => router.push(card.path)}
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

        {/* Insights & Recommendations */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Your Top Genre</h3>
                  <p className="text-2xl font-bold text-primary">{topGenres[0]?.genre || 'Action'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You've watched {topGenres[0]?.count || 45} {topGenres[0]?.genre || 'Action'} movies this year!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Watch Streak</h3>
                  <p className="text-2xl font-bold text-blue-500">7 Days</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep it up! Watch a movie today to maintain your streak.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">This Month</h3>
                  <p className="text-2xl font-bold text-green-500">+12 Movies</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You're watching more than last month. Great progress!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}