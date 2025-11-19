import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { getMoviePosterUrl } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  posterPath: string;
  overview: string;
  releaseDate: string;
}

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const REQUIRED_RATINGS = 5;

  useEffect(() => {
    if (open) {
      fetchOnboardingMovies();
    }
  }, [open]);

  const fetchOnboardingMovies = async () => {
    try {
      const response = await fetch('/api/movies/onboarding');
      const data = await response.json();
      setMovies(data.movies || []);
    } catch (error) {
      console.error('Error fetching onboarding movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (movieId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [movieId]: rating }));
    
    // Move to next movie after a brief delay
    setTimeout(() => {
      if (currentIndex < movies.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  };

  const handleComplete = async () => {
    try {
      // Submit ratings to personalize recommendations
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings }),
      });
      onComplete();
    } catch (error) {
      console.error('Error submitting onboarding ratings:', error);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const ratedCount = Object.keys(ratings).length;
  const progress = (ratedCount / REQUIRED_RATINGS) * 100;
  const canComplete = ratedCount >= REQUIRED_RATINGS;

  const currentMovie = movies[currentIndex];

  if (loading) {
    return (
      <Dialog open={open}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to CineScope! 🎬</DialogTitle>
          <DialogDescription>
            Help us personalize your experience by rating {REQUIRED_RATINGS} movies. This will help us understand your taste and provide better recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{ratedCount} / {REQUIRED_RATINGS} movies rated</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Current Movie */}
          {currentMovie && (
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative h-80 md:h-auto">
                  <img
                    src={getMoviePosterUrl(currentMovie.posterPath)}
                    alt={currentMovie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:col-span-2 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{currentMovie.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentMovie.releaseDate?.substring(0, 4)}
                    </p>
                    <p className="text-sm line-clamp-4">{currentMovie.overview}</p>
                  </div>

                  {/* Rating Stars */}
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-3">How would you rate this movie?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(currentMovie.id, rating)}
                          className="group transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-10 w-10 transition-colors ${
                              ratings[currentMovie.id] >= rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted-foreground group-hover:text-yellow-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Movie Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {movies.map((movie, index) => (
              <button
                key={movie.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-24 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary scale-105'
                    : ratings[movie.id]
                    ? 'border-green-500'
                    : 'border-border'
                }`}
              >
                <img
                  src={getMoviePosterUrl(movie.posterPath)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
            >
              {canComplete ? 'Complete Setup' : `Rate ${REQUIRED_RATINGS - ratedCount} more`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
