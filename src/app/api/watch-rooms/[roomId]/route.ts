import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchRooms, movies, users, watchRoomParticipants, watchRoomState } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;

    // Validate roomId is provided
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required', code: 'MISSING_ROOM_ID' },
        { status: 400 }
      );
    }

    // Validate roomId is a valid integer
    const parsedRoomId = parseInt(roomId);
    if (isNaN(parsedRoomId)) {
      return NextResponse.json(
        { error: 'Valid Room ID is required', code: 'INVALID_ROOM_ID' },
        { status: 400 }
      );
    }

    // Fetch watch room
    const roomResult = await db
      .select()
      .from(watchRooms)
      .where(eq(watchRooms.id, parsedRoomId))
      .limit(1);

    if (roomResult.length === 0) {
      return NextResponse.json(
        { error: 'Watch room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const room = roomResult[0];

    // Fetch movie details
    const movieResult = await db
      .select()
      .from(movies)
      .where(eq(movies.id, room.movieId))
      .limit(1);

    const movie = movieResult.length > 0 ? movieResult[0] : null;

    // Fetch host details
    const hostResult = await db
      .select({
        id: users.id,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(eq(users.id, room.hostId))
      .limit(1);

    const host = hostResult.length > 0 ? hostResult[0] : null;

    // Fetch participants with user details
    const participantsResult = await db
      .select({
        userId: watchRoomParticipants.userId,
        joinedAt: watchRoomParticipants.joinedAt,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(watchRoomParticipants)
      .leftJoin(users, eq(watchRoomParticipants.userId, users.id))
      .where(eq(watchRoomParticipants.roomId, parsedRoomId));

    const participants = participantsResult.map((p) => ({
      user: {
        id: p.userId,
        username: p.username,
        profileImage: p.profileImage,
      },
      joinedAt: p.joinedAt,
    }));

    // Fetch playback state
    const playbackStateResult = await db
      .select({
        currentTime: watchRoomState.currentTime,
        isPlaying: watchRoomState.isPlaying,
        updatedAt: watchRoomState.updatedAt,
      })
      .from(watchRoomState)
      .where(eq(watchRoomState.roomId, parsedRoomId))
      .limit(1);

    const playbackState = playbackStateResult.length > 0 ? playbackStateResult[0] : null;

    // Return comprehensive room data
    return NextResponse.json({
      room: {
        id: room.id,
        hostId: room.hostId,
        movieId: room.movieId,
        status: room.status,
        scheduledFor: room.scheduledFor,
        createdAt: room.createdAt,
      },
      movie: movie ? {
        id: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        runtime: movie.runtime,
      } : null,
      host: host,
      participants: participants,
      playbackState: playbackState,
    });
  } catch (error) {
    console.error('GET watch room error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}