"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { User, Mail, Edit2, Save, X, Trophy, Eye, Star, Calendar, Film } from 'lucide-react';
import { toast } from 'sonner';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  favoriteGenres: string[];
  watchlistCount: number;
  followersCount: number;
  followingCount: number;
  joinDate: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

interface RecentMovie {
  id: number;
  title: string;
  poster: string;
  watchedDate: string;
}

const DEMO_PROFILE: UserProfile = {
  name: 'Alex Thompson',
  username: 'cinephile_alex',
  email: 'alex@example.com',
  bio: 'Passionate movie lover 🎬 | Sci-fi enthusiast | Always hunting for hidden gems',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  favoriteGenres: ['Sci-Fi', 'Thriller', 'Drama', 'Action'],
  watchlistCount: 47,
  followersCount: 234,
  followingCount: 189,
  joinDate: '2023-01-15',
};

const DEMO_BADGES: Badge[] = [
  { id: '1', name: 'Movie Buff', icon: '🎬', description: 'Watched 100 movies', unlocked: true },
  { id: '2', name: 'Marathon Master', icon: '🏆', description: 'Watched 5 movies in a day', unlocked: true },
  { id: '3', name: 'Genre Explorer', icon: '🌟', description: 'Watched movies from 10 genres', unlocked: true },
  { id: '4', name: 'Early Bird', icon: '🌅', description: 'Member for 1 year', unlocked: true },
  { id: '5', name: 'Social Butterfly', icon: '🦋', description: 'Made 50 friends', unlocked: false },
  { id: '6', name: 'Critic', icon: '✍️', description: 'Wrote 100 reviews', unlocked: false },
];

const DEMO_RECENT: RecentMovie[] = [
  { id: 1, title: 'Inception', poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', watchedDate: '2024-11-20' },
  { id: 2, title: 'The Matrix', poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', watchedDate: '2024-11-18' },
  { id: 3, title: 'Interstellar', poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', watchedDate: '2024-11-15' },
  { id: 4, title: 'Blade Runner 2049', poster: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', watchedDate: '2024-11-12' },
];

const ALL_GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy', 'Mystery', 'Adventure'];

export function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile>(DEMO_PROFILE);
  const [badges, setBadges] = useState<Badge[]>(DEMO_BADGES);
  const [recentMovies, setRecentMovies] = useState<RecentMovie[]>(DEMO_RECENT);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(DEMO_PROFILE);

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setEditedProfile(parsed);
    } else {
      localStorage.setItem('user_profile', JSON.stringify(DEMO_PROFILE));
    }

    const savedBadges = localStorage.getItem('user_badges');
    if (savedBadges) {
      setBadges(JSON.parse(savedBadges));
    }
  }, []);

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem('user_profile', JSON.stringify(editedProfile));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const toggleGenre = (genre: string) => {
    setEditedProfile(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
          <CardContent className="relative">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-4xl">{profile.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pt-16 md:pt-0">
                {!isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                      </div>
                      <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                    <p className="text-sm">{profile.bio}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-16 md:pt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={editedProfile.username}
                          onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="gap-2">
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{profile.watchlistCount}</div>
              <div className="text-sm text-muted-foreground">Watchlist</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{profile.followersCount}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{profile.followingCount}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Genres */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Genres</CardTitle>
            <CardDescription>
              {isEditing ? 'Select your favorite genres' : 'Your preferred movie genres'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                ALL_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={editedProfile.favoriteGenres.includes(genre) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))
              ) : (
                profile.favoriteGenres.map(genre => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Badges
            </CardTitle>
            <CardDescription>
              Achievements unlocked: {unlockedBadges.length} / {badges.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Unlocked ({unlockedBadges.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {unlockedBadges.map(badge => (
                  <Card key={badge.id} className="text-center hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-muted-foreground">Locked ({lockedBadges.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lockedBadges.map(badge => (
                  <Card key={badge.id} className="text-center opacity-50">
                    <CardContent className="pt-6">
                      <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                      <p className="font-semibold text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recently Viewed
            </CardTitle>
            <CardDescription>Movies you watched recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentMovies.map(movie => (
                <div key={movie.id} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    <img
                      src={getMoviePosterUrl(movie.poster)}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs">
                          Watched {new Date(movie.watchedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{movie.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Mini Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Total Movies
              </CardDescription>
              <CardTitle className="text-3xl">247</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Since joining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avg Rating
              </CardDescription>
              <CardTitle className="text-3xl">7.8</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Reviews
              </CardDescription>
              <CardTitle className="text-3xl">89</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+12 this month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
