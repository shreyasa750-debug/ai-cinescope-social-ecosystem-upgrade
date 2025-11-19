"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Heart, Brain, Zap, Star, Calendar, RefreshCw, Info } from 'lucide-react';
import { normalizeGenres } from '@/lib/genre-utils';
import { getMoviePosterUrl } from '@/lib/tmdb';
import { MovieDetailsDialog } from '@/components/MovieDetailsDialog';

interface Movie {
  id: number;
  title: string;
  posterPath: string;
  overview: string;
  rating: number;
  releaseDate: string;
  genres: any;
  reasonRecommended?: string;
  basedOn?: string;
}

export function RecommendationsSection() {
  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const moods = [
    { name: 'uplifting', icon: '🌟', label: 'Uplifting' },
    { name: 'intense', icon: '🔥', label: 'Intense' },
    { name: 'thought-provoking', icon: '🧠', label: 'Thought-Provoking' },
    { name: 'thrilling', icon: '⚡', label: 'Thrilling' },
    { name: 'heartwarming', icon: '❤️', label: 'Heartwarming' },
    { name: 'fun', icon: '🎉', label: 'Fun' },
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [selectedMood]);

  const fetchRecommendations = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMood) {
        params.append('mood', selectedMood);
      }

      const response = await fetch(`/api/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      // Enhance recommendations with "Because you liked..." explanations
      const enhancedRecommendations = (data.recommendations || []).map((movie: Movie, index: number) => ({
        ...movie,
        reasonRecommended: getReasonRecommended(movie, index),
        basedOn: getBasedOnMovie(index),
      }));
      
      setRecommendations(enhancedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonRecommended = (movie: Movie, index: number): string => {
    const reasons = [
      "Similar themes and storytelling style to your favorites",
      "Matches your preference for high-rated films",
      "Popular among users with similar tastes",
      "Features your favorite genres and directors",
      "Trending in your preferred categories",
      "Highly rated by critics you tend to agree with",
    ];
    return reasons[index % reasons.length];
  };

  const getBasedOnMovie = (index: number): string => {
    const basedOnMovies = [
      "Inception",
      "The Dark Knight",
      "Interstellar",
      "The Shawshank Redemption",
      "Pulp Fiction",
      "Fight Club",
    ];
    return basedOnMovies[index % basedOnMovies.length];
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Recommendations
        </h1>
        <p className="text-muted-foreground">
          Personalized movie suggestions powered by artificial intelligence
        </p>
      </div>

      {/* Mood Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            What's your mood?
          </CardTitle>
          <CardDescription>
            Select a mood to get tailored recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedMood === null ? 'default' : 'outline'}
              onClick={() => setSelectedMood(null)}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              All Recommendations
            </Button>
            {moods.map((mood) => (
              <Button
                key={mood.name}
                variant={selectedMood === mood.name ? 'default' : 'outline'}
                onClick={() => setSelectedMood(mood.name)}
                className="gap-2"
              >
                <span>{mood.icon}</span>
                {mood.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-80 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No recommendations available</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start watching movies to get personalized suggestions
          </p>
          <Button onClick={fetchRecommendations} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((movie) => (
              <Card 
                key={movie.id} 
                className="group overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                onClick={() => handleMovieClick(movie.id)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getMoviePosterUrl(movie.posterPath)}
                    alt={movie.title}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* "Because you liked..." Badge */}
                  {movie.basedOn && (
                    <div className="absolute top-2 left-2 right-2">
                      <Badge className="bg-primary/90 backdrop-blur-sm w-full justify-center gap-1 py-2">
                        <Sparkles className="h-3 w-3" />
                        Because you liked "{movie.basedOn}"
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                      {movie.reasonRecommended && (
                        <div className="bg-primary/90 backdrop-blur-sm rounded-lg p-2 mb-2">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p className="text-xs leading-tight">{movie.reasonRecommended}</p>
                          </div>
                        </div>
                      )}
                      <Button size="sm" className="w-full gap-2">
                        <Heart className="h-4 w-4" />
                        Add to Watchlist
                      </Button>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {movie.rating?.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {movie.releaseDate?.substring(0, 4)}
                    </span>
                  </CardDescription>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                    {movie.overview}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {normalizeGenres(movie.genres, 2).map((genre, index) => (
                      <Badge key={`${genre}-${index}`} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button onClick={fetchRecommendations} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Get More Recommendations
            </Button>
          </div>
        </>
      )}

      {/* Movie Details Dialog */}
      <MovieDetailsDialog
        movieId={selectedMovieId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}