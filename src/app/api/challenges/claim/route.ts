import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, userChallenges, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Simple token validation - in production, use proper JWT verification
    const userId = parseInt(token);
    if (isNaN(userId)) {
      return null;
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

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

    // Parse request body
    const body = await request.json();
    const { challengeId } = body;

    // Validate challengeId
    if (!challengeId || isNaN(parseInt(challengeId.toString()))) {
      return NextResponse.json(
        { error: 'Valid challenge ID is required', code: 'INVALID_CHALLENGE_ID' },
        { status: 400 }
      );
    }

    const parsedChallengeId = parseInt(challengeId.toString());

    // Fetch userChallenge record
    const userChallengeResult = await db.select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, user.id),
          eq(userChallenges.challengeId, parsedChallengeId)
        )
      )
      .limit(1);

    if (userChallengeResult.length === 0) {
      return NextResponse.json(
        { error: 'User challenge not found', code: 'CHALLENGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userChallenge = userChallengeResult[0];

    // Check if challenge is completed
    if (!userChallenge.completed) {
      return NextResponse.json(
        { error: 'Challenge not completed yet', code: 'CHALLENGE_NOT_COMPLETED' },
        { status: 400 }
      );
    }

    // Fetch challenge details
    const challengeResult = await db.select()
      .from(challenges)
      .where(eq(challenges.id, parsedChallengeId))
      .limit(1);

    if (challengeResult.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'CHALLENGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const challenge = challengeResult[0];

    // Process reward based on rewardType
    if (challenge.rewardType === 'points') {
      // Parse current stats
      const currentStats = typeof user.stats === 'string' 
        ? JSON.parse(user.stats) 
        : (user.stats || {});

      // Initialize points if not exists
      const currentPoints = currentStats.points || 0;
      const newPoints = currentPoints + challenge.rewardValue;

      // Update user stats
      const updatedStats = {
        ...currentStats,
        points: newPoints
      };

      await db.update(users)
        .set({
          stats: JSON.stringify(updatedStats)
        })
        .where(eq(users.id, user.id));

    } else if (challenge.rewardType === 'badge') {
      // Badge reward logic - acknowledge for now
      // In production, this would assign a badge to the user
      console.log(`Badge reward acknowledged for user ${user.id}, challenge ${parsedChallengeId}`);
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        reward: {
          type: challenge.rewardType,
          value: challenge.rewardValue
        },
        message: 'Reward claimed successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}