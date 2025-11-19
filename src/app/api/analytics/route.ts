import { NextResponse } from 'next/server';
import { db } from '@/db';
import { watchHistory, movies, reviews } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { extractAllGenres } from '@/lib/genre-utils';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get watch history with movie details
    const history = await db
      .select({
        watchHistory,
        movie: movies,
      })
      .from(watchHistory)
      .leftJoin(movies, eq(watchHistory.movieId, movies.id))
      .where(eq(watchHistory.userId, user.userId))
      .orderBy(watchHistory.watchedAt);

    // Calculate genre distribution
    const genreCount: Record<string, number> = {};
    const monthlyWatches: Record<string, number> = {};
    const ratingDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    let totalWatchTime = 0;

    history.forEach(({ watchHistory: wh, movie }) => {
      if (movie) {
        // Genre counting - now safe for all formats
        const genreNames = extractAllGenres(movie.genres);
        genreNames.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });

        // Monthly watches
        const month = wh.watchedAt.substring(0, 7); // YYYY-MM
        monthlyWatches[month] = (monthlyWatches[month] || 0) + 1;

        // Rating distribution
        if (wh.rating) {
          ratingDistribution[wh.rating] = (ratingDistribution[wh.rating] || 0) + 1;
        }

        // Total watch time
        if (movie.runtime) {
          totalWatchTime += movie.runtime;
        }
      }
    });

    // Get user reviews count
    const userReviews = await db
      .select({ count: sql`count(*)` })
      .from(reviews)
      .where(eq(reviews.userId, user.userId));

    const reviewsCount = Number(userReviews[0]?.count || 0);

    // Calculate favorite genres (top 5)
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = Object.entries(monthlyWatches)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));

    return NextResponse.json({
      totalMoviesWatched: history.length,
      totalWatchTimeMinutes: totalWatchTime,
      totalWatchTimeHours: Math.round(totalWatchTime / 60),
      totalReviews: reviewsCount,
      topGenres,
      monthlyTrend,
      ratingDistribution: Object.entries(ratingDistribution).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
      })),
      averageRating: history.reduce((sum, h) => sum + (h.watchHistory.rating || 0), 0) / (history.length || 1),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}