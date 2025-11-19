import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, generateToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        preferences: JSON.stringify({ genres: [], moods: [], watchHabits: {} }),
        persona: 'casual',
        stats: JSON.stringify({ moviesWatched: 0, reviewsWritten: 0, listsCreated: 0 }),
        parentalControls: JSON.stringify({ enabled: false }),
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      })
      .returning();

    // Generate token
    const token = generateToken({
      userId: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
    });

    return NextResponse.json({
      token,
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        profileImage: newUser[0].profileImage,
        bio: newUser[0].bio,
        persona: newUser[0].persona,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
