import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchRooms, watchRoomParticipants, watchRoomState } from '@/db/schema';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { movieId, scheduledFor } = body;

    // Validate required fields
    if (!movieId) {
      return NextResponse.json(
        { error: 'movieId is required', code: 'MISSING_MOVIE_ID' },
        { status: 400 }
      );
    }

    // Validate movieId is a number
    if (typeof movieId !== 'number' || isNaN(movieId)) {
      return NextResponse.json(
        { error: 'movieId must be a valid number', code: 'INVALID_MOVIE_ID' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Create watch room
    const newRoom = await db.insert(watchRooms)
      .values({
        hostId: user.id,
        movieId,
        status: 'waiting',
        scheduledFor: scheduledFor || null,
        createdAt: now,
      })
      .returning();

    if (!newRoom || newRoom.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create watch room', code: 'ROOM_CREATION_FAILED' },
        { status: 500 }
      );
    }

    const room = newRoom[0];

    // Add host as participant
    await db.insert(watchRoomParticipants)
      .values({
        roomId: room.id,
        userId: user.id,
        joinedAt: now,
      });

    // Create initial watch room state
    await db.insert(watchRoomState)
      .values({
        roomId: room.id,
        currentTime: 0,
        isPlaying: false,
        updatedAt: now,
      });

    // Return created room
    return NextResponse.json(
      {
        room: {
          id: room.id,
          hostId: room.hostId,
          movieId: room.movieId,
          status: room.status,
          scheduledFor: room.scheduledFor,
          createdAt: room.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/watch-rooms error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}