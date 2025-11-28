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

// Skeleton Loader Component
function MovieCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-muted animate-pulse">
      <div className="aspect-[2/3] bg-muted-foreground/10" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
        <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
      </div>
    </div>
  );
}

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
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Cache for loaded pages
  const pageCache = useRef<Map<string, Movie[]>>(new Map());
  const observerTarget = useRef<HTMLDivElement>(null);

  // Generate cache key from current filters
  const getCacheKey = useCallback((pageNum: number) => {
    return JSON.stringify({
      searchQuery,
      selectedGenres,
      selectedYear,
      selectedLanguage,
      ratingRange,
      sortBy,
      page: pageNum,
    });
  }, [searchQuery, selectedGenres, selectedYear, selectedLanguage, ratingRange, sortBy]);

  // Fetch trending movies
  const fetchTrending = async () => {
    setLoadingTrending(true);
    try {
      const response = await fetch('/api/movies/search?trending=true&limit=10');
      const data = await response.json();
      if (data.movies) {
        setTrendingMovies(data.movies);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      toast.error('Failed to load trending movies');
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setLoadingRecommended(true);
    try {
      const response = await fetch('/api/recommendations?limit=10');
      const data = await response.json();
      if (data.recommendations) {
        setRecommendedMovies(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoadingRecommended(false);
    }
  };

  // Fetch browse movies with filters and caching
  const fetchBrowseMovies = async (pageNum: number, isLoadMore = false) => {
    const cacheKey = getCacheKey(pageNum);
    
    // Check cache first
    if (pageCache.current.has(cacheKey)) {
      const cachedMovies = pageCache.current.get(cacheKey)!;
      if (isLoadMore) {
        setBrowseMovies((prev) => [...prev, ...cachedMovies]);
      } else {
        setBrowseMovies(cachedMovies);
      }
      return;
    }

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
      params.append('page', pageNum.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/movies/search?${params.toString()}`);
      const data = await response.json();

      if (data.movies) {
        // Cache the results
        pageCache.current.set(cacheKey, data.movies);
        
        if (isLoadMore) {
          setBrowseMovies((prev) => [...prev, ...data.movies]);
        } else {
          setBrowseMovies(data.movies);
        }
        setHasMore(data.pagination?.hasMore ?? data.movies.length === 20);
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
    fetchBrowseMovies(1);
  }, []);

  // Refetch when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      pageCache.current.clear(); // Clear cache when filters change
      fetchBrowseMovies(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenres, selectedYear, selectedLanguage, ratingRange, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchBrowseMovies(page, true);
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
    pageCache.current.clear();
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
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-fade-in">
              Explore Movies
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover trending films, get personalized recommendations, and browse our entire collection
            </p>
            
            {/* Search Bar */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for movies, actors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2 transition-all focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Filters</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors">
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
                    className="cursor-pointer hover:bg-primary/80 transition-all hover:scale-105"
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
                <SelectTrigger className="transition-all hover:border-primary">
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
                <SelectTrigger className="transition-all hover:border-primary">
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
                <SelectTrigger className="transition-all hover:border-primary">
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
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loadingTrending ? (
              Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={`trending-skeleton-${i}`} />
              ))
            ) : (
              trendingMovies.map((movie) => (
                <MovieCard key={`trending-${movie.id}`} movie={movie} />
              ))
            )}
          </div>
        </section>

        {/* Recommended For You Section */}
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-3xl font-bold">Recommended For You</h2>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">AI Powered</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loadingRecommended ? (
              Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={`recommended-skeleton-${i}`} />
              ))
            ) : (
              recommendedMovies.map((movie) => (
                <MovieCard key={`recommended-${movie.id}`} movie={movie} />
              ))
            )}
          </div>
        </section>

        {/* Browse More Films Section */}
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-3xl font-bold">Browse More Films</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <MovieCardSkeleton key={`browse-skeleton-${i}`} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {browseMovies.map((movie, index) => (
                  <MovieCard key={`browse-${movie.id}-${index}`} movie={movie} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="py-4">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading more movies...</span>
                  </div>
                )}
              </div>

              {/* Load More Button (fallback) */}
              {!loadingMore && hasMore && browseMovies.length > 0 && (
                <div className="flex justify-center pt-8">
                  <Button
                    onClick={() => setPage((prev) => prev + 1)}
                    variant="outline"
                    size="lg"
                    className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
                  >
                    Load More
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!hasMore && browseMovies.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    🎬 You've reached the end of the collection
                  </p>
                </div>
              )}

              {browseMovies.length === 0 && !loading && (
                <div className="text-center py-20 space-y-4">
                  <div className="text-6xl">🔍</div>
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