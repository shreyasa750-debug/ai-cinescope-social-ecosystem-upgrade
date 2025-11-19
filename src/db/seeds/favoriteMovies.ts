import { db } from '@/db';
import { favoriteMovies } from '@/db/schema';

async function main() {
    const sampleFavoriteMovies = [
        {
            userId: 1,
            movieId: 3,
            addedAt: new Date('2024-11-15T14:30:00').toISOString(),
        },
        {
            userId: 1,
            movieId: 16,
            addedAt: new Date('2024-12-02T09:45:00').toISOString(),
        },
        {
            userId: 2,
            movieId: 8,
            addedAt: new Date('2024-11-20T16:20:00').toISOString(),
        },
        {
            userId: 2,
            movieId: 9,
            addedAt: new Date('2024-11-28T11:15:00').toISOString(),
        },
        {
            userId: 2,
            movieId: 15,
            addedAt: new Date('2024-12-10T19:30:00').toISOString(),
        },
        {
            userId: 3,
            movieId: 2,
            addedAt: new Date('2024-11-18T20:45:00').toISOString(),
        },
        {
            userId: 3,
            movieId: 13,
            addedAt: new Date('2024-12-05T15:10:00').toISOString(),
        },
        {
            userId: 4,
            movieId: 10,
            addedAt: new Date('2024-11-22T13:25:00').toISOString(),
        },
        {
            userId: 4,
            movieId: 14,
            addedAt: new Date('2024-12-08T17:40:00').toISOString(),
        },
        {
            userId: 5,
            movieId: 18,
            addedAt: new Date('2024-11-25T10:50:00').toISOString(),
        },
        {
            userId: 5,
            movieId: 19,
            addedAt: new Date('2024-12-12T21:15:00').toISOString(),
        },
    ];

    await db.insert(favoriteMovies).values(sampleFavoriteMovies);
    
    console.log('✅ Favorite movies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});