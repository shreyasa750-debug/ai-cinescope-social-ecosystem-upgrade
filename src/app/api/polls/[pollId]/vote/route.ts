import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollVotes } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  // Mock user for now - replace with actual token validation
  return { id: parseInt(token) || 1 };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pollId: string } }
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

    // Extract pollId from URL params
    const pollId = params.pollId;
    if (!pollId || isNaN(parseInt(pollId))) {
      return NextResponse.json(
        { error: 'Valid poll ID is required', code: 'INVALID_POLL_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { optionIndex } = body;

    // Validate optionIndex is provided
    if (optionIndex === undefined || optionIndex === null) {
      return NextResponse.json(
        { error: 'Option index is required', code: 'MISSING_OPTION_INDEX' },
        { status: 400 }
      );
    }

    // Validate optionIndex is a number
    if (typeof optionIndex !== 'number' || isNaN(optionIndex)) {
      return NextResponse.json(
        { error: 'Option index must be a valid number', code: 'INVALID_OPTION_INDEX' },
        { status: 400 }
      );
    }

    const pollIdInt = parseInt(pollId);
    const userId = user.id;

    // Fetch poll by id
    const poll = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollIdInt))
      .limit(1);

    if (poll.length === 0) {
      return NextResponse.json(
        { error: 'Poll not found', code: 'POLL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const pollData = poll[0];

    // Check if poll is expired
    const now = new Date().toISOString();
    if (pollData.expiresAt < now) {
      return NextResponse.json(
        { error: 'Poll has expired', code: 'POLL_EXPIRED' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(pollVotes)
      .where(
        and(
          eq(pollVotes.pollId, pollIdInt),
          eq(pollVotes.userId, userId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      return NextResponse.json(
        { error: 'Already voted on this poll', code: 'ALREADY_VOTED' },
        { status: 400 }
      );
    }

    // Validate optionIndex is within range
    const options = pollData.options as string[];
    if (optionIndex < 0 || optionIndex >= options.length) {
      return NextResponse.json(
        { 
          error: `Option index must be between 0 and ${options.length - 1}`, 
          code: 'OPTION_INDEX_OUT_OF_RANGE' 
        },
        { status: 400 }
      );
    }

    // Create poll vote
    const votedAt = new Date().toISOString();
    const newVote = await db
      .insert(pollVotes)
      .values({
        pollId: pollIdInt,
        userId: userId,
        optionIndex: optionIndex,
        votedAt: votedAt,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        vote: {
          id: newVote[0].id,
          pollId: newVote[0].pollId,
          userId: newVote[0].userId,
          optionIndex: newVote[0].optionIndex,
          votedAt: newVote[0].votedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/polls/[pollId]/vote error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}