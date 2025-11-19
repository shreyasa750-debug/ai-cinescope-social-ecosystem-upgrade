import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const profiles = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .orderBy(desc(userProfiles.isPrimary), asc(userProfiles.createdAt));

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar, ageRating } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    const existingProfiles = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

    const isFirstProfile = existingProfiles.length === 0;

    const newProfile = await db.insert(userProfiles)
      .values({
        userId: user.id,
        name: name.trim(),
        avatar: avatar || null,
        ageRating: ageRating || 'PG-13',
        isPrimary: isFirstProfile,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ 
      profile: newProfile[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}