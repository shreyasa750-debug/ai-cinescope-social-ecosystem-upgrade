import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollVotes } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    // Mock user extraction - implement actual JWT verification
    const mockUserId = parseInt(token);
    if (isNaN(mockUserId)) {
      return null;
    }
    
    return { id: mockUserId };
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const clubId = params.clubId;

    if (!clubId || isNaN(parseInt(clubId))) {
      return NextResponse.json(
        { error: 'Valid club ID is required', code: 'INVALID_CLUB_ID' },
        { status: 400 }
      );
    }

    const clubIdInt = parseInt(clubId);

    // Fetch all polls for the club ordered by createdAt DESC
    const clubPolls = await db
      .select()
      .from(polls)
      .where(eq(polls.clubId, clubIdInt))
      .orderBy(desc(polls.createdAt));

    // For each poll, count votes grouped by optionIndex
    const pollsWithVotes = await Promise.all(
      clubPolls.map(async (poll) => {
        // Get vote counts for this poll
        const voteCounts = await db
          .select({
            optionIndex: pollVotes.optionIndex,
            count: sql<number>`count(*)`,
          })
          .from(pollVotes)
          .where(eq(pollVotes.pollId, poll.id))
          .groupBy(pollVotes.optionIndex);

        // Calculate total votes
        const totalVotes = voteCounts.reduce(
          (sum, vc) => sum + Number(vc.count),
          0
        );

        // Check if poll is expired
        const expiresAt = new Date(poll.expiresAt);
        const now = new Date();
        const isExpired = expiresAt < now;

        return {
          poll: {
            id: poll.id,
            clubId: poll.clubId,
            creatorId: poll.creatorId,
            question: poll.question,
            options: poll.options,
            expiresAt: poll.expiresAt,
            createdAt: poll.createdAt,
          },
          totalVotes,
          isExpired,
        };
      })
    );

    return NextResponse.json({ polls: pollsWithVotes }, { status: 200 });
  } catch (error) {
    console.error('GET /api/clubs/[clubId]/polls error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clubId: string } }
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

    const clubId = params.clubId;

    if (!clubId || isNaN(parseInt(clubId))) {
      return NextResponse.json(
        { error: 'Valid club ID is required', code: 'INVALID_CLUB_ID' },
        { status: 400 }
      );
    }

    const clubIdInt = parseInt(clubId);

    // Parse request body
    const body = await request.json();
    const { question, options, expiresAt } = body;

    // Validate question
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid question is required', code: 'INVALID_QUESTION' },
        { status: 400 }
      );
    }

    // Validate options array
    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        {
          error: 'At least 2 options are required',
          code: 'INVALID_OPTIONS',
        },
        { status: 400 }
      );
    }

    // Validate all options are non-empty strings
    const validOptions = options.every(
      (opt) => typeof opt === 'string' && opt.trim().length > 0
    );
    if (!validOptions) {
      return NextResponse.json(
        {
          error: 'All options must be non-empty strings',
          code: 'INVALID_OPTIONS',
        },
        { status: 400 }
      );
    }

    // Validate expiresAt
    if (!expiresAt || typeof expiresAt !== 'string') {
      return NextResponse.json(
        { error: 'Valid expiration date is required', code: 'INVALID_EXPIRES_AT' },
        { status: 400 }
      );
    }

    const expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid expiration date format', code: 'INVALID_EXPIRES_AT' },
        { status: 400 }
      );
    }

    // Create new poll
    const createdAt = new Date().toISOString();
    const newPoll = await db
      .insert(polls)
      .values({
        clubId: clubIdInt,
        creatorId: user.id,
        question: question.trim(),
        options: options.map((opt: string) => opt.trim()),
        expiresAt: expiresAt,
        createdAt: createdAt,
      })
      .returning();

    if (newPoll.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create poll', code: 'CREATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        poll: {
          id: newPoll[0].id,
          clubId: newPoll[0].clubId,
          creatorId: newPoll[0].creatorId,
          question: newPoll[0].question,
          options: newPoll[0].options,
          expiresAt: newPoll[0].expiresAt,
          createdAt: newPoll[0].createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/clubs/[clubId]/polls error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}