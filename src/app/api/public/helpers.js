export const getLevelName = (level) => {
    const levelNames = {
        0: 'Starter', 1: 'Rookie', 2: 'Explorer', 3: 'Thinker', 4: 'Strategist', 5: 'Achiever',
        6: 'Mastermind', 7: 'Champion', 8: 'Prodigy', 9: 'Wizard', 10: 'Legend'
    };
    return levelNames[level] || 'Unknown';
};

export const getSubscriptionDisplayName = (subscriptionStatus) => {
    const subscriptionNames = {
        'free': 'FREE',
        'pro': 'PRO'
    };
    return subscriptionNames[subscriptionStatus] || 'FREE';
};
