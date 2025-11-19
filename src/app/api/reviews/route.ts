import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, users, movies } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { movieId, rating, title, content, spoilers } = await request.json();

    if (!movieId || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newReview = await db
      .insert(reviews)
      .values({
        userId: user.userId,
        movieId,
        rating,
        title,
        content,
        spoilers: spoilers || false,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Update user stats
    await db.execute(
      sql`UPDATE users SET stats = json_set(stats, '$.reviewsWritten', json_extract(stats, '$.reviewsWritten') + 1) WHERE id = ${user.userId}`
    );

    return NextResponse.json({ review: newReview[0] });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const userId = searchParams.get('userId');

    let query = db
      .select({
        review: reviews,
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
          persona: users.persona,
        },
        movie: {
          id: movies.id,
          title: movies.title,
          posterPath: movies.posterPath,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(movies, eq(reviews.movieId, movies.id));

    if (movieId) {
      query = query.where(eq(reviews.movieId, parseInt(movieId)));
    }

    if (userId) {
      query = query.where(eq(reviews.userId, parseInt(userId)));
    }

    const results = await query.orderBy(sql`${reviews.createdAt} DESC`);

    return NextResponse.json({ reviews: results });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
