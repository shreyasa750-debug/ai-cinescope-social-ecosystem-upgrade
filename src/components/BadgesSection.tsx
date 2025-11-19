"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Star, Zap, Target, Trophy, Crown, Film, Heart, TrendingUp, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BadgeRequirements {
  type: string;
  value: number;
}

interface UserBadge {
  badge: {
    id: number;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    requirements: BadgeRequirements;
    rewardPoints: number;
  };
  userProgress: {
    progress: number;
    unlocked: boolean;
    unlockedAt: string | null;
  };
}

const BADGE_ICONS: Record<string, any> = {
  '🎬': Film,
  '🍿': Film,
  '✍️': Award,
  '⭐': Star,
  '🎭': Trophy,
  '🎥': Film,
  '📝': Award,
  '💯': Target,
  '🎨': Trophy,
  '📺': Film,
  '🎞️': Film,
  '🖊️': Award,
  '🌟': Star,
  '👑': Crown,
  '🏆': Trophy,
};

const BADGE_COLORS = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

export function BadgesSection() {
  const { token } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBadges();
    }
  }, [token]);

  const fetchBadges = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/user/badges', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const checkBadges = async () => {
    if (!token) return;
    
    setChecking(true);
    try {
      const response = await fetch('/api/user/badges/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.unlockedBadges && data.unlockedBadges.length > 0) {
        toast.success(`🎉 Unlocked ${data.unlockedBadges.length} new badge${data.unlockedBadges.length > 1 ? 's' : ''}!`);
      } else {
        toast.info('Keep watching movies to unlock more badges!');
      }
      
      // Refresh badges
      await fetchBadges();
    } catch (error) {
      console.error('Error checking badges:', error);
      toast.error('Failed to check badge progress');
    } finally {
      setChecking(false);
    }
  };

  const unlockedBadges = badges.filter(b => b.userProgress.unlocked);
  const lockedBadges = badges.filter(b => !b.userProgress.unlocked);

  const renderBadge = (userBadge: UserBadge) => {
    const { badge, userProgress } = userBadge;
    const Icon = BADGE_ICONS[badge.icon] || Award;
    const rarityColor = BADGE_COLORS[badge.rarity];

    return (
      <Card key={badge.id} className={`relative overflow-hidden ${!userProgress.unlocked && 'opacity-60'}`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${rarityColor}`} />
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-lg ${rarityColor} bg-opacity-20`}>
              {userProgress.unlocked ? (
                <span className="text-2xl">{badge.icon}</span>
              ) : (
                <Lock className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Badge variant="outline" className="capitalize">
              {badge.rarity}
            </Badge>
          </div>
          <CardTitle className="mt-4">{badge.name}</CardTitle>
          <CardDescription>{badge.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {!userProgress.unlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{userProgress.progress} / 100</span>
              </div>
              <Progress value={userProgress.progress} />
              <p className="text-xs text-muted-foreground mt-2">
                {badge.requirements.type.replace(/_/g, ' ')}: {badge.requirements.value}
              </p>
            </div>
          )}
          {userProgress.unlocked && userProgress.unlockedAt && (
            <div className="space-y-2">
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Unlocked on {new Date(userProgress.unlockedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                +{badge.rewardPoints} points earned
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Sign in to view your badges</p>
          <p className="text-sm text-muted-foreground mt-2">
            Track your achievements and unlock badges as you watch movies
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Badges</h2>
          <p className="text-muted-foreground">
            Unlock badges by completing challenges and reaching milestones
          </p>
        </div>
        <Button onClick={checkBadges} disabled={checking} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          Check Progress
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Badges</CardDescription>
            <CardTitle className="text-3xl">{badges.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unlocked</CardDescription>
            <CardTitle className="text-3xl text-green-600">{unlockedBadges.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{lockedBadges.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completion</CardDescription>
            <CardTitle className="text-3xl">
              {badges.length > 0 ? Math.round((unlockedBadges.length / badges.length) * 100) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Badges Grid */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked ({unlockedBadges.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedBadges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(renderBadge)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unlocked" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges.length > 0 ? (
              unlockedBadges.map(renderBadge)
            ) : (
              <Card className="col-span-full p-12 text-center">
                <Lock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No badges unlocked yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start watching movies and completing challenges to unlock badges!
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map(renderBadge)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}