import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, watchHistory, reviews, lists, movies } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
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

    // Get user profile
    const profile = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
      .orderBy(sql`${watchHistory.watchedAt} DESC`)
      .limit(10);

    // Get user reviews
    const userReviews = await db
      .select({
        review: reviews,
        movie: movies,
      })
      .from(reviews)
      .leftJoin(movies, eq(reviews.movieId, movies.id))
      .where(eq(reviews.userId, user.userId))
      .orderBy(sql`${reviews.createdAt} DESC`);

    // Get user lists
    const userLists = await db
      .select()
      .from(lists)
      .where(eq(lists.userId, user.userId))
      .orderBy(sql`${lists.createdAt} DESC`);

    return NextResponse.json({
      profile: profile[0],
      watchHistory: history,
      reviews: userReviews,
      lists: userLists,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    const updatedUser = await db
      .update(users)
      .set({
        ...updates,
        lastActive: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))
      .returning();

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
