import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { profileId: string } }
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

    // Extract and validate profileId
    const profileId = params.profileId;
    if (!profileId || isNaN(parseInt(profileId))) {
      return NextResponse.json(
        { 
          error: 'Valid profile ID is required',
          code: 'INVALID_PROFILE_ID' 
        },
        { status: 400 }
      );
    }

    const parsedProfileId = parseInt(profileId);

    // Fetch the profile by ID
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.id, parsedProfileId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { 
          error: 'Profile not found',
          code: 'PROFILE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Verify profile belongs to authenticated user
    if (profile[0].userId !== user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied: Profile does not belong to authenticated user',
          code: 'FORBIDDEN' 
        },
        { status: 403 }
      );
    }

    // Update all user's profiles to set isPrimary = false
    await db.update(userProfiles)
      .set({ isPrimary: false })
      .where(eq(userProfiles.userId, user.id));

    // Update the selected profile to set isPrimary = true
    const updatedProfile = await db.update(userProfiles)
      .set({ isPrimary: true })
      .where(
        and(
          eq(userProfiles.id, parsedProfileId),
          eq(userProfiles.userId, user.id)
        )
      )
      .returning();

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update profile',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        activeProfile: {
          id: updatedProfile[0].id,
          userId: updatedProfile[0].userId,
          name: updatedProfile[0].name,
          avatar: updatedProfile[0].avatar,
          ageRating: updatedProfile[0].ageRating,
          isPrimary: updatedProfile[0].isPrimary,
          createdAt: updatedProfile[0].createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/user/profiles/[profileId]/switch error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}