import { db } from '@/db';
import { ottAvailability } from '@/db/schema';

async function main() {
    const sampleOttAvailability = [
        // Movie 1 - Netflix, HBO Max
        {
            movieId: 1,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-08-15').toISOString(),
            updatedAt: new Date('2024-05-24').toISOString(),
        },
        {
            movieId: 1,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2023-09-01').toISOString(),
            updatedAt: new Date('2024-05-26').toISOString(),
        },
        
        // Movie 2 - Netflix, Prime Video
        {
            movieId: 2,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-07-20').toISOString(),
            updatedAt: new Date('2024-05-25').toISOString(),
        },
        {
            movieId: 2,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-10-12').toISOString(),
            updatedAt: new Date('2024-05-27').toISOString(),
        },
        
        // Movie 3 - Prime Video, Apple TV+
        {
            movieId: 3,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-11-05').toISOString(),
            updatedAt: new Date('2024-05-28').toISOString(),
        },
        {
            movieId: 3,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-05-29').toISOString(),
        },
        
        // Movie 4 - Prime Video, HBO Max
        {
            movieId: 4,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-09-18').toISOString(),
            updatedAt: new Date('2024-05-23').toISOString(),
        },
        {
            movieId: 4,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2023-12-01').toISOString(),
            updatedAt: new Date('2024-05-30').toISOString(),
        },
        
        // Movie 5 - Netflix, Disney+
        {
            movieId: 5,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-08-22').toISOString(),
            updatedAt: new Date('2024-05-24').toISOString(),
        },
        {
            movieId: 5,
            platform: 'Disney+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-05-28').toISOString(),
        },
        
        // Movie 6 - Disney+, Apple TV+
        {
            movieId: 6,
            platform: 'Disney+',
            region: 'US',
            available: true,
            createdAt: new Date('2023-10-30').toISOString(),
            updatedAt: new Date('2024-05-26').toISOString(),
        },
        {
            movieId: 6,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-05-29').toISOString(),
        },
        
        // Movie 7 - Netflix, HBO Max
        {
            movieId: 7,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-07-14').toISOString(),
            updatedAt: new Date('2024-05-25').toISOString(),
        },
        {
            movieId: 7,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2023-11-20').toISOString(),
            updatedAt: new Date('2024-05-27').toISOString(),
        },
        
        // Movie 8 - Prime Video, HBO Max
        {
            movieId: 8,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-09-05').toISOString(),
            updatedAt: new Date('2024-05-23').toISOString(),
        },
        {
            movieId: 8,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-05-30').toISOString(),
        },
        
        // Movie 9 - Netflix, Apple TV+
        {
            movieId: 9,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-08-08').toISOString(),
            updatedAt: new Date('2024-05-24').toISOString(),
        },
        {
            movieId: 9,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2023-12-15').toISOString(),
            updatedAt: new Date('2024-05-28').toISOString(),
        },
        
        // Movie 10 - Prime Video, Disney+
        {
            movieId: 10,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-10-01').toISOString(),
            updatedAt: new Date('2024-05-26').toISOString(),
        },
        {
            movieId: 10,
            platform: 'Disney+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-02-28').toISOString(),
            updatedAt: new Date('2024-05-29').toISOString(),
        },
        
        // Movie 11 - Netflix, HBO Max
        {
            movieId: 11,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-07-25').toISOString(),
            updatedAt: new Date('2024-05-25').toISOString(),
        },
        {
            movieId: 11,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2023-11-10').toISOString(),
            updatedAt: new Date('2024-05-27').toISOString(),
        },
        
        // Movie 12 - Prime Video, Apple TV+
        {
            movieId: 12,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-09-28').toISOString(),
            updatedAt: new Date('2024-05-23').toISOString(),
        },
        {
            movieId: 12,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-05-30').toISOString(),
        },
        
        // Movie 13 - Disney+
        {
            movieId: 13,
            platform: 'Disney+',
            region: 'US',
            available: true,
            createdAt: new Date('2023-11-18').toISOString(),
            updatedAt: new Date('2024-05-24').toISOString(),
        },
        
        // Movie 14 - Netflix, Disney+
        {
            movieId: 14,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-08-12').toISOString(),
            updatedAt: new Date('2024-05-28').toISOString(),
        },
        {
            movieId: 14,
            platform: 'Disney+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-03-05').toISOString(),
            updatedAt: new Date('2024-05-26').toISOString(),
        },
        
        // Movie 15 - Prime Video, HBO Max
        {
            movieId: 15,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-10-15').toISOString(),
            updatedAt: new Date('2024-05-29').toISOString(),
        },
        {
            movieId: 15,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2023-12-20').toISOString(),
            updatedAt: new Date('2024-05-25').toISOString(),
        },
        
        // Movie 16 - Netflix, Disney+
        {
            movieId: 16,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-07-30').toISOString(),
            updatedAt: new Date('2024-05-27').toISOString(),
        },
        {
            movieId: 16,
            platform: 'Disney+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-02-18').toISOString(),
            updatedAt: new Date('2024-05-23').toISOString(),
        },
        
        // Movie 17 - Prime Video, Apple TV+
        {
            movieId: 17,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-09-22').toISOString(),
            updatedAt: new Date('2024-05-30').toISOString(),
        },
        {
            movieId: 17,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-05-24').toISOString(),
        },
        
        // Movie 18 - Netflix, HBO Max
        {
            movieId: 18,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-08-18').toISOString(),
            updatedAt: new Date('2024-05-28').toISOString(),
        },
        {
            movieId: 18,
            platform: 'HBO Max',
            region: 'US',
            available: true,
            createdAt: new Date('2023-11-25').toISOString(),
            updatedAt: new Date('2024-05-26').toISOString(),
        },
        
        // Movie 19 - Prime Video, Apple TV+
        {
            movieId: 19,
            platform: 'Prime Video',
            region: 'US',
            available: true,
            createdAt: new Date('2023-10-08').toISOString(),
            updatedAt: new Date('2024-05-29').toISOString(),
        },
        {
            movieId: 19,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-05-25').toISOString(),
        },
        
        // Movie 20 - Netflix, Apple TV+
        {
            movieId: 20,
            platform: 'Netflix',
            region: 'US',
            available: true,
            createdAt: new Date('2023-07-05').toISOString(),
            updatedAt: new Date('2024-05-27').toISOString(),
        },
        {
            movieId: 20,
            platform: 'Apple TV+',
            region: 'US',
            available: true,
            createdAt: new Date('2023-12-08').toISOString(),
            updatedAt: new Date('2024-05-23').toISOString(),
        },
    ];

    await db.insert(ottAvailability).values(sampleOttAvailability);
    
    console.log('✅ OTT Availability seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});