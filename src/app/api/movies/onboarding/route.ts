import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { movies } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch movies with calculated score (rating * popularity)
    // and ensure diverse genres by selecting top movies
    const allMovies = await db.select({
      id: movies.id,
      tmdbId: movies.tmdbId,
      title: movies.title,
      posterPath: movies.posterPath,
      backdropPath: movies.backdropPath,
      rating: movies.rating,
      popularity: movies.popularity,
      genres: movies.genres,
      releaseDate: movies.releaseDate,
      overview: movies.overview,
      score: sql<number>`${movies.rating} * ${movies.popularity}`
    })
      .from(movies)
      .orderBy(desc(sql`${movies.rating} * ${movies.popularity}`))
      .limit(50); // Fetch more to ensure genre diversity

    if (allMovies.length === 0) {
      return NextResponse.json({ 
        movies: [] 
      }, { status: 200 });
    }

    // Select diverse movies by ensuring variety in genres
    const selectedMovies: typeof allMovies = [];
    const usedGenres = new Set<string>();

    for (const movie of allMovies) {
      if (selectedMovies.length >= 10) break;

      const movieGenres = Array.isArray(movie.genres) ? movie.genres : [];
      
      // Check if this movie adds new genre diversity
      const hasNewGenre = movieGenres.some((genre: string) => !usedGenres.has(genre));
      
      // If we have less than 10 movies, prioritize genre diversity
      // After that, just fill remaining slots with highest scores
      if (selectedMovies.length < 5) {
        // First 5: prioritize genre diversity
        if (hasNewGenre || usedGenres.size === 0) {
          selectedMovies.push(movie);
          movieGenres.forEach((genre: string) => usedGenres.add(genre));
        }
      } else {
        // Last 5: fill with highest scoring movies
        selectedMovies.push(movie);
        movieGenres.forEach((genre: string) => usedGenres.add(genre));
      }
    }

    // If we still don't have 10, add remaining high-scoring movies
    if (selectedMovies.length < 10) {
      for (const movie of allMovies) {
        if (selectedMovies.length >= 10) break;
        if (!selectedMovies.find(m => m.id === movie.id)) {
          selectedMovies.push(movie);
        }
      }
    }

    // Format response - remove the calculated score field
    const formattedMovies = selectedMovies.slice(0, 10).map(({ score, ...movie }) => movie);

    return NextResponse.json({ 
      movies: formattedMovies 
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/movies/onboarding error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}