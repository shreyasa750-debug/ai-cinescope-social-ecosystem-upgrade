import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges, userBadges } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch all badges with user progress using a left join
    const badgesWithProgress = await db
      .select({
        badgeId: badges.id,
        badgeName: badges.name,
        badgeDescription: badges.description,
        badgeIcon: badges.icon,
        badgeRarity: badges.rarity,
        badgeRequirements: badges.requirements,
        badgeRewardPoints: badges.rewardPoints,
        userProgress: userBadges.progress,
        userUnlocked: userBadges.unlocked,
        userUnlockedAt: userBadges.unlockedAt,
      })
      .from(badges)
      .leftJoin(
        userBadges,
        sql`${userBadges.badgeId} = ${badges.id} AND ${userBadges.userId} = ${user.id}`
      )
      .orderBy(
        sql`CASE 
          WHEN ${badges.rarity} = 'legendary' THEN 1
          WHEN ${badges.rarity} = 'epic' THEN 2
          WHEN ${badges.rarity} = 'rare' THEN 3
          WHEN ${badges.rarity} = 'common' THEN 4
          ELSE 5
        END`,
        badges.id
      );

    // Transform the results to match the required response format
    const formattedBadges = badgesWithProgress.map((row) => ({
      badge: {
        id: row.badgeId,
        name: row.badgeName,
        description: row.badgeDescription,
        icon: row.badgeIcon,
        rarity: row.badgeRarity,
        requirements: row.badgeRequirements,
        rewardPoints: row.badgeRewardPoints,
      },
      userProgress: {
        progress: row.userProgress ?? 0,
        unlocked: row.userUnlocked ?? false,
        unlockedAt: row.userUnlockedAt ?? null,
      },
    }));

    return NextResponse.json({
      badges: formattedBadges,
    });
  } catch (error) {
    console.error('GET /api/user/badges error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}