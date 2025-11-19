import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, userChallenges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    // This is a placeholder - implement actual token validation
    // For now, we'll extract user ID from token (in production, validate JWT)
    const userId = parseInt(token);
    
    if (isNaN(userId)) {
      return null;
    }

    return { id: userId };
  } catch (error) {
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

    // Parse and validate request body
    const body = await request.json();
    const { challengeId, progressIncrement } = body;

    // Validate required fields
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required', code: 'MISSING_CHALLENGE_ID' },
        { status: 400 }
      );
    }

    if (progressIncrement === undefined || progressIncrement === null) {
      return NextResponse.json(
        { error: 'Progress increment is required', code: 'MISSING_PROGRESS_INCREMENT' },
        { status: 400 }
      );
    }

    if (typeof progressIncrement !== 'number' || progressIncrement < 0) {
      return NextResponse.json(
        { error: 'Progress increment must be a positive number', code: 'INVALID_PROGRESS_INCREMENT' },
        { status: 400 }
      );
    }

    // Fetch challenge from database
    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, parseInt(challengeId)))
      .limit(1);

    if (challenge.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'CHALLENGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const challengeData = challenge[0];

    // Find existing userChallenge record
    const existingUserChallenge = await db
      .select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, user.id),
          eq(userChallenges.challengeId, parseInt(challengeId))
        )
      )
      .limit(1);

    let updatedUserChallenge;
    const now = new Date().toISOString();

    if (existingUserChallenge.length > 0) {
      // Update existing record
      const current = existingUserChallenge[0];
      const newProgress = current.progress + progressIncrement;
      const shouldComplete = newProgress >= challengeData.target && !current.completed;

      updatedUserChallenge = await db
        .update(userChallenges)
        .set({
          progress: newProgress,
          completed: shouldComplete ? true : current.completed,
          completedAt: shouldComplete ? now : current.completedAt,
        })
        .where(eq(userChallenges.id, current.id))
        .returning();
    } else {
      // Create new record
      const shouldComplete = progressIncrement >= challengeData.target;

      updatedUserChallenge = await db
        .insert(userChallenges)
        .values({
          userId: user.id,
          challengeId: parseInt(challengeId),
          progress: progressIncrement,
          completed: shouldComplete,
          completedAt: shouldComplete ? now : null,
          createdAt: now,
        })
        .returning();
    }

    // Return response with userChallenge and challenge data
    return NextResponse.json({
      userChallenge: {
        id: updatedUserChallenge[0].id,
        challengeId: updatedUserChallenge[0].challengeId,
        progress: updatedUserChallenge[0].progress,
        completed: updatedUserChallenge[0].completed,
        completedAt: updatedUserChallenge[0].completedAt,
      },
      challenge: {
        id: challengeData.id,
        title: challengeData.title,
        target: challengeData.target,
        rewardType: challengeData.rewardType,
        rewardValue: challengeData.rewardValue,
      },
    });
  } catch (error) {
    console.error('POST /api/challenges/progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}