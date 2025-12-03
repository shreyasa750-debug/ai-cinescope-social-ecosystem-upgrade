"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Clock, 
  Calendar, 
  Heart, 
  Plus,
  Play,
  Bookmark,
  AlertCircle,
  RefreshCw,
  Film,
  TrendingUp,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  loadMovieById,
  getSimilarMovies,
  getTrailerSearchUrl,
  type Movie
} from '@/lib/movies-loader';
import { MovieCard } from '@/components/MovieCard';

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id ? parseInt(params.id as string) : null;
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
      fetchSimilarMovies();
    }
  }, [movieId]);

  const fetchMovieDetails = async () => {
    if (!movieId) return;

    setLoading(true);
    setError(null);
    setImageError(false);
    setBackdropError(false);
    
    try {
      const movieData = await loadMovieById(movieId);
      
      if (movieData) {
        setMovie(movieData);
      } else {
        throw new Error('Movie not found');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load movie details');
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarMovies = async () => {
    if (!movieId) return;

    setLoadingSimilar(true);
    try {
      const similar = await getSimilarMovies(movieId, 12);
      setSimilarMovies(similar);
    } catch (error) {
      console.error('Error fetching similar movies:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleRetry = () => {
    fetchMovieDetails();
    fetchSimilarMovies();
  };

  const handleWatchTrailer = () => {
    if (!movie) return;
    
    const trailerUrl = getTrailerSearchUrl(movie);
    
    // Handle iframe context
    if (window.self !== window.top) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: trailerUrl } }, "*");
    } else {
      window.open(trailerUrl, '_blank', 'noopener,noreferrer');
    }
    
    toast.success('Opening trailer search...');
  };

  const handleAddToWatchlist = () => {
    if (!movie) return;
    
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    
    if (watchlist.includes(movie.id)) {
      const filtered = watchlist.filter((id: number) => id !== movie.id);
      localStorage.setItem('watchlist', JSON.stringify(filtered));
      toast.success('Removed from watchlist');
    } else {
      watchlist.push(movie.id);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      toast.success('Added to watchlist!');
    }
  };

  const handleShare = async () => {
    if (!movie) return;
    
    const shareData = {
      title: movie.title,
      text: `Check out ${movie.title} (${movie.year}) - ${movie.vote_average}/10 ⭐`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Unable to Load Movie</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => router.push('/explore')} variant="outline">
                  Browse Movies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-96 w-full mb-4" />
          <div className="flex gap-6">
            <Skeleton className="w-48 h-72" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Backdrop Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {!backdropError && (movie.backdrop || movie.poster) ? (
          <Image
            src={movie.backdrop || movie.poster}
            alt={`${movie.title} backdrop`}
            fill
            className="object-cover"
            priority
            onError={() => setBackdropError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <div className="text-8xl">🎬</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        
        {/* Play Trailer Button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button
            size="lg"
            className="gap-2 text-lg px-8"
            onClick={handleWatchTrailer}
          >
            <Play className="h-5 w-5" />
            Search Trailer
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Poster */}
          <div className="flex-shrink-0">
            {!imageError && movie.poster ? (
              <div className="relative w-64 h-96 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-64 h-96 bg-muted rounded-xl shadow-2xl flex items-center justify-center">
                <div className="text-6xl">🎬</div>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
              {movie.original_title !== movie.title && (
                <p className="text-lg text-muted-foreground italic">{movie.original_title}</p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-muted-foreground">({movie.vote_count.toLocaleString()} votes)</span>
              </div>
              
              {movie.runtime && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{movie.runtime} min</span>
                </div>
              )}
              
              {movie.year && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{movie.year}</span>
                </div>
              )}

              {movie.language && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-5 w-5" />
                  <span>{movie.language.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre, index) => (
                <Badge key={`${genre}-${index}`} variant="secondary" className="text-base px-4 py-1">
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleAddToWatchlist} className="gap-2">
                <Plus className="h-5 w-5" />
                Add to Watchlist
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-5 w-5" />
                Share
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Bookmark className="h-5 w-5" />
                Save
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Heart className="h-5 w-5" />
                Like
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="similar">Similar Movies</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="bg-card rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {movie.overview || 'No synopsis available.'}
              </p>
            </div>

            {movie.director && movie.director !== 'Unknown' && (
              <div className="bg-card rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Director</h2>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {movie.director.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{movie.director}</p>
                    <p className="text-muted-foreground">Director</p>
                  </div>
                </div>
              </div>
            )}

            {movie.keywords && movie.keywords.length > 0 && (
              <div className="bg-card rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.slice(0, 15).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-base px-3 py-1">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Release Date</p>
                <p className="text-xl font-semibold">{movie.release_date || 'Unknown'}</p>
              </div>
              <div className="bg-card rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Popularity</p>
                <p className="text-xl font-semibold">{movie.popularity.toFixed(1)}</p>
              </div>
              <div className="bg-card rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Language</p>
                <p className="text-xl font-semibold">{movie.language.toUpperCase()}</p>
              </div>
            </div>
          </TabsContent>

          {/* Cast Tab */}
          <TabsContent value="cast" className="space-y-8">
            {movie.cast && movie.cast.length > 0 ? (
              <div className="bg-card rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.cast.slice(0, 12).map((actor, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="text-lg">
                          {actor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{actor.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {actor.character || 'Unknown role'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-12 text-center">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No cast information available</p>
              </div>
            )}
          </TabsContent>

          {/* Similar Movies Tab */}
          <TabsContent value="similar" className="space-y-6">
            {loadingSimilar ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
                ))}
              </div>
            ) : similarMovies.length > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Movies You Might Like</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similarMovies.map((similar) => (
                    <MovieCard key={similar.id} movie={similar} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-card rounded-xl p-12 text-center">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No similar movies found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
