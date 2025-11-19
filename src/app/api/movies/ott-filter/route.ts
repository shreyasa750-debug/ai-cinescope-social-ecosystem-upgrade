import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ottAvailability, movies } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const region = searchParams.get('region') ?? 'US';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate platform parameter is provided
    if (!platform) {
      return NextResponse.json(
        { 
          error: 'Platform parameter is required',
          code: 'MISSING_PLATFORM'
        },
        { status: 400 }
      );
    }

    // Query ottAvailability table with conditions
    const ottRecords = await db
      .select()
      .from(ottAvailability)
      .where(
        and(
          eq(ottAvailability.platform, platform),
          eq(ottAvailability.region, region),
          eq(ottAvailability.available, true)
        )
      );

    // Get total count for pagination
    const total = ottRecords.length;

    // Get movieIds from ottRecords
    const movieIds = ottRecords.map(record => record.movieId);

    // If no movies found, return empty array
    if (movieIds.length === 0) {
      return NextResponse.json({
        movies: [],
        pagination: {
          platform,
          region,
          limit,
          offset,
          total: 0
        }
      });
    }

    // Fetch movie details with pagination and ordering
    const movieRecords = await db
      .select()
      .from(movies)
      .where(
        and(
          ...movieIds.map(id => eq(movies.id, id))
        )
      )
      .orderBy(desc(movies.rating))
      .limit(limit)
      .offset(offset);

    // Create a map of ottAvailability by movieId for quick lookup
    const ottMap = new Map(
      ottRecords.map(record => [record.movieId, record])
    );

    // Combine movie data with OTT info
    const result = movieRecords.map(movie => ({
      movie: {
        id: movie.id,
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        rating: movie.rating,
        genres: movie.genres,
        releaseDate: movie.releaseDate,
        overview: movie.overview
      },
      ottInfo: {
        platform: ottMap.get(movie.id)?.platform ?? platform,
        region: ottMap.get(movie.id)?.region ?? region
      }
    }));

    return NextResponse.json({
      movies: result,
      pagination: {
        platform,
        region,
        limit,
        offset,
        total
      }
    });

  } catch (error) {
    console.error('GET /api/movies/ott-filter error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}