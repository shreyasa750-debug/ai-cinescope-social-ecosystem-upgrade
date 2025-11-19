/**
 * TMDB (The Movie Database) API Integration
 * Get your API key from: https://www.themoviedb.org/settings/api
 */

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
    }>;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
}

/**
 * Get full image URL from TMDB path
 * @param path - Image path from TMDB API (e.g., "/abc123.jpg")
 * @param size - Image size: w92, w154, w185, w342, w500, w780, original
 */
export function getTMDBImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Get movie poster URL
 */
export function getMoviePosterUrl(path: string | null | undefined): string;
export function getMoviePosterUrl(movie: any): string;
export function getMoviePosterUrl(pathOrMovie: any): string {
  // Handle object with multiple possible field names
  if (typeof pathOrMovie === 'object' && pathOrMovie !== null) {
    const path = pathOrMovie.posterPath || pathOrMovie.poster_path || pathOrMovie.poster || null;
    return getTMDBImageUrl(path, 'w500');
  }
  // Handle direct string path
  return getTMDBImageUrl(pathOrMovie, 'w500');
}

/**
 * Get movie backdrop URL
 */
export function getMovieBackdropUrl(path: string | null): string {
  return getTMDBImageUrl(path, 'w780');
}

/**
 * Get person profile URL
 */
export function getPersonProfileUrl(path: string | null): string {
  return getTMDBImageUrl(path, 'w185');
}

/**
 * Fetch movie details from TMDB
 */
export async function fetchTMDBMovie(tmdbId: number): Promise<TMDBMovie | null> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching TMDB movie:', error);
    return null;
  }
}

/**
 * Search movies on TMDB
 */
export async function searchTMDBMovies(query: string, page: number = 1): Promise<any> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return { results: [], total_results: 0 };
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return { results: [], total_results: 0 };
  }
}

/**
 * Get popular movies from TMDB
 */
export async function getPopularMovies(page: number = 1): Promise<any> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return { results: [] };
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return { results: [] };
  }
}

/**
 * Get YouTube trailer URL
 */
export function getYouTubeTrailerUrl(movie: TMDBMovie): string | null {
  if (!movie.videos?.results) return null;
  
  const trailer = movie.videos.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );
  
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}`;
}

/**
 * Extract director from credits
 */
export function getDirector(movie: TMDBMovie): string {
  if (!movie.credits?.crew) return 'Unknown';
  
  const director = movie.credits.crew.find((person) => person.job === 'Director');
  return director?.name || 'Unknown';
}

/**
 * Get top cast members
 */
export function getTopCast(movie: TMDBMovie, limit: number = 5): Array<{ name: string; character: string; profile_path: string | null }> {
  if (!movie.credits?.cast) return [];
  
  return movie.credits.cast.slice(0, limit);
}