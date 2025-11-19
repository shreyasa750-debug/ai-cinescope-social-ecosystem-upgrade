import { db } from '@/db';
import { challenges } from '@/db/schema';

async function main() {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const sampleChallenges = [
        {
            title: 'Daily Double',
            description: 'Watch 2 movies today and earn bonus points. Perfect for a movie marathon evening!',
            type: 'daily',
            target: 2,
            rewardType: 'points',
            rewardValue: 50,
            startDate: now.toISOString(),
            endDate: oneDayLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Quick Review',
            description: 'Write 1 thoughtful review today. Share your movie opinions with the community!',
            type: 'daily',
            target: 1,
            rewardType: 'points',
            rewardValue: 30,
            startDate: now.toISOString(),
            endDate: oneDayLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Movie Night',
            description: 'Watch 1 movie tonight before midnight. Make tonight a movie night!',
            type: 'daily',
            target: 1,
            rewardType: 'points',
            rewardValue: 20,
            startDate: now.toISOString(),
            endDate: oneDayLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Rate and Reflect',
            description: 'Rate 3 movies today. Help others discover great films through your ratings!',
            type: 'daily',
            target: 3,
            rewardType: 'points',
            rewardValue: 40,
            startDate: now.toISOString(),
            endDate: oneDayLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Weekly Marathon',
            description: 'Watch 7 movies this week. One movie per day keeps the boredom away!',
            type: 'weekly',
            target: 7,
            rewardType: 'points',
            rewardValue: 150,
            startDate: now.toISOString(),
            endDate: sevenDaysLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Review Spree',
            description: 'Write 5 detailed reviews this week. Become a trusted voice in the community!',
            type: 'weekly',
            target: 5,
            rewardType: 'points',
            rewardValue: 100,
            startDate: now.toISOString(),
            endDate: sevenDaysLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Genre Explorer',
            description: 'Watch movies from 4 different genres this week. Expand your cinematic horizons!',
            type: 'weekly',
            target: 4,
            rewardType: 'points',
            rewardValue: 120,
            startDate: now.toISOString(),
            endDate: sevenDaysLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Social Butterfly',
            description: 'Watch 3 movies with friends in watch rooms this week. Movies are better together!',
            type: 'weekly',
            target: 3,
            rewardType: 'points',
            rewardValue: 80,
            startDate: now.toISOString(),
            endDate: sevenDaysLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Month of Movies',
            description: 'Watch 30 movies this month. One movie per day for the ultimate cinephile achievement!',
            type: 'special',
            target: 30,
            rewardType: 'points',
            rewardValue: 500,
            startDate: now.toISOString(),
            endDate: thirtyDaysLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
        {
            title: 'Super Critic',
            description: 'Write 20 detailed reviews this month. Unlock the prestigious Super Critic badge!',
            type: 'special',
            target: 20,
            rewardType: 'badge',
            rewardValue: 11,
            startDate: now.toISOString(),
            endDate: thirtyDaysLater.toISOString(),
            active: true,
            createdAt: now.toISOString(),
        },
    ];

    await db.insert(challenges).values(sampleChallenges);
    
    console.log('✅ Challenges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});