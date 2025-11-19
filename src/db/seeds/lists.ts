import { db } from '@/db';
import { lists } from '@/db/schema';

async function main() {
    const sampleLists = [
        {
            name: 'Best Sci-Fi Masterpieces',
            description: 'Mind-bending science fiction films that redefine the genre',
            userId: 5,
            isPublic: true,
            followers: 47,
            cover: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0',
            createdAt: new Date('2024-11-15').toISOString(),
            updatedAt: new Date('2024-11-15').toISOString(),
        },
        {
            name: 'Underrated Gems You Need to Watch',
            description: 'Hidden treasures that deserve more attention',
            userId: 5,
            isPublic: true,
            followers: 38,
            cover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
            createdAt: new Date('2024-11-18').toISOString(),
            updatedAt: new Date('2024-11-18').toISOString(),
        },
        {
            name: 'Weekend Feel-Good Picks',
            description: 'Perfect movies for a cozy weekend',
            userId: 4,
            isPublic: true,
            followers: 31,
            cover: 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
            createdAt: new Date('2024-11-22').toISOString(),
            updatedAt: new Date('2024-11-22').toISOString(),
        },
        {
            name: 'Classic Cinema Essentials',
            description: 'Timeless films every cinephile must see',
            userId: 2,
            isPublic: true,
            followers: 52,
            cover: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
            createdAt: new Date('2024-11-25').toISOString(),
            updatedAt: new Date('2024-11-25').toISOString(),
        },
        {
            name: 'Intense Thrillers That Keep You Guessing',
            description: 'Edge-of-your-seat suspense and mystery',
            userId: 1,
            isPublic: true,
            followers: 29,
            cover: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
            createdAt: new Date('2024-11-28').toISOString(),
            updatedAt: new Date('2024-11-28').toISOString(),
        },
    ];

    await db.insert(lists).values(sampleLists);
    
    console.log('✅ Lists seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});