import { db } from '@/db';
import { badges } from '@/db/schema';

async function main() {
    const sampleBadges = [
        // COMMON BADGES (10-25 points)
        {
            name: 'First Steps',
            description: 'Welcome to the world of cinema! Watch your first movie and begin your journey.',
            icon: '🎬',
            rarity: 'common',
            requirements: JSON.stringify({ type: 'movies_watched', value: 1 }),
            rewardPoints: 10,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Movie Buff',
            description: 'You\'re getting the hang of this! Watch 10 movies and prove your dedication.',
            icon: '🍿',
            rarity: 'common',
            requirements: JSON.stringify({ type: 'movies_watched', value: 10 }),
            rewardPoints: 15,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Critic in Training',
            description: 'Share your thoughts! Write your first review and let others know what you think.',
            icon: '✍️',
            rarity: 'common',
            requirements: JSON.stringify({ type: 'reviews_written', value: 1 }),
            rewardPoints: 15,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Five Star Fan',
            description: 'You know quality when you see it! Give 5 movies a perfect five-star rating.',
            icon: '⭐',
            rarity: 'common',
            requirements: JSON.stringify({ type: 'high_ratings', value: 5 }),
            rewardPoints: 20,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Genre Curious',
            description: 'Expand your horizons! Watch movies from 3 different genres.',
            icon: '🎭',
            rarity: 'common',
            requirements: JSON.stringify({ type: 'genre_explorer', value: 3 }),
            rewardPoints: 25,
            createdAt: new Date().toISOString(),
        },

        // RARE BADGES (30-50 points)
        {
            name: 'Weekend Warrior',
            description: 'Your weekends are for movies! Watch 25 movies and show your commitment.',
            icon: '🎥',
            rarity: 'rare',
            requirements: JSON.stringify({ type: 'movies_watched', value: 25 }),
            rewardPoints: 30,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Thoughtful Reviewer',
            description: 'Your opinions matter! Write 10 insightful reviews.',
            icon: '📝',
            rarity: 'rare',
            requirements: JSON.stringify({ type: 'reviews_written', value: 10 }),
            rewardPoints: 35,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Perfectionist',
            description: 'You have high standards! Award 15 movies with five-star ratings.',
            icon: '💯',
            rarity: 'rare',
            requirements: JSON.stringify({ type: 'high_ratings', value: 15 }),
            rewardPoints: 40,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Genre Master',
            description: 'True versatility! Experience the magic of 5 different genres.',
            icon: '🎨',
            rarity: 'rare',
            requirements: JSON.stringify({ type: 'genre_explorer', value: 5 }),
            rewardPoints: 45,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Dedicated Viewer',
            description: 'Half a century of cinema! Watch 50 movies and cement your passion.',
            icon: '📺',
            rarity: 'rare',
            requirements: JSON.stringify({ type: 'movies_watched', value: 50 }),
            rewardPoints: 50,
            createdAt: new Date().toISOString(),
        },

        // EPIC BADGES (75-100 points)
        {
            name: 'Cinephile',
            description: 'A true lover of cinema! Watch 100 movies and join the elite.',
            icon: '🎞️',
            rarity: 'epic',
            requirements: JSON.stringify({ type: 'movies_watched', value: 100 }),
            rewardPoints: 75,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Seasoned Critic',
            description: 'Your voice is influential! Write 25 comprehensive reviews.',
            icon: '🖊️',
            rarity: 'epic',
            requirements: JSON.stringify({ type: 'reviews_written', value: 25 }),
            rewardPoints: 85,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Genre Connoisseur',
            description: 'You\'ve seen it all! Explore movies from 8 different genres.',
            icon: '🌟',
            rarity: 'epic',
            requirements: JSON.stringify({ type: 'genre_explorer', value: 8 }),
            rewardPoints: 100,
            createdAt: new Date().toISOString(),
        },

        // LEGENDARY BADGES (150-200 points)
        {
            name: 'Film Legend',
            description: 'An extraordinary achievement! Watch 200 movies and become a legend.',
            icon: '👑',
            rarity: 'legendary',
            requirements: JSON.stringify({ type: 'movies_watched', value: 200 }),
            rewardPoints: 150,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Master Critic',
            description: 'The pinnacle of expertise! Write 50 masterful reviews and inspire others.',
            icon: '🏆',
            rarity: 'legendary',
            requirements: JSON.stringify({ type: 'reviews_written', value: 50 }),
            rewardPoints: 200,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(badges).values(sampleBadges);
    
    console.log('✅ Badges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});