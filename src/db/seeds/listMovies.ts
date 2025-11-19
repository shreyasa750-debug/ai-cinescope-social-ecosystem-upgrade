import { db } from '@/db';
import { listMovies } from '@/db/schema';

async function main() {
    const sampleListMovies = [
        // List 1 "Best Sci-Fi Masterpieces" - 4 movies
        {
            listId: 1,
            movieId: 3,
            addedAt: new Date('2024-11-15T10:30:00').toISOString(),
        },
        {
            listId: 1,
            movieId: 6,
            addedAt: new Date('2024-11-18T14:20:00').toISOString(),
        },
        {
            listId: 1,
            movieId: 7,
            addedAt: new Date('2024-11-22T09:15:00').toISOString(),
        },
        {
            listId: 1,
            movieId: 16,
            addedAt: new Date('2024-12-02T16:45:00').toISOString(),
        },
        
        // List 2 "Underrated Gems" - 3 movies
        {
            listId: 2,
            movieId: 18,
            addedAt: new Date('2024-11-16T11:00:00').toISOString(),
        },
        {
            listId: 2,
            movieId: 19,
            addedAt: new Date('2024-11-25T15:30:00').toISOString(),
        },
        {
            listId: 2,
            movieId: 15,
            addedAt: new Date('2024-12-01T13:20:00').toISOString(),
        },
        
        // List 3 "Weekend Feel-Good Picks" - 4 movies
        {
            listId: 3,
            movieId: 5,
            addedAt: new Date('2024-11-17T10:00:00').toISOString(),
        },
        {
            listId: 3,
            movieId: 10,
            addedAt: new Date('2024-11-20T14:45:00').toISOString(),
        },
        {
            listId: 3,
            movieId: 14,
            addedAt: new Date('2024-11-28T09:30:00').toISOString(),
        },
        {
            listId: 3,
            movieId: 19,
            addedAt: new Date('2024-12-05T16:15:00').toISOString(),
        },
        
        // List 4 "Classic Cinema Essentials" - 4 movies
        {
            listId: 4,
            movieId: 1,
            addedAt: new Date('2024-11-19T11:20:00').toISOString(),
        },
        {
            listId: 4,
            movieId: 4,
            addedAt: new Date('2024-11-23T15:00:00').toISOString(),
        },
        {
            listId: 4,
            movieId: 8,
            addedAt: new Date('2024-11-27T10:45:00').toISOString(),
        },
        {
            listId: 4,
            movieId: 11,
            addedAt: new Date('2024-12-03T14:30:00').toISOString(),
        },
        
        // List 5 "Intense Thrillers" - 5 movies
        {
            listId: 5,
            movieId: 2,
            addedAt: new Date('2024-11-21T09:00:00').toISOString(),
        },
        {
            listId: 5,
            movieId: 9,
            addedAt: new Date('2024-11-24T13:45:00').toISOString(),
        },
        {
            listId: 5,
            movieId: 11,
            addedAt: new Date('2024-11-29T11:30:00').toISOString(),
        },
        {
            listId: 5,
            movieId: 12,
            addedAt: new Date('2024-12-04T15:20:00').toISOString(),
        },
        {
            listId: 5,
            movieId: 17,
            addedAt: new Date('2024-12-06T10:00:00').toISOString(),
        },
    ];

    await db.insert(listMovies).values(sampleListMovies);
    
    console.log('✅ List movies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});