import { NextResponse } from 'next/server';
import { db } from '@/db';
import { movies } from '@/db/schema';
import { like, or, sql, and, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxRating = parseFloat(searchParams.get('maxRating') || '10');
    const yearFrom = searchParams.get('yearFrom');
    const yearTo = searchParams.get('yearTo');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const underratedOnly = searchParams.get('underrated') === 'true';
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(movies.title, `%${query}%`),
          like(movies.overview, `%${query}%`),
          like(movies.director, `%${query}%`)
        )
      );
    }

    if (minRating > 0 || maxRating < 10) {
      conditions.push(
        and(
          sql`${movies.rating} >= ${minRating}`,
          sql`${movies.rating} <= ${maxRating}`
        )
      );
    }

    if (yearFrom) {
      conditions.push(sql`${movies.releaseDate} >= ${yearFrom}-01-01`);
    }

    if (yearTo) {
      conditions.push(sql`${movies.releaseDate} <= ${yearTo}-12-31`);
    }

    if (underratedOnly) {
      conditions.push(sql`${movies.underrated} = 1`);
    }

    if (genres.length > 0) {
      const genreConditions = genres.map(genre => 
        like(movies.genres, `%${genre}%`)
      );
      conditions.push(or(...genreConditions));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'rating':
        orderBy = sql`${movies.rating} DESC`;
        break;
      case 'release_date':
        orderBy = sql`${movies.releaseDate} DESC`;
        break;
      case 'title':
        orderBy = sql`${movies.title} ASC`;
        break;
      default:
        orderBy = sql`${movies.popularity} DESC`;
    }

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await db
      .select()
      .from(movies)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(movies)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Transform results to camelCase for frontend consistency
    const transformedResults = results.map(movie => ({
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
      movies: transformedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}