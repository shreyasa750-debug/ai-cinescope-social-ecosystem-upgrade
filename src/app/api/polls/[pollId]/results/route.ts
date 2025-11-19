import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    const { pollId } = params;

    // Validate pollId is provided
    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required', code: 'MISSING_POLL_ID' },
        { status: 400 }
      );
    }

    // Validate pollId is a valid integer
    const parsedPollId = parseInt(pollId);
    if (isNaN(parsedPollId)) {
      return NextResponse.json(
        { error: 'Valid poll ID is required', code: 'INVALID_POLL_ID' },
        { status: 400 }
      );
    }

    // Fetch poll by id
    const pollResults = await db
      .select()
      .from(polls)
      .where(eq(polls.id, parsedPollId))
      .limit(1);

    if (pollResults.length === 0) {
      return NextResponse.json(
        { error: 'Poll not found', code: 'POLL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const poll = pollResults[0];

    // Fetch all votes for this poll
    const votes = await db
      .select()
      .from(pollVotes)
      .where(eq(pollVotes.pollId, parsedPollId));

    // Count votes grouped by optionIndex
    const voteCounts: { [key: number]: number } = {};
    votes.forEach((vote) => {
      voteCounts[vote.optionIndex] = (voteCounts[vote.optionIndex] || 0) + 1;
    });

    const totalVotes = votes.length;

    // Parse options from JSON
    const options = poll.options as string[];

    // Build results array with percentages
    const results = options.map((optionText, index) => {
      const voteCount = voteCounts[index] || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

      return {
        optionIndex: index,
        optionText,
        votes: voteCount,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      };
    });

    // Check if poll is expired
    const isExpired = new Date(poll.expiresAt) < new Date();

    // Return formatted response
    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        isExpired,
      },
      totalVotes,
      results,
    });
  } catch (error) {
    console.error('GET /api/polls/[pollId]/results error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}