import { db } from '@/db';
import { clubs } from '@/db/schema';

async function main() {
    const sampleClubs = [
        {
            name: 'Sci-Fi Enthusiasts',
            description: 'Exploring the boundaries of science fiction cinema',
            banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
            creatorId: 'user_charlie_sci_fi_creator_001',
            movieOfTheWeek: 7,
            isPublic: true,
            createdAt: new Date('2024-11-15').toISOString(),
            updatedAt: new Date('2024-11-15').toISOString(),
        },
        {
            name: 'Horror Fans Unite',
            description: 'For those who love a good scare',
            banner: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c',
            creatorId: 'user_bob_horror_fan_creator_002',
            movieOfTheWeek: 12,
            isPublic: true,
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2024-12-01').toISOString(),
        },
        {
            name: 'Classic Cinema Club',
            description: 'Discussing timeless masterpieces of film history',
            banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
            creatorId: 'user_eve_classic_cinema_005',
            movieOfTheWeek: 8,
            isPublic: true,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        }
    ];

    await db.insert(clubs).values(sampleClubs);
    
    console.log('✅ Clubs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});