import { db } from '@/db';
import { clubMembers } from '@/db/schema';

async function main() {
    const sampleClubMembers = [
        // Club 1: Sci-Fi Enthusiasts
        {
            clubId: 1,
            userId: 3,
            isModerator: true,
            joinedAt: new Date('2024-10-15').toISOString(),
        },
        {
            clubId: 1,
            userId: 1,
            isModerator: false,
            joinedAt: new Date('2024-10-20').toISOString(),
        },
        {
            clubId: 1,
            userId: 2,
            isModerator: false,
            joinedAt: new Date('2024-11-05').toISOString(),
        },
        {
            clubId: 1,
            userId: 5,
            isModerator: true,
            joinedAt: new Date('2024-11-12').toISOString(),
        },
        // Club 2: Horror Fans Unite
        {
            clubId: 2,
            userId: 2,
            isModerator: true,
            joinedAt: new Date('2024-10-18').toISOString(),
        },
        {
            clubId: 2,
            userId: 1,
            isModerator: false,
            joinedAt: new Date('2024-10-25').toISOString(),
        },
        {
            clubId: 2,
            userId: 3,
            isModerator: false,
            joinedAt: new Date('2024-11-08').toISOString(),
        },
        // Club 3: Classic Cinema Club
        {
            clubId: 3,
            userId: 5,
            isModerator: true,
            joinedAt: new Date('2024-10-10').toISOString(),
        },
        {
            clubId: 3,
            userId: 2,
            isModerator: true,
            joinedAt: new Date('2024-10-22').toISOString(),
        },
        {
            clubId: 3,
            userId: 1,
            isModerator: false,
            joinedAt: new Date('2024-11-01').toISOString(),
        },
        {
            clubId: 3,
            userId: 4,
            isModerator: false,
            joinedAt: new Date('2024-11-15').toISOString(),
        },
    ];

    await db.insert(clubMembers).values(sampleClubMembers);
    
    console.log('✅ Club members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});