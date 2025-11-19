import { NextResponse } from 'next/server';
import { db } from '@/db';
import { movies, watchHistory, users } from '@/db/schema';
import { eq, inArray, sql, and, ne } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mood = searchParams.get('mood');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's watch history
    const userHistory = await db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, user.userId))
      .orderBy(watchHistory.watchedAt);

    const watchedMovieIds = userHistory.map(h => h.movieId);

    // Get user preferences
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    const preferences = userProfile[0]?.preferences as any;
    const preferredGenres = preferences?.genres || [];

    let recommendedMovies;

    if (mood) {
      // Mood-based recommendations
      recommendedMovies = await db
        .select()
        .from(movies)
        .where(
          and(
            sql`${movies.aiTags} LIKE ${`%${mood}%`}`,
            watchedMovieIds.length > 0 
              ? sql`${movies.id} NOT IN (${watchedMovieIds.join(',')})` 
              : undefined
          )
        )
        .orderBy(sql`${movies.rating} DESC`)
        .limit(limit);
    } else if (preferredGenres.length > 0) {
      // Genre-based recommendations
      const genreConditions = preferredGenres.map((genre: string) => 
        sql`${movies.genres} LIKE ${`%${genre}%`}`
      );
      
      recommendedMovies = await db
        .select()
        .from(movies)
        .where(
          and(
            sql`(${genreConditions.join(' OR ')})`,
            watchedMovieIds.length > 0 
              ? sql`${movies.id} NOT IN (${watchedMovieIds.join(',')})` 
              : undefined
          )
        )
        .orderBy(sql`${movies.popularity} DESC`)
        .limit(limit);
    } else {
      // Popular recommendations for new users
      recommendedMovies = await db
        .select()
        .from(movies)
        .where(
          watchedMovieIds.length > 0 
            ? sql`${movies.id} NOT IN (${watchedMovieIds.join(',')})` 
            : undefined
        )
        .orderBy(sql`${movies.rating} * ${movies.popularity} DESC`)
        .limit(limit);
    }

    // Transform results to camelCase for frontend consistency
    const transformedMovies = recommendedMovies.map(movie => ({
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      posterPath: movie.posterPath,
      backdropPath: movie.backdropPath,
      overview: movie.overview,
      releaseDate: movie.releaseDate,
      runtime: movie.runtime,
      genres: movie.genres,
      director: movie.director,
      cast: movie.cast,
      rating: movie.rating,
      voteCount: movie.voteCount,
      popularity: movie.popularity,
      trailers: movie.trailers,
      underrated: movie.underrated,
      aiTags: movie.aiTags,
      createdAt: movie.createdAt,
    }));

    return NextResponse.json({
      recommendations: transformedMovies,
      reason: mood ? `Based on your ${mood} mood` : 
              preferredGenres.length > 0 ? `Based on your genre preferences` : 
              'Popular picks for you',
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}