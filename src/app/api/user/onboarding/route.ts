import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, watchHistory, movies } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { ratings } = body;

    // Validate ratings array
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return NextResponse.json({ 
        error: 'Ratings array is required and must not be empty',
        code: 'INVALID_RATINGS' 
      }, { status: 400 });
    }

    // Validate each rating object
    for (const rating of ratings) {
      if (!rating.movieId || typeof rating.movieId !== 'number') {
        return NextResponse.json({ 
          error: 'Each rating must have a valid movieId',
          code: 'INVALID_MOVIE_ID' 
        }, { status: 400 });
      }
      if (!rating.rating || typeof rating.rating !== 'number' || rating.rating < 1 || rating.rating > 5) {
        return NextResponse.json({ 
          error: 'Each rating must be a number between 1 and 5',
          code: 'INVALID_RATING_VALUE' 
        }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    // Insert watch history records for each rating
    const watchHistoryInserts = ratings.map(rating => ({
      userId: user.id,
      movieId: rating.movieId,
      rating: rating.rating,
      watchedAt: now,
      createdAt: now,
    }));

    await db.insert(watchHistory).values(watchHistoryInserts);

    // Fetch movie details for the rated movies to extract genres and AI tags
    const movieIds = ratings.map(r => r.movieId);
    const ratedMovies = await db.select()
      .from(movies)
      .where(inArray(movies.id, movieIds));

    // Create a map of movieId to rating for weighted analysis
    const ratingMap = new Map(ratings.map(r => [r.movieId, r.rating]));

    // Analyze genres and moods with weighted frequency based on ratings
    const genreFrequency: Map<string, number> = new Map();
    const moodFrequency: Map<string, number> = new Map();

    for (const movie of ratedMovies) {
      const movieRating = ratingMap.get(movie.id) || 1;
      const weight = movieRating; // Higher ratings give more weight

      // Process genres
      if (movie.genres && Array.isArray(movie.genres)) {
        for (const genre of movie.genres) {
          if (typeof genre === 'string') {
            const current = genreFrequency.get(genre) || 0;
            genreFrequency.set(genre, current + weight);
          }
        }
      }

      // Process AI tags (moods)
      if (movie.aiTags && Array.isArray(movie.aiTags)) {
        for (const tag of movie.aiTags) {
          if (typeof tag === 'string') {
            const current = moodFrequency.get(tag) || 0;
            moodFrequency.set(tag, current + weight);
          }
        }
      }
    }

    // Sort and select top genres and moods
    const topGenres = Array.from(genreFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    const topMoods = Array.from(moodFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Build preferences object
    const preferences = {
      genres: topGenres,
      moods: topMoods,
      watchHabits: {
        onboarded: true
      }
    };

    // Update user stats
    const currentStats = (user.stats as any) || {};
    const updatedStats = {
      ...currentStats,
      moviesWatched: ratings.length
    };

    // Update user record with preferences and stats
    await db.update(users)
      .set({
        preferences: preferences,
        stats: updatedStats,
        lastActive: now
      })
      .where(eq(users.id, user.id));

    // Return success response
    return NextResponse.json({
      success: true,
      preferences: {
        genres: topGenres,
        moods: topMoods
      },
      message: 'Profile created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/user/onboarding error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}