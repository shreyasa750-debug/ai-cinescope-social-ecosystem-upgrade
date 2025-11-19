"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Trophy, Clock, CheckCircle2, Gift, Sparkles, Lock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  challenge: {
    id: number;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special';
    target: number;
    rewardType: string;
    rewardValue: number;
    startDate: string;
    endDate: string;
  };
  userProgress: {
    progress: number;
    completed: boolean;
    completedAt: string | null;
    percentage: number;
  };
}

export function ChallengesSection() {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetchChallenges();
    }
  }, [token]);

  const fetchChallenges = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId: number) => {
    if (!token) return;
    
    setClaimingId(challengeId);
    try {
      const response = await fetch('/api/challenges/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`🎉 Claimed ${data.reward.value} ${data.reward.type}!`);
        await fetchChallenges();
      } else {
        toast.error(data.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setClaimingId(null);
    }
  };

  const dailyChallenges = challenges.filter(c => c.challenge.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.challenge.type === 'weekly');
  const specialChallenges = challenges.filter(c => c.challenge.type === 'special');

  const getTimeLeft = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const renderChallenge = (item: Challenge) => {
    const { challenge, userProgress } = item;
    const timeLeft = getTimeLeft(challenge.endDate);
    const canClaim = userProgress.completed && userProgress.percentage >= 100;

    return (
      <Card key={challenge.id} className={`relative ${userProgress.completed && 'border-green-500'}`}>
        {userProgress.completed && (
          <div className="absolute top-3 right-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant={challenge.type === 'special' ? 'default' : 'secondary'} className="capitalize">
              {challenge.type}
            </Badge>
            {!userProgress.completed && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeLeft}
              </div>
            )}
          </div>
          <CardTitle>{challenge.title}</CardTitle>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!userProgress.completed && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {userProgress.progress} / {challenge.target}
                </span>
              </div>
              <Progress value={userProgress.percentage} />
            </div>
          )}

          {userProgress.completed && userProgress.completedAt && (
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Completed on {new Date(userProgress.completedAt).toLocaleDateString()}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {challenge.rewardType === 'badge' && `Badge #${challenge.rewardValue}`}
                {challenge.rewardType === 'points' && `${challenge.rewardValue} Points`}
              </span>
            </div>
            {canClaim && (
              <Button 
                size="sm" 
                onClick={() => claimReward(challenge.id)}
                disabled={claimingId === challenge.id}
              >
                {claimingId === challenge.id ? 'Claiming...' : 'Claim Reward'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Sign in to view challenges</p>
          <p className="text-sm text-muted-foreground mt-2">
            Complete challenges to earn rewards and unlock achievements
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Target className="h-8 w-8" />
          Challenges
        </h2>
        <p className="text-muted-foreground">
          Complete challenges to earn rewards and unlock achievements
        </p>
      </div>

      {/* Featured Challenge */}
      {specialChallenges[0] && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <Badge className="bg-purple-500">Special Event</Badge>
            </div>
            <CardTitle className="text-2xl">{specialChallenges[0].challenge.title}</CardTitle>
            <CardDescription className="text-base">
              {specialChallenges[0].challenge.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">
                  {specialChallenges[0].userProgress.progress} / {specialChallenges[0].challenge.target}
                </span>
              </div>
              <Progress 
                value={specialChallenges[0].userProgress.percentage} 
                className="h-3"
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">
                    {specialChallenges[0].challenge.rewardValue} {specialChallenges[0].challenge.rewardType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Ends {new Date(specialChallenges[0].challenge.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenge Tabs */}
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily ({dailyChallenges.length})</TabsTrigger>
          <TabsTrigger value="weekly">Weekly ({weeklyChallenges.length})</TabsTrigger>
          <TabsTrigger value="special">Special ({specialChallenges.slice(1).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : dailyChallenges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {dailyChallenges.map(renderChallenge)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No daily challenges available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back tomorrow for new challenges!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : weeklyChallenges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {weeklyChallenges.map(renderChallenge)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No weekly challenges available</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : specialChallenges.slice(1).length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {specialChallenges.slice(1).map(renderChallenge)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No special challenges available</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}