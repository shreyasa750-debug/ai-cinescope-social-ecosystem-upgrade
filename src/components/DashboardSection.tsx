"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Film, 
  TrendingUp, 
  Clock, 
  Star, 
  Trophy, 
  Users, 
  Target, 
  Calendar,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Award,
  Zap,
  Activity,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { getMoviePosterUrl } from '@/lib/tmdb';
import { toast } from 'sonner';

interface DashboardStats {
  totalMoviesWatched: number;
  totalWatchTime: number;
  averageRating: number;
  favoriteGenre: string;
  currentStreak: number;
  longestStreak: number;
  reviewsWritten: number;
  listsCreated: number;
  badgesEarned: number;
  friendsCount: number;
}

interface ActivityItem {
  id: number;
  type: 'watched' | 'review' | 'list' | 'friend' | 'badge' | 'challenge';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface RecentMovie {
  id: number;
  title: string;
  posterPath: string;
  rating: number;
  watchedAt: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  expiresAt: string;
}

export function DashboardSection() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMoviesWatched: 0,
    totalWatchTime: 0,
    averageRating: 0,
    favoriteGenre: 'Unknown',
    currentStreak: 0,
    longestStreak: 0,
    reviewsWritten: 0,
    listsCreated: 0,
    badgesEarned: 0,
    friendsCount: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentMovies, setRecentMovies] = useState<RecentMovie[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [analyticsRes, activitiesRes, challengesRes] = await Promise.all([
        fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/user/activities', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/challenges', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setStats({
          totalMoviesWatched: analyticsData.totalMoviesWatched || 0,
          totalWatchTime: analyticsData.totalWatchTime || 0,
          averageRating: analyticsData.averageRating || 0,
          favoriteGenre: analyticsData.favoriteGenre || 'Unknown',
          currentStreak: analyticsData.watchStreak?.current || 0,
          longestStreak: analyticsData.watchStreak?.longest || 0,
          reviewsWritten: analyticsData.reviewsCount || 0,
          listsCreated: analyticsData.listsCount || 0,
          badgesEarned: analyticsData.badgesEarned || 0,
          friendsCount: analyticsData.friendsCount || 0,
        });
        setRecentMovies(analyticsData.recentMovies || []);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities || []);
      }

      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setActiveChallenges(challengesData.activeChallenges || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watched': return <Eye className="h-4 w-4" />;
      case 'review': return <MessageCircle className="h-4 w-4" />;
      case 'list': return <Film className="h-4 w-4" />;
      case 'friend': return <Users className="h-4 w-4" />;
      case 'badge': return <Award className="h-4 w-4" />;
      case 'challenge': return <Trophy className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Sign in to view your dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">
            Track your movie journey with personalized stats and insights
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}! Here's your cinematic journey at a glance.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalMoviesWatched}</p>
                <p className="text-sm text-muted-foreground">Movies Watched</p>
              </div>
              <Film className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatWatchTime(stats.totalWatchTime)}</p>
                <p className="text-sm text-muted-foreground">Watch Time</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.badgesEarned}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
              <Trophy className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest movie interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activity. Start watching movies!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recently Watched */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recently Watched
              </CardTitle>
              <CardDescription>Your latest movie experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {recentMovies.map((movie) => (
                  <div key={movie.id} className="space-y-2">
                    <div className="relative group cursor-pointer">
                      <img
                        src={getMoviePosterUrl(movie.posterPath)}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium truncate">{movie.title}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{movie.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentMovies.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No movies watched yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Challenges */}
        <div className="space-y-6">
          {/* Personal Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-medium">{stats.averageRating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Favorite Genre</span>
                  <Badge variant="secondary">{stats.favoriteGenre}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reviews Written</span>
                  <span className="font-medium">{stats.reviewsWritten}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lists Created</span>
                  <span className="font-medium">{stats.listsCreated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Friends</span>
                  <span className="font-medium">{stats.friendsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Longest Streak</span>
                  <span className="font-medium">{stats.longestStreak} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>Keep the momentum going!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      {challenge.reward}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{challenge.progress} / {challenge.target}</span>
                      <span>{Math.round((challenge.progress / challenge.target) * 100)}%</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} />
                  </div>
                </div>
              ))}
              {activeChallenges.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active challenges. Check the Challenges section!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Film className="h-4 w-4" />
                Discover New Movies
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Find Friends
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Trophy className="h-4 w-4" />
                View All Badges
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Share2 className="h-4 w-4" />
                Share Your Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
