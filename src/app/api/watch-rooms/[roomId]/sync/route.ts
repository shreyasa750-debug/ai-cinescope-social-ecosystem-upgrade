import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchRooms, watchRoomState } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Extract roomId from URL params
    const roomId = params.roomId;
    if (!roomId || isNaN(parseInt(roomId))) {
      return NextResponse.json(
        { error: 'Valid room ID is required', code: 'INVALID_ROOM_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentTime, isPlaying } = body;

    // Validate at least one field is provided
    if (currentTime === undefined && isPlaying === undefined) {
      return NextResponse.json(
        { error: 'At least one of currentTime or isPlaying must be provided', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Validate currentTime if provided
    if (currentTime !== undefined && (typeof currentTime !== 'number' || currentTime < 0)) {
      return NextResponse.json(
        { error: 'currentTime must be a non-negative number', code: 'INVALID_CURRENT_TIME' },
        { status: 400 }
      );
    }

    // Validate isPlaying if provided
    if (isPlaying !== undefined && typeof isPlaying !== 'boolean') {
      return NextResponse.json(
        { error: 'isPlaying must be a boolean', code: 'INVALID_IS_PLAYING' },
        { status: 400 }
      );
    }

    // Fetch watch room
    const room = await db.select()
      .from(watchRooms)
      .where(eq(watchRooms.id, parseInt(roomId)))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json(
        { error: 'Watch room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify user is the host
    if (room[0].hostId !== user.id) {
      return NextResponse.json(
        { error: 'Only host can sync playback', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Check if state exists for this room
    const existingState = await db.select()
      .from(watchRoomState)
      .where(eq(watchRoomState.roomId, parseInt(roomId)))
      .limit(1);

    let playbackState;

    if (existingState.length === 0) {
      // Create new state
      const newState = await db.insert(watchRoomState)
        .values({
          roomId: parseInt(roomId),
          currentTime: currentTime ?? 0,
          isPlaying: isPlaying ?? false,
          updatedAt: now,
        })
        .returning();

      playbackState = newState[0];
    } else {
      // Update existing state
      const updateData: any = {
        updatedAt: now,
      };

      if (currentTime !== undefined) {
        updateData.currentTime = currentTime;
      }

      if (isPlaying !== undefined) {
        updateData.isPlaying = isPlaying;
      }

      const updated = await db.update(watchRoomState)
        .set(updateData)
        .where(eq(watchRoomState.roomId, parseInt(roomId)))
        .returning();

      playbackState = updated[0];
    }

    // Update room status if isPlaying is true
    if (isPlaying === true) {
      await db.update(watchRooms)
        .set({ status: 'playing' })
        .where(eq(watchRooms.id, parseInt(roomId)));
    }

    return NextResponse.json({
      success: true,
      playbackState: {
        roomId: playbackState.roomId,
        currentTime: playbackState.currentTime,
        isPlaying: playbackState.isPlaying,
        updatedAt: playbackState.updatedAt,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/watch-rooms/[roomId]/sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}