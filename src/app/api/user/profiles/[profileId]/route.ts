import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Extract and validate profileId
    const profileId = params.profileId;
    if (!profileId || isNaN(parseInt(profileId))) {
      return NextResponse.json(
        { error: 'Valid profile ID is required', code: 'INVALID_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, avatar, ageRating } = body;

    // Fetch profile by id
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, parseInt(profileId)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify profile belongs to authenticated user
    if (existingProfile[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this profile', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (ageRating !== undefined) updates.ageRating = ageRating;

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_FIELDS_PROVIDED' },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await db
      .update(userProfiles)
      .set(updates)
      .where(
        and(
          eq(userProfiles.id, parseInt(profileId)),
          eq(userProfiles.userId, user.id)
        )
      )
      .returning();

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: updatedProfile[0]
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Extract and validate profileId
    const profileId = params.profileId;
    if (!profileId || isNaN(parseInt(profileId))) {
      return NextResponse.json(
        { error: 'Valid profile ID is required', code: 'INVALID_PROFILE_ID' },
        { status: 400 }
      );
    }

    // Fetch profile by id
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, parseInt(profileId)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify profile belongs to authenticated user
    if (existingProfile[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this profile', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Check if profile is primary
    if (existingProfile[0].isPrimary) {
      return NextResponse.json(
        { error: 'Cannot delete primary profile', code: 'PRIMARY_PROFILE_DELETE' },
        { status: 400 }
      );
    }

    // Delete profile
    await db
      .delete(userProfiles)
      .where(
        and(
          eq(userProfiles.id, parseInt(profileId)),
          eq(userProfiles.userId, user.id)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}