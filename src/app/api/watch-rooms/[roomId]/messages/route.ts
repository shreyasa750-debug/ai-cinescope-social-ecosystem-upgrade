import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchRoomMessages, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    
    // Validate roomId
    if (!roomId || isNaN(parseInt(roomId))) {
      return NextResponse.json(
        { error: 'Valid room ID is required', code: 'INVALID_ROOM_ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Fetch messages with user details
    const messagesWithUsers = await db
      .select({
        message: {
          id: watchRoomMessages.id,
          roomId: watchRoomMessages.roomId,
          userId: watchRoomMessages.userId,
          message: watchRoomMessages.message,
          timestamp: watchRoomMessages.timestamp,
        },
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(watchRoomMessages)
      .innerJoin(users, eq(watchRoomMessages.userId, users.id))
      .where(eq(watchRoomMessages.roomId, parseInt(roomId)))
      .orderBy(desc(watchRoomMessages.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ messages: messagesWithUsers }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

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

    const { roomId } = params;
    
    // Validate roomId
    if (!roomId || isNaN(parseInt(roomId))) {
      return NextResponse.json(
        { error: 'Valid room ID is required', code: 'INVALID_ROOM_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }

    // Create message record
    const newMessage = await db
      .insert(watchRoomMessages)
      .values({
        roomId: parseInt(roomId),
        userId: user.id,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      })
      .returning();

    if (newMessage.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create message', code: 'CREATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: {
          id: newMessage[0].id,
          roomId: newMessage[0].roomId,
          userId: newMessage[0].userId,
          message: newMessage[0].message,
          timestamp: newMessage[0].timestamp,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}