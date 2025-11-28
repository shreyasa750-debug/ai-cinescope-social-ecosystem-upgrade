"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Film,
  Sparkles,
  Users,
  TrendingUp,
  Search,
  BarChart3,
  MessageSquare,
  Star,
  Heart,
  Zap,
  Play,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { getMoviePosterUrl } from '@/lib/tmdb';
import { toast } from 'sonner';

interface HomeSectionProps {
  onNavigate: (section: string) => void;
}

interface Movie {
  id: number;
  title: string;
  posterPath?: string;
  poster_path?: string;
  backdropPath?: string;
  backdrop_path?: string;
  rating: number;
  year?: number;
  genre?: string;
  overview?: string;
}

export function HomeSection({ onNavigate }: HomeSectionProps) {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());

  const genres = [
    { name: 'Action', icon: '🎬', color: 'from-red-500 to-orange-500' },
    { name: 'Comedy', icon: '😄', color: 'from-yellow-500 to-amber-500' },
    { name: 'Drama', icon: '🎭', color: 'from-purple-500 to-pink-500' },
    { name: 'Horror', icon: '😱', color: 'from-gray-700 to-gray-900' },
    { name: 'Sci-Fi', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
    { name: 'Romance', icon: '💕', color: 'from-pink-500 to-rose-500' },
    { name: 'Thriller', icon: '🔍', color: 'from-indigo-500 to-purple-500' },
    { name: 'Animation', icon: '🎨', color: 'from-green-500 to-emerald-500' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Explore',
      description: 'Discover movies with advanced filters',
      action: () => onNavigate('explore'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Social',
      description: 'Connect with movie lovers',
      action: () => onNavigate('social'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your watching habits',
      action: () => onNavigate('analytics'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Target,
      title: 'Challenges',
      description: 'Complete movie challenges',
      action: () => onNavigate('challenges'),
      color: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { label: 'Movies', value: '20,000+', icon: Film },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Reviews', value: '50K+', icon: Star },
    { label: 'Lists', value: '5K+', icon: Heart },
  ];

  useEffect(() => {
    fetchAllData();
    
    // Load watchlist from localStorage
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      setWatchlist(new Set(JSON.parse(saved)));
    }
  }, []);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (heroMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [trendingRes, recommendedRes] = await Promise.all([
        fetch('/api/movies/search?trending=true&limit=10'),
        fetch('/api/recommendations?limit=10'),
      ]);

      const [trendingData, recommendedData] = await Promise.all([
        trendingRes.json(),
        recommendedRes.json(),
      ]);

      if (trendingData.movies) {
        setTrendingMovies(trendingData.movies);
        setHeroMovies(trendingData.movies.slice(0, 5));
      }
      
      if (recommendedData.recommendations) {
        setRecommendedMovies(recommendedData.recommendations);
      }

      // Use trending as new releases for demo
      if (trendingData.movies) {
        setNewReleases(trendingData.movies.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (movieId: number) => {
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(movieId)) {
      newWatchlist.delete(movieId);
      toast.success('Removed from watchlist');
    } else {
      newWatchlist.add(movieId);
      toast.success('Added to watchlist');
    }
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(Array.from(newWatchlist)));
  };

  const currentHero = heroMovies[currentHeroIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel */}
      {loading ? (
        <div className="relative h-[70vh] bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
      ) : currentHero ? (
        <div className="relative h-[70vh] overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={getMoviePosterUrl(currentHero.backdropPath || currentHero.backdrop_path || currentHero.posterPath)}
              alt={currentHero.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge className="gap-2 bg-primary/90 backdrop-blur text-lg px-4 py-2">
                <TrendingUp className="h-4 w-4" />
                Trending Now
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                {currentHero.title}
              </h1>
              
              {currentHero.overview && (
                <p className="text-lg md:text-xl text-muted-foreground line-clamp-3">
                  {currentHero.overview}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm">
                {currentHero.year && (
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {currentHero.year}
                  </Badge>
                )}
                {currentHero.rating && (
                  <Badge variant="secondary" className="text-base px-3 py-1 gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {currentHero.rating.toFixed(1)}
                  </Badge>
                )}
                {currentHero.genre && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {currentHero.genre}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gap-2 text-lg px-8">
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-lg px-8"
                  onClick={() => toggleWatchlist(currentHero.id)}
                >
                  {watchlist.has(currentHero.id) ? (
                    <><Heart className="h-5 w-5 fill-red-500 text-red-500" /> In Watchlist</>
                  ) : (
                    <><Plus className="h-5 w-5" /> Add to Watchlist</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {heroMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentHeroIndex ? 'w-8 bg-primary' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Quick Access Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {features.map((feature) => (
            <Button
              key={feature.title}
              onClick={feature.action}
              size="lg"
              variant="outline"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <feature.icon className="h-5 w-5" />
              {feature.title}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trending Now */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Trending Now</h2>
            </div>
            <Button variant="ghost" onClick={() => onNavigate('explore')}>
              View All →
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {trendingMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended For You */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <h2 className="text-3xl font-bold">Recommended For You</h2>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                AI-Powered
              </Badge>
            </div>
            <Button variant="ghost" onClick={() => onNavigate('explore')}>
              View All →
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendedMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* Genres / Categories */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <Card
                key={genre.name}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all hover:scale-105"
                onClick={() => onNavigate('explore')}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <CardContent className="relative pt-8 pb-8 text-center">
                  <div className="text-5xl mb-3">{genre.icon}</div>
                  <p className="font-bold text-xl">{genre.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-green-500" />
              <h2 className="text-3xl font-bold">New Releases</h2>
            </div>
            <Button variant="ghost" onClick={() => onNavigate('explore')}>
              View All →
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {newReleases.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* Community Highlights */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-3xl font-bold">Community Highlights</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate('social')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Top Reviews
                </CardTitle>
                <CardDescription>See what others are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">reviews this week</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate('badges')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Badges Earned
                </CardTitle>
                <CardDescription>Community achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">new badges today</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => onNavigate('social')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Friends Activity
                </CardTitle>
                <CardDescription>What friends are watching</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">567</p>
                <p className="text-sm text-muted-foreground">movies watched today</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-12 mt-16">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Movie Journey?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-lg">
            Join thousands of movie enthusiasts discovering, tracking, and discussing films
            with the power of AI.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate('explore')} className="gap-2 text-lg px-8">
              <Film className="h-5 w-5" />
              Start Exploring
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('dashboard')} className="gap-2 text-lg px-8">
              <LayoutDashboard className="h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}