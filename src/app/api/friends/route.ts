import { NextResponse } from 'next/server';
import { db } from '@/db';
import { friends, friendRequests, users } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get friends
    const userFriends = await db
      .select({
        friend: users,
        friendshipCreatedAt: friends.createdAt,
      })
      .from(friends)
      .leftJoin(users, eq(friends.friendId, users.id))
      .where(eq(friends.userId, user.userId));

    // Get pending friend requests
    const pendingRequests = await db
      .select({
        request: friendRequests,
        fromUser: users,
      })
      .from(friendRequests)
      .leftJoin(users, eq(friendRequests.fromUserId, users.id))
      .where(
        and(
          eq(friendRequests.toUserId, user.userId),
          eq(friendRequests.status, 'pending')
        )
      );

    return NextResponse.json({
      friends: userFriends,
      pendingRequests,
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      );
    }

    // Create friend request
    const newRequest = await db
      .insert(friendRequests)
      .values({
        fromUserId: user.userId,
        toUserId: friendId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ request: newRequest[0] });
  } catch (error) {
    console.error('Send friend request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
