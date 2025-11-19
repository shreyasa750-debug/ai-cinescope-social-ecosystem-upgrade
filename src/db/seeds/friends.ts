import { db } from '@/db';
import { friends } from '@/db/schema';

async function main() {
    const friendships = [
        // Alice (1) is friends with Bob (2)
        {
            userId: 1,
            friendId: 2,
            createdAt: new Date('2024-11-05').toISOString(),
        },
        {
            userId: 2,
            friendId: 1,
            createdAt: new Date('2024-11-05').toISOString(),
        },
        
        // Alice (1) is friends with Charlie (3)
        {
            userId: 1,
            friendId: 3,
            createdAt: new Date('2024-11-12').toISOString(),
        },
        {
            userId: 3,
            friendId: 1,
            createdAt: new Date('2024-11-12').toISOString(),
        },
        
        // Alice (1) is friends with Diana (4)
        {
            userId: 1,
            friendId: 4,
            createdAt: new Date('2024-11-20').toISOString(),
        },
        {
            userId: 4,
            friendId: 1,
            createdAt: new Date('2024-11-20').toISOString(),
        },
        
        // Bob (2) is friends with Eve (5)
        {
            userId: 2,
            friendId: 5,
            createdAt: new Date('2024-11-25').toISOString(),
        },
        {
            userId: 5,
            friendId: 2,
            createdAt: new Date('2024-11-25').toISOString(),
        },
        
        // Charlie (3) is friends with Diana (4)
        {
            userId: 3,
            friendId: 4,
            createdAt: new Date('2024-12-01').toISOString(),
        },
        {
            userId: 4,
            friendId: 3,
            createdAt: new Date('2024-12-01').toISOString(),
        },
        
        // Charlie (3) is friends with Eve (5)
        {
            userId: 3,
            friendId: 5,
            createdAt: new Date('2024-12-08').toISOString(),
        },
        {
            userId: 5,
            friendId: 3,
            createdAt: new Date('2024-12-08').toISOString(),
        },
    ];

    await db.insert(friends).values(friendships);
    
    console.log('✅ Friends seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});