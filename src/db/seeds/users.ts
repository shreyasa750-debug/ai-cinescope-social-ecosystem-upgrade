import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            username: 'alice_moviefan',
            email: 'alice@cinescope.com',
            password: '$2a$10$hashed_password_alice',
            profileImage: 'https://i.pravatar.cc/150?img=1',
            bio: 'Movie enthusiast and weekend binger',
            preferences: JSON.stringify({
                genres: ['drama', 'thriller', 'sci-fi'],
                moods: ['intense', 'thought-provoking'],
                watchHabits: {
                    preferredTime: 'evening',
                    avgMoviesPerWeek: 5
                }
            }),
            persona: 'casual',
            stats: JSON.stringify({
                moviesWatched: 127,
                reviewsWritten: 15,
                listsCreated: 2
            }),
            parentalControls: JSON.stringify({
                enabled: false
            }),
            createdAt: new Date('2024-10-15T14:30:00Z').toISOString(),
            lastActive: new Date('2025-01-10T18:45:00Z').toISOString()
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            username: 'bob_critic',
            email: 'bob@cinescope.com',
            password: '$2a$10$hashed_password_bob',
            profileImage: 'https://i.pravatar.cc/150?img=2',
            bio: 'Film critic and cinephile. Reviews with depth and passion.',
            preferences: JSON.stringify({
                genres: ['drama', 'foreign', 'documentary'],
                moods: ['artistic', 'cerebral'],
                watchHabits: {
                    preferredTime: 'night',
                    avgMoviesPerWeek: 8
                }
            }),
            persona: 'critic',
            stats: JSON.stringify({
                moviesWatched: 342,
                reviewsWritten: 89,
                listsCreated: 7
            }),
            parentalControls: JSON.stringify({
                enabled: false
            }),
            createdAt: new Date('2024-09-20T09:15:00Z').toISOString(),
            lastActive: new Date('2025-01-12T22:30:00Z').toISOString()
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r6',
            username: 'charlie_binger',
            email: 'charlie@cinescope.com',
            password: '$2a$10$hashed_password_charlie',
            profileImage: 'https://i.pravatar.cc/150?img=3',
            bio: 'Binge-watcher extraordinaire. Always up for a movie marathon!',
            preferences: JSON.stringify({
                genres: ['action', 'comedy', 'adventure'],
                moods: ['exciting', 'fun'],
                watchHabits: {
                    preferredTime: 'any',
                    avgMoviesPerWeek: 12
                }
            }),
            persona: 'binger',
            stats: JSON.stringify({
                moviesWatched: 523,
                reviewsWritten: 34,
                listsCreated: 5
            }),
            parentalControls: JSON.stringify({
                enabled: false
            }),
            createdAt: new Date('2024-08-05T16:20:00Z').toISOString(),
            lastActive: new Date('2025-01-13T20:00:00Z').toISOString()
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r7',
            username: 'diana_casual',
            email: 'diana@cinescope.com',
            password: '$2a$10$hashed_password_diana',
            profileImage: 'https://i.pravatar.cc/150?img=4',
            bio: 'Just here for the good vibes and feel-good movies',
            preferences: JSON.stringify({
                genres: ['comedy', 'romance', 'animation'],
                moods: ['uplifting', 'heartwarming'],
                watchHabits: {
                    preferredTime: 'afternoon',
                    avgMoviesPerWeek: 3
                }
            }),
            persona: 'casual',
            stats: JSON.stringify({
                moviesWatched: 78,
                reviewsWritten: 8,
                listsCreated: 1
            }),
            parentalControls: JSON.stringify({
                enabled: false
            }),
            createdAt: new Date('2024-11-12T11:00:00Z').toISOString(),
            lastActive: new Date('2025-01-08T15:30:00Z').toISOString()
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r8',
            username: 'eve_curator',
            email: 'eve@cinescope.com',
            password: '$2a$10$hashed_password_eve',
            profileImage: 'https://i.pravatar.cc/150?img=5',
            bio: 'List curator and movie organizer. Finding hidden gems for you.',
            preferences: JSON.stringify({
                genres: ['indie', 'drama', 'mystery'],
                moods: ['intriguing', 'unique'],
                watchHabits: {
                    preferredTime: 'evening',
                    avgMoviesPerWeek: 6
                }
            }),
            persona: 'critic',
            stats: JSON.stringify({
                moviesWatched: 298,
                reviewsWritten: 42,
                listsCreated: 15
            }),
            parentalControls: JSON.stringify({
                enabled: false
            }),
            createdAt: new Date('2024-09-28T13:45:00Z').toISOString(),
            lastActive: new Date('2025-01-11T19:15:00Z').toISOString()
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});