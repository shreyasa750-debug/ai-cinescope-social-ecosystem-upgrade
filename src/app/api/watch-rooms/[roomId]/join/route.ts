import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchRooms, watchRoomParticipants } from '@/db/schema';
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract and validate roomId
    const roomId = params.roomId;
    if (!roomId || isNaN(parseInt(roomId))) {
      return NextResponse.json(
        { error: 'Valid room ID is required', code: 'INVALID_ROOM_ID' },
        { status: 400 }
      );
    }

    const roomIdInt = parseInt(roomId);

    // Fetch watch room
    const room = await db
      .select()
      .from(watchRooms)
      .where(eq(watchRooms.id, roomIdInt))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json(
        { error: 'Watch room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if room has ended
    if (room[0].status === 'ended') {
      return NextResponse.json(
        { error: 'Room has ended', code: 'ROOM_ENDED' },
        { status: 400 }
      );
    }

    // Check if user is already a participant
    const existingParticipant = await db
      .select()
      .from(watchRoomParticipants)
      .where(
        and(
          eq(watchRoomParticipants.roomId, roomIdInt),
          eq(watchRoomParticipants.userId, user.id)
        )
      )
      .limit(1);

    if (existingParticipant.length > 0) {
      return NextResponse.json(
        { error: 'Already in this room', code: 'ALREADY_JOINED' },
        { status: 400 }
      );
    }

    // Create participant record
    const newParticipant = await db
      .insert(watchRoomParticipants)
      .values({
        roomId: roomIdInt,
        userId: user.id,
        joinedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        participant: {
          id: newParticipant[0].id,
          roomId: newParticipant[0].roomId,
          userId: newParticipant[0].userId,
          joinedAt: newParticipant[0].joinedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/watch-rooms/[roomId]/join error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}