/**
 * Utility functions for safe genre handling across all API variations
 * Handles: array of objects, single object, string, null, undefined
 */

type GenreInput = 
  | { id?: number; name?: string }[]
  | { id?: number; name?: string }
  | string
  | string[]
  | null
  | undefined;

/**
 * Normalize genres from any format to a string array
 * @param genres - Raw genres data from API (any format)
 * @param limit - Maximum number of genres to return (default: 3)
 * @returns Array of genre names (strings)
 */
export function normalizeGenres(genres: GenreInput, limit: number = 3): string[] {
  const genreNames: string[] = [];

  if (!genres) {
    return genreNames;
  }

  // Handle array of objects: [{id: 28, name: "Action"}]
  if (Array.isArray(genres)) {
    genres.slice(0, limit).forEach(genre => {
      if (typeof genre === 'object' && genre !== null) {
        // Object with name property
        if (genre.name) {
          genreNames.push(genre.name);
        } else if (genre.id) {
          // Fallback to id if name is missing
          genreNames.push(String(genre.id));
        }
      } else if (typeof genre === 'string') {
        // Array of strings: ["Action", "Comedy"]
        genreNames.push(genre);
      }
    });
  } 
  // Handle single object: {id: 28, name: "Action"}
  else if (typeof genres === 'object' && genres !== null) {
    if ('name' in genres && genres.name) {
      genreNames.push(genres.name);
    } else if ('id' in genres && genres.id) {
      genreNames.push(String(genres.id));
    }
  } 
  // Handle single string: "Action"
  else if (typeof genres === 'string') {
    genreNames.push(genres);
  }

  return genreNames.slice(0, limit);
}

/**
 * Get display string for genres (comma-separated)
 * @param genres - Raw genres data from API (any format)
 * @param limit - Maximum number of genres to display (default: 3)
 * @returns Comma-separated genre string or empty string
 */
export function getGenreDisplay(genres: GenreInput, limit: number = 3): string {
  const normalized = normalizeGenres(genres, limit);
  return normalized.join(', ');
}

/**
 * Safe genre extraction for analytics and counting
 * @param genres - Raw genres data from API (any format)
 * @returns Array of all genre names (no limit)
 */
export function extractAllGenres(genres: GenreInput): string[] {
  return normalizeGenres(genres, Number.MAX_SAFE_INTEGER);
}
