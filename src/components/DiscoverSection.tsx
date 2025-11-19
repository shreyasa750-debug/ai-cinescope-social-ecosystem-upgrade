"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Star, Calendar, Eye, TrendingUp, Sparkles, Clock, Smile, Heart, Zap, Ghost, Drama, Coffee, Tv, Film, Clapperboard, Popcorn, Globe } from 'lucide-react';
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
  runtime: number;
  genres: any;
  underrated: boolean;
  ottPlatforms?: string[];
}

const MOODS = [
  { id: 'feel-good', label: 'Feel Good', icon: Smile, color: 'bg-yellow-500' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'bg-pink-500' },
  { id: 'thrilling', label: 'Thrilling', icon: Zap, color: 'bg-orange-500' },
  { id: 'scary', label: 'Scary', icon: Ghost, color: 'bg-purple-500' },
  { id: 'dramatic', label: 'Dramatic', icon: Drama, color: 'bg-blue-500' },
  { id: 'chill', label: 'Chill', icon: Coffee, color: 'bg-green-500' },
];

const OTT_PLATFORMS = [
  { id: 'netflix', label: 'Netflix', color: 'bg-red-600' },
  { id: 'prime', label: 'Prime Video', color: 'bg-blue-600' },
  { id: 'disney', label: 'Disney+', color: 'bg-blue-500' },
  { id: 'hbo', label: 'HBO Max', color: 'bg-purple-600' },
  { id: 'apple', label: 'Apple TV+', color: 'bg-gray-800' },
];

export function DiscoverSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedOTT, setSelectedOTT] = useState<string[]>([]);
  const [minRating, setMinRating] = useState([0]);
  const [runtime, setRuntime] = useState([0, 240]);
  const [sortBy, setSortBy] = useState('popularity');
  const [showUnderratedOnly, setShowUnderratedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contentType, setContentType] = useState('movies');

  const genres = ['action', 'comedy', 'drama', 'sci-fi', 'horror', 'thriller', 'romance', 'animation', 'documentary'];

  useEffect(() => {
    fetchMovies();
  }, [searchQuery, selectedGenres, selectedMoods, selectedOTT, minRating, runtime, sortBy, showUnderratedOnly, page, contentType]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        genres: selectedGenres.join(','),
        moods: selectedMoods.join(','),
        ott: selectedOTT.join(','),
        minRating: minRating[0].toString(),
        minRuntime: runtime[0].toString(),
        maxRuntime: runtime[1].toString(),
        sortBy,
        page: page.toString(),
        underrated: showUnderratedOnly.toString(),
        type: contentType,
      });

      const response = await fetch(`/api/movies/search?${params}`);
      const data = await response.json();
      setMovies(data.movies || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const toggleOTT = (platform: string) => {
    setSelectedOTT(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedMoods([]);
    setSelectedOTT([]);
    setMinRating([0]);
    setRuntime([0, 240]);
    setSortBy('popularity');
    setShowUnderratedOnly(false);
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Content</h1>
        <p className="text-muted-foreground">
          Explore movies, series, anime, documentaries and more
        </p>
      </div>

      {/* Content Type Tabs */}
      <Tabs value={contentType} onValueChange={setContentType} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="movies" className="gap-2">
            <Film className="h-4 w-4" />
            Movies
          </TabsTrigger>
          <TabsTrigger value="series" className="gap-2">
            <Tv className="h-4 w-4" />
            Series
          </TabsTrigger>
          <TabsTrigger value="anime" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Anime
          </TabsTrigger>
          <TabsTrigger value="documentaries" className="gap-2">
            <Globe className="h-4 w-4" />
            Documentaries
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${contentType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Moods */}
            <div className="space-y-2">
              <Label>Mood</Label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(mood => {
                  const Icon = mood.icon;
                  return (
                    <Badge
                      key={mood.id}
                      variant={selectedMoods.includes(mood.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleMood(mood.id)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {mood.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <Label>Genres</Label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* OTT Platforms */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                Available On
              </Label>
              <div className="flex flex-wrap gap-2">
                {OTT_PLATFORMS.map(platform => (
                  <Badge
                    key={platform.id}
                    variant={selectedOTT.includes(platform.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleOTT(platform.id)}
                  >
                    {platform.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Runtime */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Runtime: {runtime[0]}-{runtime[1]} min
              </Label>
              <Slider
                value={runtime}
                onValueChange={setRuntime}
                max={240}
                step={10}
                min={0}
                className="w-full"
                minStepsBetweenThumbs={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 min</span>
                <span>240 min</span>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating: {minRating[0]}/10</Label>
              <Slider
                value={minRating}
                onValueChange={setMinRating}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Underrated Only */}
            <div className="flex items-center gap-2">
              <Button
                variant={showUnderratedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowUnderratedOnly(!showUnderratedOnly)}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Hidden Gems
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>

        {/* Movies Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-80 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : movies.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No {contentType} found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie) => (
                  <Card 
                    key={movie.id} 
                    className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getMoviePosterUrl(movie.posterPath)}
                        alt={movie.title}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {movie.underrated && (
                        <Badge className="absolute top-2 right-2 gap-1">
                          <Sparkles className="h-3 w-3" />
                          Hidden Gem
                        </Badge>
                      )}
                      {/* Content Type Badge */}
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        {contentType === 'series' && <Tv className="h-3 w-3 mr-1" />}
                        {contentType === 'anime' && <Sparkles className="h-3 w-3 mr-1" />}
                        {contentType === 'documentaries' && <Globe className="h-3 w-3 mr-1" />}
                        {contentType.slice(0, -1)}
                      </Badge>
                      {/* OTT Badges */}
                      {movie.ottPlatforms && movie.ottPlatforms.length > 0 && (
                        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                          {movie.ottPlatforms.slice(0, 3).map((platform) => {
                            const ottInfo = OTT_PLATFORMS.find(p => p.id === platform);
                            return (
                              <Badge 
                                key={platform} 
                                className={`${ottInfo?.color} text-white text-xs px-2 py-0.5`}
                              >
                                {ottInfo?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <Button size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
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
                        {movie.runtime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {movie.runtime}m
                          </span>
                        )}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {normalizeGenres(movie.genres, 3).map((genre, index) => (
                          <Badge key={`${genre}-${index}`} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button variant="outline" disabled>
                  Page {page}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={movies.length === 0}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Movie Details Dialog */}
      <MovieDetailsDialog
        movieId={selectedMovieId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}