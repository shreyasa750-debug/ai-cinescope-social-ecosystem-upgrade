"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  Clock, 
  Calendar, 
  Heart, 
  Plus,
  Play,
  MessageSquare,
  Users,
  Bookmark,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { normalizeGenres } from '@/lib/genre-utils';
import { getMoviePosterUrl, getMovieBackdropUrl, getPersonProfileUrl } from '@/lib/tmdb';
import { toast } from 'sonner';

interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  rating: number;
  releaseDate: string;
  runtime: number;
  genres: any;
  director: string;
  cast: any;
  voteCount: number;
  trailers: any;
}

interface Review {
  review: {
    id: number;
    rating: number;
    title: string;
    content: string;
    spoilers: boolean;
    likes: number;
    createdAt: string;
  };
  user: {
    id: number;
    username: string;
    profileImage: string;
    persona: string;
  };
}

interface MovieDetailsDialogProps {
  movieId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailsDialog({ movieId, open, onOpenChange }: MovieDetailsDialogProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    if (movieId && open) {
      fetchMovieDetails();
    }
  }, [movieId, open]);

  const fetchMovieDetails = async () => {
    if (!movieId) return;

    setLoading(true);
    setError(null);
    setImageError(false);
    setBackdropError(false);
    
    try {
      const response = await fetch(`/api/movies/${movieId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load movie details (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.movie) {
        setMovie(data.movie);
        setReviews(data.reviews || []);
      } else {
        throw new Error('Movie data not found');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load movie details');
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchMovieDetails();
  };

  const parseCast = (cast: any): string[] => {
    if (!cast) return [];
    if (typeof cast === 'string') {
      try {
        return JSON.parse(cast);
      } catch {
        return [cast];
      }
    }
    if (Array.isArray(cast)) return cast;
    return [];
  };

  const parseTrailers = (trailers: any): string[] => {
    if (!trailers) return [];
    if (typeof trailers === 'string') {
      try {
        return JSON.parse(trailers);
      } catch {
        return [trailers];
      }
    }
    if (Array.isArray(trailers)) return trailers;
    return [];
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Unable to Load Movie</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => onOpenChange(false)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {loading || !movie ? (
          <div className="p-6">
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
          </div>
        ) : (
          <ScrollArea className="max-h-[90vh]">
            {/* Backdrop */}
            <div className="relative h-64 md:h-80">
              {!backdropError ? (
                <img
                  src={getMovieBackdropUrl(movie.backdropPath) || getMoviePosterUrl(movie.posterPath)}
                  alt={`${movie.title} backdrop`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setBackdropError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                  <div className="text-6xl">🎬</div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
              
              {/* Play Button */}
              {parseTrailers(movie.trailers)[0] && (
                <Button
                  size="lg"
                  className="absolute bottom-4 left-4 gap-2"
                  onClick={() => {
                    const trailerUrl = parseTrailers(movie.trailers)[0];
                    if (window.self !== window.top) {
                      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: trailerUrl } }, "*");
                    } else {
                      window.open(trailerUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </Button>
              )}
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex gap-6 mb-6">
                {!imageError ? (
                  <img
                    src={getMoviePosterUrl(movie.posterPath)}
                    alt={`${movie.title} poster`}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg hidden md:block"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-32 h-48 bg-muted rounded-lg shadow-lg hidden md:flex items-center justify-center">
                    <div className="text-4xl">🎬</div>
                  </div>
                )}
                
                <div className="flex-1">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-3xl font-bold">{movie.title}</DialogTitle>
                  </DialogHeader>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{movie.rating?.toFixed(1)}</span>
                      <span className="text-muted-foreground">({movie.voteCount} votes)</span>
                    </div>
                    
                    {movie.runtime && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{movie.runtime} min</span>
                      </div>
                    )}
                    
                    {movie.releaseDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {normalizeGenres(movie.genres, 5).map((genre, index) => (
                      <Badge key={`${genre}-${index}`} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add to Watchlist
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Heart className="h-4 w-4" />
                      Favorite
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Bookmark className="h-4 w-4" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({reviews.length})
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {movie.overview || 'No synopsis available.'}
                    </p>
                  </div>

                  {movie.director && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Director</h3>
                      <p className="text-muted-foreground">{movie.director}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Cast Tab */}
                <TabsContent value="cast" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {parseCast(movie.cast).slice(0, 12).map((actor, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{actor.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.review.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-2">
                            <Avatar>
                              <AvatarImage src={review.user.profileImage} />
                              <AvatarFallback>
                                {review.user.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{review.user.username}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {review.user.persona}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.review.rating
                                          ? 'fill-yellow-500 text-yellow-500'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <h4 className="font-semibold mb-1">{review.review.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.review.content}
                          </p>
                          
                          {review.review.spoilers && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              Contains Spoilers
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}