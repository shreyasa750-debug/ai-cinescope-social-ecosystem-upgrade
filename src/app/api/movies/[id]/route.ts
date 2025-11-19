import { NextResponse } from 'next/server';
import { db } from '@/db';
import { movies, reviews, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = parseInt(params.id);

    // Get movie details
    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    if (movie.length === 0) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Get reviews with user info
    const movieReviews = await db
      .select({
        review: reviews,
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
          persona: users.persona,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.movieId, movieId))
      .orderBy(reviews.createdAt);

    // Transform movie data to camelCase for frontend consistency
    const transformedMovie = {
      id: movie[0].id,
      tmdbId: movie[0].tmdbId,
      title: movie[0].title,
      posterPath: movie[0].posterPath,
      backdropPath: movie[0].backdropPath,
      overview: movie[0].overview,
      releaseDate: movie[0].releaseDate,
      runtime: movie[0].runtime,
      genres: movie[0].genres,
      director: movie[0].director,
      cast: movie[0].cast,
      rating: movie[0].rating,
      voteCount: movie[0].voteCount,
      popularity: movie[0].popularity,
      trailers: movie[0].trailers,
      underrated: movie[0].underrated,
      aiTags: movie[0].aiTags,
      createdAt: movie[0].createdAt,
    };

    return NextResponse.json({
      movie: transformedMovie,
      reviews: movieReviews,
    });
  } catch (error) {
    console.error('Get movie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}