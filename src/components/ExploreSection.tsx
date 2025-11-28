"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, TrendingUp, Star, Sparkles, X, Loader2, ChevronDown } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { toast } from 'sonner';

interface Movie {
  id: number;
  title: string;
  posterPath?: string;
  poster_path?: string;
  rating: number;
  year: number;
  genre: string;
  language?: string;
  runtime?: number;
}

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Documentary'];
const YEARS = Array.from({ length: 50 }, (_, i) => 2024 - i);
const LANGUAGES = ['English', 'Spanish', 'French', 'Japanese', 'Korean', 'Hindi', 'Mandarin'];

export function ExploreSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [ratingRange, setRatingRange] = useState<number[]>([0, 10]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [browseMovies, setBrowseMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch trending movies
  const fetchTrending = async () => {
    try {
      const response = await fetch('/api/movies/search?trending=true&limit=10');
      const data = await response.json();
      if (data.movies) {
        setTrendingMovies(data.movies);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations?limit=10');
      const data = await response.json();
      if (data.recommendations) {
        setRecommendedMovies(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Fetch browse movies with filters
  const fetchBrowseMovies = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedGenres.length > 0) params.append('genre', selectedGenres[0]);
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      params.append('minRating', ratingRange[0].toString());
      params.append('maxRating', ratingRange[1].toString());
      params.append('sortBy', sortBy);
      params.append('page', (isLoadMore ? page : 1).toString());
      params.append('limit', '20');

      const response = await fetch(`/api/movies/search?${params.toString()}`);
      const data = await response.json();

      if (data.movies) {
        if (isLoadMore) {
          setBrowseMovies((prev) => [...prev, ...data.movies]);
        } else {
          setBrowseMovies(data.movies);
          setPage(1);
        }
        setHasMore(data.movies.length === 20);
      }
    } catch (error) {
      console.error('Error fetching browse movies:', error);
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTrending();
    fetchRecommendations();
    fetchBrowseMovies();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrowseMovies();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenres, selectedYear, selectedLanguage, ratingRange, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchBrowseMovies(true);
    }
  }, [page]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedYear('all');
    setSelectedLanguage('all');
    setRatingRange([0, 10]);
    setSortBy('popularity');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedGenres.length > 0 ||
    selectedYear !== 'all' ||
    selectedLanguage !== 'all' ||
    ratingRange[0] > 0 ||
    ratingRange[1] < 10 ||
    sortBy !== 'popularity';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Search Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-600/20 p-8 md:p-12">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Explore Movies
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover trending films, get personalized recommendations, and browse our entire collection
            </p>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for movies, actors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
              />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Filters</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Genre Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Genre</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Release Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rating Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rating Range</label>
              <span className="text-sm text-muted-foreground">
                {ratingRange[0]} - {ratingRange[1]} ⭐
              </span>
            </div>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={ratingRange}
              onValueChange={setRatingRange}
              className="w-full"
            />
          </div>
        </div>

        {/* Trending Now Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Recommended For You Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-3xl font-bold">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recommendedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Browse More Films Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Browse More Films</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {browseMovies.map((movie) => (
                  <MovieCard key={`${movie.id}-${Math.random()}`} movie={movie} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="py-4">
                {loadingMore && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Load More Button (fallback) */}
              {!loadingMore && hasMore && browseMovies.length > 0 && (
                <div className="flex justify-center pt-8">
                  <Button
                    onClick={() => {
                      setPage((prev) => prev + 1);
                    }}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    Load More
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!hasMore && browseMovies.length > 0 && (
                <p className="text-center text-muted-foreground py-8">
                  You've reached the end of the collection
                </p>
              )}

              {browseMovies.length === 0 && !loading && (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">
                    No movies found matching your filters
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
