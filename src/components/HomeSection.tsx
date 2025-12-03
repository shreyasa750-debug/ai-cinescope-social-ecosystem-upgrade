"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
  Film,
  Sparkles,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Play,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Zap,
  Calendar,
  LayoutDashboard,
  Trophy,
  MessageSquare,
  Award,
} from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { toast } from 'sonner';
import {
  loadMovies,
  preloadDataset,
  type Movie
} from '@/lib/movies-loader';

export function HomeSection() {
  const router = useRouter();
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [backdropError, setBackdropError] = useState(false);

  const genres = [
    { name: 'Action', icon: '🎬', color: 'from-red-500 to-orange-500' },
    { name: 'Comedy', icon: '😄', color: 'from-yellow-500 to-amber-500' },
    { name: 'Drama', icon: '🎭', color: 'from-purple-500 to-pink-500' },
    { name: 'Horror', icon: '😱', color: 'from-gray-700 to-gray-900' },
    { name: 'Science Fiction', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
    { name: 'Romance', icon: '💕', color: 'from-pink-500 to-rose-500' },
    { name: 'Thriller', icon: '🔍', color: 'from-indigo-500 to-purple-500' },
    { name: 'Animation', icon: '🎨', color: 'from-green-500 to-emerald-500' },
  ];

  const features = [
    {
      icon: Film,
      title: 'Explore',
      description: 'Discover movies with advanced filters',
      path: '/explore',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Social',
      description: 'Connect with movie lovers',
      path: '/social',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your watching habits',
      path: '/analytics',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Target,
      title: 'Challenges',
      description: 'Complete movie challenges',
      path: '/challenges',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { label: 'Movies', value: '510+', icon: Film },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Reviews', value: '50K+', icon: Star },
    { label: 'Lists', value: '5K+', icon: Heart },
  ];

  useEffect(() => {
    preloadDataset();
    fetchAllData();
    
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        setWatchlist(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse watchlist:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
      setBackdropError(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const trendingResult = await loadMovies({
        page: 1,
        pageSize: 10,
        sortBy: 'popularity',
        sortOrder: 'desc'
      });
      
      setTrendingMovies(trendingResult.movies);
      setHeroMovies(trendingResult.movies.slice(0, 5));
      
      const recommendedResult = await loadMovies({
        page: 1,
        pageSize: 10,
        filters: { ratingMin: 8.0 },
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      
      setRecommendedMovies(recommendedResult.movies);
      
      const currentYear = new Date().getFullYear();
      const newReleasesResult = await loadMovies({
        page: 1,
        pageSize: 10,
        filters: { yearMin: currentYear - 2 },
        sortBy: 'year',
        sortOrder: 'desc'
      });
      
      setNewReleases(newReleasesResult.movies);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load movies. Please try again later.');
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

  if (error && !loading && trendingMovies.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Film className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Unable to Load Movies</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAllData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Carousel */}
      {loading ? (
        <div className="relative h-[70vh] bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
      ) : currentHero ? (
        <div className="relative h-[70vh] overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0">
            {!backdropError && (currentHero.backdrop || currentHero.poster) ? (
              <Image
                src={currentHero.backdrop || currentHero.poster}
                alt={`${currentHero.title} backdrop`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="100vw"
                onError={() => setBackdropError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                <div className="text-8xl">🎬</div>
              </div>
            )}
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
                {currentHero.vote_average && (
                  <Badge variant="secondary" className="text-base px-3 py-1 gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {currentHero.vote_average.toFixed(1)}
                  </Badge>
                )}
                {currentHero.genres && currentHero.genres[0] && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {currentHero.genres[0]}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gap-2 text-lg px-8" onClick={() => router.push(`/movie/${currentHero.id}`)}>
                  <Play className="h-5 w-5" />
                  View Details
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
            aria-label="Previous movie"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next movie"
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
                aria-label={`Go to slide ${index + 1}`}
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
              onClick={() => router.push(feature.path)}
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
            <Button variant="ghost" onClick={() => router.push('/explore')}>
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
              <h2 className="text-3xl font-bold">Highest Rated</h2>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                8.0+ Rating
              </Badge>
            </div>
            <Button variant="ghost" onClick={() => router.push('/explore')}>
              View All →
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : recommendedMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendedMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading recommendations...</p>
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
                onClick={() => router.push(`/explore?genres=${encodeURIComponent(genre.name)}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <CardContent className="relative pt-8 pb-8 text-center">
                  <div className="text-5xl mb-3" role="img" aria-label={genre.name}>{genre.icon}</div>
                  <p className="font-bold text-xl">{genre.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* New Releases */}
        {newReleases.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-green-500" />
                <h2 className="text-3xl font-bold">Recent Releases</h2>
              </div>
              <Button variant="ghost" onClick={() => router.push('/explore')}>
                View All →
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {newReleases.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Community Highlights */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-3xl font-bold">Community Highlights</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/social')}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold">Top Reviews</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">See what others are saying</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">reviews this week</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/challenges')}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-bold">Badges Earned</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Community achievements</p>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">new badges today</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/social')}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-green-500" />
                  <h3 className="font-bold">Friends Activity</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">What friends are watching</p>
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
            Join thousands of movie enthusiasts discovering and tracking films
            from around the world.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/explore')} className="gap-2 text-lg px-8">
              <Film className="h-5 w-5" />
              Start Exploring
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/dashboard')} className="gap-2 text-lg px-8">
              <LayoutDashboard className="h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}