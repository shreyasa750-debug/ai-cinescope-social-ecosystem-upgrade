import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchRoomParticipants } from '@/db/schema';
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

    // Find the participant record for this user and room
    const participant = await db
      .select()
      .from(watchRoomParticipants)
      .where(
        and(
          eq(watchRoomParticipants.roomId, roomIdInt),
          eq(watchRoomParticipants.userId, user.id)
        )
      )
      .limit(1);

    // Check if user is in the room
    if (participant.length === 0) {
      return NextResponse.json(
        { error: 'Not in this room', code: 'NOT_IN_ROOM' },
        { status: 404 }
      );
    }

    // Delete the participant record
    await db
      .delete(watchRoomParticipants)
      .where(
        and(
          eq(watchRoomParticipants.roomId, roomIdInt),
          eq(watchRoomParticipants.userId, user.id)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}