import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges } from '@/db/schema';
import { desc, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Define rarity order for sorting
    const rarityOrder = sql`CASE ${badges.rarity}
      WHEN 'legendary' THEN 1
      WHEN 'epic' THEN 2
      WHEN 'rare' THEN 3
      WHEN 'common' THEN 4
      ELSE 5
    END`;

    // Fetch all badges ordered by rarity then by id
    const allBadges = await db.select()
      .from(badges)
      .orderBy(rarityOrder, asc(badges.id));

    return NextResponse.json({
      badges: allBadges
    }, { status: 200 });

  } catch (error) {
    console.error('GET badges error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}