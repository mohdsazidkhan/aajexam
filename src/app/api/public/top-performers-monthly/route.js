import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import dayjs from 'dayjs';
import { getSubscriptionDisplayName, getLevelName } from '../helpers';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();

        // Optional authentication to get surrounding users
        let currentUserId = null;
        try {
            const auth = await protect(req);
            if (auth.authenticated && auth.user) {
                currentUserId = auth.user.id;
            }
        } catch (e) {
            // Ignore auth errors, this is a public endpoint
        }

        const { searchParams } = new URL(req.url);
        const limitParam = parseInt(searchParams.get('limit'));
        const limit = Math.min(isNaN(limitParam) ? 10 : limitParam, 50);
        // Sometimes the frontend passes userId explicitly
        if (!currentUserId && searchParams.get('userId') && searchParams.get('userId') !== 'undefined' && searchParams.get('userId') !== 'null') {
            currentUserId = searchParams.get('userId');
        }

        const month = dayjs().format('YYYY-MM');

        // Get users with monthly progress for current month and at least one attempt
        let users = await User.find({
            role: 'student',
            'monthlyProgress.month': month,
            'monthlyProgress.totalQuizAttempts': { $gt: 0 }
        })
            .select('_id name monthlyProgress level profilePicture subscriptionStatus')
            .lean();

        // Ensure all users have monthly progress data, set defaults if missing
        users.forEach(user => {
            if (!user.monthlyProgress) {
                user.monthlyProgress = {
                    month: month,
                    highScoreWins: 0,
                    totalQuizAttempts: 0,
                    accuracy: 0,
                    currentLevel: 0,
                    rewardEligible: false
                };
            }
            // Ensure level data exists
            if (!user.monthlyProgress) {
                user.monthlyProgress = {
                    totalScore: 0,
                    quizzesPlayed: 0,
                    averageScore: 0,
                    currentLevel: 0,
                    highScoreQuizzes: 0
                };
            }
        });

        // Sort by performance: first by high score wins, then by accuracy, then by total quizzes
        users.sort((a, b) => {
            const aWins = a.monthlyProgress?.highScoreWins || 0;
            const bWins = b.monthlyProgress?.highScoreWins || 0;

            if (aWins !== bWins) return bWins - aWins;

            const aAccuracy = a.monthlyProgress?.accuracy || 0;
            const bAccuracy = b.monthlyProgress?.accuracy || 0;

            if (aAccuracy !== bAccuracy) return bAccuracy - aAccuracy;

            const aTotalQuizzes = a.monthlyProgress?.totalQuizAttempts || 0;
            const bTotalQuizzes = b.monthlyProgress?.totalQuizAttempts || 0;
            return bTotalQuizzes - aTotalQuizzes;
        });

        // Add position to each user
        users.forEach((user, index) => {
            user.position = index + 1;
        });

        // Compute total questions answered (totalScore) for the top users in this monthly view
        const topUsersMonthlySlice = users.slice(0, limit);
        const topUsersMonthlyIds = topUsersMonthlySlice.map(u => u._id);

        let monthlyUserIdToTotalQuestions = {};
        try {
            const startOfMonth = dayjs().startOf('month').toDate();
            const endOfMonth = dayjs().endOf('month').toDate();
            
            const monthlyAttempts = await QuizAttempt.find({ 
                user: { $in: topUsersMonthlyIds },
                attemptedAt: { $gte: startOfMonth, $lte: endOfMonth },
                competitionType: 'monthly'
            })
                .select('user quiz')
                .lean();

            const monthlyQuizIds = [...new Set(monthlyAttempts.map(a => a.quiz).filter(Boolean))];

            const quizzes = await Quiz.find({ _id: { $in: monthlyQuizIds } })
                .select('_id totalMarks')
                .lean();

            const monthlyQuizIdToMarks = new Map(quizzes.map(q => [String(q._id), q.totalMarks || 0]));

            for (const attempt of monthlyAttempts) {
                const uid = String(attempt.user);
                const marks = monthlyQuizIdToMarks.get(String(attempt.quiz)) || 0;
                monthlyUserIdToTotalQuestions[uid] = (monthlyUserIdToTotalQuestions[uid] || 0) + marks;
            }
        } catch (e) {
            console.error('Error computing total scores:', e);
            monthlyUserIdToTotalQuestions = {};
        }

        const top = topUsersMonthlySlice.map((user, index) => ({
            userId: user._id,
            name: user.name,
            rank: index + 1,
            month: month,
            profilePicture: user.profilePicture,
            subscriptionName: getSubscriptionDisplayName(user.subscriptionStatus),
            totalScore: monthlyUserIdToTotalQuestions[String(user._id)] || 0,
            totalCorrectAnswers: user.monthlyProgress?.totalCorrectAnswers || 0,
            highQuizzes: user.monthlyProgress?.highScoreWins || 0, // Mobile sorting
            level: user.monthlyProgress?.currentLevel || 0, // Mobile card
            monthlyProgress: user.monthlyProgress, // Mobile card
            monthly: {
                highScoreWins: user.monthlyProgress?.highScoreWins || 0,
                totalQuizAttempts: user.monthlyProgress?.totalQuizAttempts || 0,
                accuracy: user.monthlyProgress?.accuracy || 0,
                currentLevel: user.monthlyProgress?.currentLevel || 0,
                rewardEligible: !!user.monthlyProgress?.rewardEligible
            }
        }));

        // Find current user's position and surrounding users
        let currentUserData = null;
        let surroundingUsers = [];

        if (currentUserId) {
            const currentUserIndex = users.findIndex(user => String(user._id) === String(currentUserId));

            if (currentUserIndex !== -1) {
                currentUserData = {
                    ...users[currentUserIndex],
                    position: users[currentUserIndex].position
                };

                // Get exactly 3 users: 1 before + current + 1 after (when possible)
                let surroundingUsersList = [];

                if (currentUserIndex === 0) {
                    surroundingUsersList = users.slice(1, 3);
                } else if (currentUserIndex === users.length - 1) {
                    surroundingUsersList = users.slice(currentUserIndex - 2, currentUserIndex);
                } else {
                    surroundingUsersList = users.slice(currentUserIndex - 1, currentUserIndex + 2);
                }

                surroundingUsersList = surroundingUsersList.slice(0, 3);

                // Need total scores for surrounding users as well if we want them accurate
                const surroundingIds = surroundingUsersList.map(u => u._id);
                let surroundingTotalScores = {};
                try {
                    const startOfMonth = dayjs().startOf('month').toDate();
                    const endOfMonth = dayjs().endOf('month').toDate();
                    
                    const attempts = await QuizAttempt.find({ 
                        user: { $in: surroundingIds },
                        attemptedAt: { $gte: startOfMonth, $lte: endOfMonth },
                        competitionType: 'monthly'
                    }).select('user quiz').lean();
                    const qIds = [...new Set(attempts.map(a => a.quiz).filter(Boolean))];
                    const quizzes = await Quiz.find({ _id: { $in: qIds } }).select('_id totalMarks').lean();
                    const marksMap = new Map(quizzes.map(q => [String(q._id), q.totalMarks || 0]));
                    for (const attempt of attempts) {
                        const uid = String(attempt.user);
                        surroundingTotalScores[uid] = (surroundingTotalScores[uid] || 0) + (marksMap.get(String(attempt.quiz)) || 0);
                    }
                } catch (e) { }

                surroundingUsers = surroundingUsersList.map((user) => ({
                    userId: user._id,
                    name: user.name,
                    position: user.position,
                    isCurrentUser: String(user._id) === String(currentUserId),
                    subscriptionName: getSubscriptionDisplayName(user.subscriptionStatus),
                    totalCorrectAnswers: user.monthlyProgress?.totalCorrectAnswers || 0,
                    level: {
                        currentLevel: user.monthlyProgress?.currentLevel || 0,
                        levelName: user.monthlyProgress?.currentLevel === 10 ? 'Legend' : getLevelName(user.monthlyProgress?.currentLevel || 0),
                        highScoreQuizzes: user.monthlyProgress?.highScoreWins || 0,
                        quizzesPlayed: user.monthlyProgress?.totalQuizAttempts || 0,
                        accuracy: user.monthlyProgress?.accuracy || 0,
                        averageScore: user.monthlyProgress?.accuracy || 0,
                        totalScore: surroundingTotalScores[String(user._id)] || monthlyUserIdToTotalQuestions[String(user._id)] || 0
                    }
                }));

                // Calculate current user's total score
                let currentUserTotalScore = monthlyUserIdToTotalQuestions[String(currentUserId)];
                if (currentUserTotalScore === undefined) {
                    currentUserTotalScore = surroundingTotalScores[String(currentUserId)] || 0;
                    if (!surroundingTotalScores[String(currentUserId)]) {
                        try {
                            const startOfMonth = dayjs().startOf('month').toDate();
                            const endOfMonth = dayjs().endOf('month').toDate();
                            
                            const attempts = await QuizAttempt.find({ 
                                user: currentUserId,
                                attemptedAt: { $gte: startOfMonth, $lte: endOfMonth },
                                competitionType: 'monthly'
                            }).select('quiz').lean();
                            const qIds = [...new Set(attempts.map(a => a.quiz).filter(Boolean))];
                            const quizzes = await Quiz.find({ _id: { $in: qIds } }).select('_id totalMarks').lean();
                            const marksMap = new Map(quizzes.map(q => [String(q._id), q.totalMarks || 0]));
                            currentUserTotalScore = attempts.reduce((acc, att) => acc + (marksMap.get(String(att.quiz)) || 0), 0);
                        } catch (e) { }
                    }
                }

                currentUserData = {
                    userId: currentUserData._id,
                    name: currentUserData.name,
                    position: currentUserData.position,
                    isCurrentUser: true,
                    subscriptionName: getSubscriptionDisplayName(currentUserData.subscriptionStatus),
                    totalCorrectAnswers: currentUserData.monthlyProgress?.totalCorrectAnswers || 0,
                    level: {
                        currentLevel: currentUserData.monthlyProgress?.currentLevel || 0,
                        levelName: currentUserData.monthlyProgress?.currentLevel === 10 ? 'Legend' : getLevelName(currentUserData.monthlyProgress?.currentLevel || 0),
                        highScoreQuizzes: currentUserData.monthlyProgress?.highScoreWins || 0,
                        quizzesPlayed: currentUserData.monthlyProgress?.totalQuizAttempts || 0,
                        accuracy: currentUserData.monthlyProgress?.accuracy || 0,
                        averageScore: currentUserData.monthlyProgress?.accuracy || 0,
                        totalScore: currentUserTotalScore
                    }
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                month,
                top,
                total: users.length,
                currentUser: currentUserData,
                surroundingUsers
            }
        });

    } catch (error) {
        console.error('Error fetching top performers monthly:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch top performers monthly',
            error: error.message
        }, { status: 500 });
    }
}
