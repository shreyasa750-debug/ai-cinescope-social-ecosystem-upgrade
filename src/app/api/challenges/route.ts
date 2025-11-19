import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, userChallenges } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const currentDate = new Date().toISOString();

    // Fetch active challenges with user progress using left join
    const activeChallenges = await db
      .select({
        challengeId: challenges.id,
        title: challenges.title,
        description: challenges.description,
        type: challenges.type,
        target: challenges.target,
        rewardType: challenges.rewardType,
        rewardValue: challenges.rewardValue,
        startDate: challenges.startDate,
        endDate: challenges.endDate,
        userChallengeId: userChallenges.id,
        progress: userChallenges.progress,
        completed: userChallenges.completed,
        completedAt: userChallenges.completedAt,
      })
      .from(challenges)
      .leftJoin(
        userChallenges,
        and(
          eq(userChallenges.challengeId, challenges.id),
          eq(userChallenges.userId, user.id)
        )
      )
      .where(
        and(
          eq(challenges.active, true),
          lte(challenges.startDate, currentDate),
          gte(challenges.endDate, currentDate)
        )
      )
      .orderBy(
        sql`CASE 
          WHEN ${challenges.type} = 'daily' THEN 1 
          WHEN ${challenges.type} = 'weekly' THEN 2 
          WHEN ${challenges.type} = 'special' THEN 3 
          ELSE 4 
        END`,
        challenges.startDate
      );

    // Transform the results into the required format
    const formattedChallenges = activeChallenges.map((row) => {
      const progress = row.progress ?? 0;
      const completed = row.completed ?? false;
      const completedAt = row.completedAt ?? null;
      const percentage = row.target > 0 ? Math.round((progress / row.target) * 100) : 0;

      return {
        challenge: {
          id: row.challengeId,
          title: row.title,
          description: row.description,
          type: row.type,
          target: row.target,
          rewardType: row.rewardType,
          rewardValue: row.rewardValue,
          startDate: row.startDate,
          endDate: row.endDate,
        },
        userProgress: {
          progress,
          completed,
          completedAt,
          percentage,
        },
      };
    });

    return NextResponse.json(
      { challenges: formattedChallenges },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET challenges error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}