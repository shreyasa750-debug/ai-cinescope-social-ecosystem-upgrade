import { db } from '@/db';
import { watchlist } from '@/db/schema';

async function main() {
    const sampleWatchlist = [
        // Alice's watchlist
        {
            userId: 1,
            movieId: 2,
            addedAt: new Date('2024-12-05').toISOString(),
        },
        {
            userId: 1,
            movieId: 7,
            addedAt: new Date('2024-12-08').toISOString(),
        },
        {
            userId: 1,
            movieId: 11,
            addedAt: new Date('2024-12-15').toISOString(),
        },
        {
            userId: 1,
            movieId: 18,
            addedAt: new Date('2024-12-22').toISOString(),
        },
        // Bob's watchlist
        {
            userId: 2,
            movieId: 6,
            addedAt: new Date('2024-12-03').toISOString(),
        },
        {
            userId: 2,
            movieId: 13,
            addedAt: new Date('2024-12-10').toISOString(),
        },
        {
            userId: 2,
            movieId: 16,
            addedAt: new Date('2024-12-18').toISOString(),
        },
        {
            userId: 2,
            movieId: 19,
            addedAt: new Date('2024-12-25').toISOString(),
        },
        // Charlie's watchlist
        {
            userId: 3,
            movieId: 4,
            addedAt: new Date('2024-12-02').toISOString(),
        },
        {
            userId: 3,
            movieId: 5,
            addedAt: new Date('2024-12-07').toISOString(),
        },
        {
            userId: 3,
            movieId: 9,
            addedAt: new Date('2024-12-12').toISOString(),
        },
        {
            userId: 3,
            movieId: 10,
            addedAt: new Date('2024-12-19').toISOString(),
        },
        {
            userId: 3,
            movieId: 14,
            addedAt: new Date('2024-12-24').toISOString(),
        },
        // Diana's watchlist
        {
            userId: 4,
            movieId: 1,
            addedAt: new Date('2024-12-01').toISOString(),
        },
        {
            userId: 4,
            movieId: 3,
            addedAt: new Date('2024-12-06').toISOString(),
        },
        {
            userId: 4,
            movieId: 6,
            addedAt: new Date('2024-12-14').toISOString(),
        },
        {
            userId: 4,
            movieId: 12,
            addedAt: new Date('2024-12-20').toISOString(),
        },
        // Eve's watchlist
        {
            userId: 5,
            movieId: 2,
            addedAt: new Date('2024-12-04').toISOString(),
        },
        {
            userId: 5,
            movieId: 7,
            addedAt: new Date('2024-12-09').toISOString(),
        },
        {
            userId: 5,
            movieId: 10,
            addedAt: new Date('2024-12-13').toISOString(),
        },
        {
            userId: 5,
            movieId: 13,
            addedAt: new Date('2024-12-17').toISOString(),
        },
        {
            userId: 5,
            movieId: 17,
            addedAt: new Date('2024-12-23').toISOString(),
        },
    ];

    await db.insert(watchlist).values(sampleWatchlist);
    
    console.log('✅ Watchlist seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});