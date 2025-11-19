import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword, generateToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user[0].password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last active
    await db
      .update(users)
      .set({ lastActive: new Date().toISOString() })
      .where(eq(users.id, user[0].id));

    // Generate token
    const token = generateToken({
      userId: user[0].id,
      username: user[0].username,
      email: user[0].email,
    });

    return NextResponse.json({
      token,
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        profileImage: user[0].profileImage,
        bio: user[0].bio,
        persona: user[0].persona,
        preferences: user[0].preferences,
        stats: user[0].stats,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
