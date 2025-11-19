import { db } from '@/db';
import { watchHistory } from '@/db/schema';

async function main() {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const getWatchDate = (index: number, totalWatches: number) => {
        const timeSpan = now.getTime() - threeMonthsAgo.getTime();
        const increment = timeSpan / totalWatches;
        return new Date(threeMonthsAgo.getTime() + (index * increment)).toISOString();
    };

    const aliceWatches = [
        { movieId: 1, rating: 5 },
        { movieId: 3, rating: 4 },
        { movieId: 5, rating: 5 },
        { movieId: 9, rating: 5 },
        { movieId: 10, rating: 4 },
        { movieId: 15, rating: 4 },
        { movieId: 16, rating: 5 }
    ];

    const bobWatches = [
        { movieId: 1, rating: 5 },
        { movieId: 4, rating: 5 },
        { movieId: 8, rating: 5 },
        { movieId: 9, rating: 5 },
        { movieId: 11, rating: 4 },
        { movieId: 14, rating: 4 },
        { movieId: 15, rating: 5 },
        { movieId: 18, rating: 4 }
    ];

    const charlieWatches = [
        { movieId: 2, rating: 5 },
        { movieId: 3, rating: 5 },
        { movieId: 6, rating: 4 },
        { movieId: 7, rating: 5 },
        { movieId: 13, rating: 5 },
        { movieId: 16, rating: 4 },
        { movieId: 17, rating: 4 },
        { movieId: 20, rating: 3 }
    ];

    const dianaWatches = [
        { movieId: 5, rating: 5 },
        { movieId: 10, rating: 5 },
        { movieId: 14, rating: 5 },
        { movieId: 16, rating: 5 },
        { movieId: 17, rating: 4 },
        { movieId: 19, rating: 5 }
    ];

    const eveWatches = [
        { movieId: 4, rating: 5 },
        { movieId: 8, rating: 5 },
        { movieId: 9, rating: 5 },
        { movieId: 11, rating: 4 },
        { movieId: 15, rating: 5 },
        { movieId: 18, rating: 5 },
        { movieId: 19, rating: 4 }
    ];

    const sampleWatchHistory = [
        ...aliceWatches.map((watch, index) => ({
            userId: 1,
            movieId: watch.movieId,
            rating: watch.rating,
            watchedAt: getWatchDate(index, aliceWatches.length),
            createdAt: getWatchDate(index, aliceWatches.length)
        })),
        ...bobWatches.map((watch, index) => ({
            userId: 2,
            movieId: watch.movieId,
            rating: watch.rating,
            watchedAt: getWatchDate(index, bobWatches.length),
            createdAt: getWatchDate(index, bobWatches.length)
        })),
        ...charlieWatches.map((watch, index) => ({
            userId: 3,
            movieId: watch.movieId,
            rating: watch.rating,
            watchedAt: getWatchDate(index, charlieWatches.length),
            createdAt: getWatchDate(index, charlieWatches.length)
        })),
        ...dianaWatches.map((watch, index) => ({
            userId: 4,
            movieId: watch.movieId,
            rating: watch.rating,
            watchedAt: getWatchDate(index, dianaWatches.length),
            createdAt: getWatchDate(index, dianaWatches.length)
        })),
        ...eveWatches.map((watch, index) => ({
            userId: 5,
            movieId: watch.movieId,
            rating: watch.rating,
            watchedAt: getWatchDate(index, eveWatches.length),
            createdAt: getWatchDate(index, eveWatches.length)
        }))
    ];

    await db.insert(watchHistory).values(sampleWatchHistory);
    
    console.log('✅ Watch history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});