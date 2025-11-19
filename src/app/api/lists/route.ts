import { NextResponse } from 'next/server';
import { db } from '@/db';
import { lists, listMovies, movies, users } from '@/db/schema';
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

    const { title, description, isPublic, movieIds } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const newList = await db
      .insert(lists)
      .values({
        userId: user.userId,
        title,
        description: description || null,
        isPublic: isPublic !== false,
        followers: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Add movies to list if provided
    if (movieIds && movieIds.length > 0) {
      await db.insert(listMovies).values(
        movieIds.map((movieId: number) => ({
          listId: newList[0].id,
          movieId,
          addedAt: new Date().toISOString(),
        }))
      );
    }

    return NextResponse.json({ list: newList[0] });
  } catch (error) {
    console.error('Create list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const listId = searchParams.get('listId');

    if (listId) {
      // Get specific list with movies
      const list = await db
        .select()
        .from(lists)
        .where(eq(lists.id, parseInt(listId)))
        .limit(1);

      if (list.length === 0) {
        return NextResponse.json(
          { error: 'List not found' },
          { status: 404 }
        );
      }

      const moviesInList = await db
        .select({
          movie: movies,
          addedAt: listMovies.addedAt,
        })
        .from(listMovies)
        .leftJoin(movies, eq(listMovies.movieId, movies.id))
        .where(eq(listMovies.listId, parseInt(listId)));

      return NextResponse.json({
        list: list[0],
        movies: moviesInList,
      });
    }

    // Get all public lists or user's lists
    let query = db
      .select({
        list: lists,
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(lists)
      .leftJoin(users, eq(lists.userId, users.id));

    if (userId) {
      query = query.where(eq(lists.userId, parseInt(userId)));
    } else {
      query = query.where(eq(lists.isPublic, true));
    }

    const results = await query.orderBy(sql`${lists.createdAt} DESC`);

    return NextResponse.json({ lists: results });
  } catch (error) {
    console.error('Get lists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
