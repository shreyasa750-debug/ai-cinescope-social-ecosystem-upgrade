import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges, userBadges, watchHistory, reviews, movies } from '@/db/schema';
import { eq, and, sql, gte, count } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch all badges
    const allBadges = await db.select().from(badges);

    const unlockedBadges: any[] = [];
    const updatedProgress: any[] = [];

    // Process each badge
    for (const badge of allBadges) {
      const requirements = badge.requirements as { type: string; value: number };
      let currentCount = 0;

      // Check badge requirements based on type
      switch (requirements.type) {
        case 'movies_watched': {
          const result = await db
            .select({ count: count() })
            .from(watchHistory)
            .where(eq(watchHistory.userId, user.id));
          currentCount = result[0]?.count || 0;
          break;
        }

        case 'reviews_written': {
          const result = await db
            .select({ count: count() })
            .from(reviews)
            .where(eq(reviews.userId, user.id));
          currentCount = result[0]?.count || 0;
          break;
        }

        case 'high_ratings': {
          // Count from watchHistory
          const watchHistoryHighRatings = await db
            .select({ count: count() })
            .from(watchHistory)
            .where(and(eq(watchHistory.userId, user.id), gte(watchHistory.rating, 5)));

          // Count from reviews
          const reviewHighRatings = await db
            .select({ count: count() })
            .from(reviews)
            .where(and(eq(reviews.userId, user.id), gte(reviews.rating, 5)));

          currentCount =
            (watchHistoryHighRatings[0]?.count || 0) + (reviewHighRatings[0]?.count || 0);
          break;
        }

        case 'genre_explorer': {
          // Get all watched movies with their genres
          const watchedMovies = await db
            .select({ genres: movies.genres })
            .from(watchHistory)
            .innerJoin(movies, eq(watchHistory.movieId, movies.id))
            .where(eq(watchHistory.userId, user.id));

          // Extract unique genres
          const uniqueGenres = new Set<string>();
          for (const movie of watchedMovies) {
            if (movie.genres && Array.isArray(movie.genres)) {
              movie.genres.forEach((genre: string) => uniqueGenres.add(genre));
            }
          }
          currentCount = uniqueGenres.size;
          break;
        }

        default:
          continue;
      }

      // Calculate progress (cap at 100)
      const progress = Math.min(
        Math.floor((currentCount / requirements.value) * 100),
        100
      );

      // Check if badge should be unlocked
      const shouldUnlock = currentCount >= requirements.value;

      // Check if user already has this badge record
      const existingUserBadge = await db
        .select()
        .from(userBadges)
        .where(and(eq(userBadges.userId, user.id), eq(userBadges.badgeId, badge.id)))
        .limit(1);

      if (existingUserBadge.length > 0) {
        // Update existing record
        const currentBadge = existingUserBadge[0];
        const wasUnlocked = currentBadge.unlocked;

        if (shouldUnlock && !wasUnlocked) {
          // Newly unlocked
          await db
            .update(userBadges)
            .set({
              progress,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            })
            .where(eq(userBadges.id, currentBadge.id));

          unlockedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            rarity: badge.rarity,
            rewardPoints: badge.rewardPoints,
          });

          updatedProgress.push({
            badgeId: badge.id,
            progress,
            unlocked: true,
          });
        } else if (progress !== currentBadge.progress) {
          // Just update progress
          await db
            .update(userBadges)
            .set({
              progress,
            })
            .where(eq(userBadges.id, currentBadge.id));

          updatedProgress.push({
            badgeId: badge.id,
            progress,
            unlocked: currentBadge.unlocked,
          });
        }
      } else {
        // Create new user badge record
        const newUserBadge = await db
          .insert(userBadges)
          .values({
            userId: user.id,
            badgeId: badge.id,
            progress,
            unlocked: shouldUnlock,
            unlockedAt: shouldUnlock ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
          })
          .returning();

        if (shouldUnlock) {
          unlockedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            rarity: badge.rarity,
            rewardPoints: badge.rewardPoints,
          });
        }

        updatedProgress.push({
          badgeId: badge.id,
          progress,
          unlocked: shouldUnlock,
        });
      }
    }

    return NextResponse.json({
      unlockedBadges,
      updatedProgress,
    });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}