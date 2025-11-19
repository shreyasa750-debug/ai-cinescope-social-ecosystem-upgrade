import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clubs, clubMembers, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    if (clubId) {
      // Get specific club with members
      const club = await db
        .select()
        .from(clubs)
        .where(eq(clubs.id, parseInt(clubId)))
        .limit(1);

      if (club.length === 0) {
        return NextResponse.json(
          { error: 'Club not found' },
          { status: 404 }
        );
      }

      const members = await db
        .select({
          user: users,
          isModerator: clubMembers.isModerator,
          joinedAt: clubMembers.joinedAt,
        })
        .from(clubMembers)
        .leftJoin(users, eq(clubMembers.userId, users.id))
        .where(eq(clubMembers.clubId, parseInt(clubId)));

      return NextResponse.json({
        club: club[0],
        members,
      });
    }

    // Get all public clubs
    const allClubs = await db
      .select({
        club: clubs,
        creator: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(clubs)
      .leftJoin(users, eq(clubs.creatorId, users.id))
      .where(eq(clubs.isPublic, true))
      .orderBy(sql`${clubs.createdAt} DESC`);

    return NextResponse.json({ clubs: allClubs });
  } catch (error) {
    console.error('Get clubs error:', error);
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

    const { name, description, isPublic } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newClub = await db
      .insert(clubs)
      .values({
        name,
        description: description || null,
        creatorId: user.userId,
        isPublic: isPublic !== false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Add creator as moderator
    await db.insert(clubMembers).values({
      clubId: newClub[0].id,
      userId: user.userId,
      isModerator: true,
      joinedAt: new Date().toISOString(),
    });

    return NextResponse.json({ club: newClub[0] });
  } catch (error) {
    console.error('Create club error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
