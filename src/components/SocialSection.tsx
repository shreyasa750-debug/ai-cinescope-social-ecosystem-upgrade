"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, MessageSquare, Bookmark, Star, Plus, Video, BarChart3 } from 'lucide-react';
import { WatchPartyDialog } from './WatchPartyDialog';
import { PollsDialog } from './PollsDialog';

interface Friend {
  friend: {
    id: number;
    username: string;
    profileImage: string;
    persona: string;
  };
}

interface Club {
  club: {
    id: number;
    name: string;
    description: string;
    banner: string;
    isPublic: boolean;
  };
  creator: {
    username: string;
  };
}

interface List {
  list: {
    id: number;
    title: string;
    description: string;
    followers: number;
    isPublic: boolean;
  };
  user: {
    username: string;
    profileImage: string;
  };
}

export function SocialSection() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [publicLists, setPublicLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchPartyOpen, setWatchPartyOpen] = useState(false);
  const [pollsOpen, setPollsOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>('');

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    if (!token) return;

    try {
      const [friendsRes, clubsRes, listsRes] = await Promise.all([
        fetch('/api/friends', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/clubs'),
        fetch('/api/lists'),
      ]);

      const friendsData = await friendsRes.json();
      const clubsData = await clubsRes.json();
      const listsData = await listsRes.json();

      setFriends(friendsData.friends || []);
      setClubs(clubsData.clubs || []);
      setPublicLists(listsData.lists || []);
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPolls = (clubId: string) => {
    setSelectedClubId(clubId);
    setPollsOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Social Hub</h1>
        <p className="text-muted-foreground">
          Connect with friends, join clubs, and discover curated lists
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6">
        <Button onClick={() => setWatchPartyOpen(true)} className="gap-2">
          <Video className="h-4 w-4" />
          Start Watch Party
        </Button>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="clubs" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="lists" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Public Lists
          </TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Friends</h2>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No friends yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start connecting with other movie enthusiasts
              </p>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Find Friends
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <Card key={friend.friend.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage src={friend.friend.profileImage} />
                      <AvatarFallback>{friend.friend.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{friend.friend.username}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {friend.friend.persona}
                        </Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Clubs Tab */}
        <TabsContent value="clubs" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Movie Clubs</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Club
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {clubs.map((club) => (
                <Card key={club.club.id} className="overflow-hidden">
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${club.club.banner || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'})`,
                    }}
                  />
                  <CardHeader>
                    <CardTitle>{club.club.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {club.club.description}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created by {club.creator.username}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Users className="h-4 w-4" />
                      Join Club
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => handleOpenPolls(club.club.id.toString())}
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Polls
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Curated Lists</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create List
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicLists.map((list) => (
                <Card key={list.list.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{list.list.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {list.list.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={list.user.profileImage} />
                        <AvatarFallback>{list.user.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        by {list.user.username}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {list.list.followers} followers
                      </span>
                      <Button variant="outline" size="sm">
                        View List
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <WatchPartyDialog
        open={watchPartyOpen}
        onOpenChange={setWatchPartyOpen}
        roomId={undefined}
        movieId={undefined}
      />
      <PollsDialog
        open={pollsOpen}
        onOpenChange={setPollsOpen}
        clubId={selectedClubId}
      />
    </div>
  );
}