import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ottAvailability } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;

    // Validate movie ID
    if (!movieId || isNaN(parseInt(movieId))) {
      return NextResponse.json(
        { 
          error: 'Valid movie ID is required',
          code: 'INVALID_MOVIE_ID' 
        },
        { status: 400 }
      );
    }

    const parsedMovieId = parseInt(movieId);

    // Query OTT availability for the movie where available is true
    const availability = await db
      .select({
        id: ottAvailability.id,
        platform: ottAvailability.platform,
        region: ottAvailability.region,
        available: ottAvailability.available,
        updatedAt: ottAvailability.updatedAt,
      })
      .from(ottAvailability)
      .where(
        and(
          eq(ottAvailability.movieId, parsedMovieId),
          eq(ottAvailability.available, true)
        )
      )
      .orderBy(asc(ottAvailability.platform));

    // Return response with movieId and availability array
    return NextResponse.json({
      movieId: parsedMovieId,
      availability: availability,
    });
  } catch (error) {
    console.error('GET /api/movies/[id]/ott error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}