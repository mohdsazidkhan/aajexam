import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly'; // daily, weekly, monthly
        const date = searchParams.get('date');
        const week = searchParams.get('week');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const now = new Date();
        const currentDate = now.toISOString().slice(0, 10);
        
        // Weekly current calculation
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        const currentWeek = `${now.getFullYear()}-W${weekNum}`;

        let isHistorical = false;
        let HistoricalModel;
        let query = {};

        if (type === 'daily' && date && date !== currentDate) {
            isHistorical = true;
            HistoricalModel = mongoose.models.PrevDailyPlayedUsers || mongoose.model('PrevDailyPlayedUsers');
            query.date = date;
        } else if (type === 'weekly' && week && week !== currentWeek) {
            isHistorical = true;
            HistoricalModel = mongoose.models.PrevWeeklyPlayedUsers || mongoose.model('PrevWeeklyPlayedUsers');
            query.week = week;
        }

        let leaders;
        let totalEntries;

        if (isHistorical) {
            leaders = await HistoricalModel.find(query)
                .select('name userName dailyProgress weeklyProgress monthlyProgress originalUserId profilePicture')
                .sort({ 
                    [`${type}Progress.highScoreWins`]: -1, 
                    [`${type}Progress.accuracy`]: -1, 
                    [`${type}Progress.totalScore`]: -1,
                    [`${type}Progress.totalQuizAttempts`]: -1
                })
                .skip(skip)
                .limit(limit);

            leaders = leaders.map(leader => {
                const progress = type === 'daily' ? leader.dailyProgress : leader.weeklyProgress;
                return {
                    userId: leader.originalUserId,
                    name: leader.name,
                    username: leader.userName,
                    profilePicture: leader.profilePicture,
                    currentLevel: progress?.currentLevel || 0,
                    levelName: progress?.levelName || 'Starter',
                    totalScore: progress?.totalScore || 0,
                    stats: {
                        highScoreWins: progress?.highScoreWins || 0,
                        totalQuizAttempts: progress?.totalQuizAttempts || 0,
                        accuracy: progress?.accuracy || 0,
                        totalCorrectAnswers: progress?.totalCorrectAnswers || 0
                    }
                };
            });

            totalEntries = await HistoricalModel.countDocuments(query);
        } else {
            // Logic based on User model's leaderboard fields
            const rawLeaders = await User.find({ role: 'student', status: 'active' })
                .select('name username profilePicture dailyProgress weeklyProgress monthlyProgress subscriptionStatus')
                .sort({ 
                    [`${type}Progress.highScoreWins`]: -1, 
                    [`${type}Progress.accuracy`]: -1, 
                    [`${type}Progress.totalScore`]: -1,
                    [`${type}Progress.totalQuizAttempts`]: -1
                })
                .skip(skip)
                .limit(limit);

            leaders = rawLeaders.map(leader => {
                const levelInfo = leader.getCompetitionLevel(type);
                const progress = type === 'daily' ? leader.dailyProgress : 
                                 type === 'weekly' ? leader.weeklyProgress : leader.monthlyProgress;
                return {
                    ...leader.toObject(),
                    currentLevel: levelInfo.currentLevel,
                    levelName: levelInfo.levelName,
                    stats: {
                        highScoreWins: progress?.highScoreWins || 0,
                        totalQuizAttempts: progress?.totalQuizAttempts || 0,
                        accuracy: progress?.accuracy || 0,
                        totalCorrectAnswers: progress?.totalCorrectAnswers || 0,
                        totalScore: progress?.totalScore || 0
                    }
                };
            });

            totalEntries = await User.countDocuments({ role: 'student' });
        }

        // Find current user if userId is provided
        const currentUserId = searchParams.get('userId');
        let currentUserData = null;

        if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
            const userDoc = await User.findById(currentUserId);
            if (userDoc) {
                const levelInfo = userDoc.getCompetitionLevel(type);
                const progress = type === 'daily' ? userDoc.dailyProgress : 
                                 type === 'weekly' ? userDoc.weeklyProgress : userDoc.monthlyProgress;
                                 
                // Try to find rank if they are in the current list
                const inList = leaders.filter(l => String(l._id || l.userId) === String(currentUserId))[0];

                currentUserData = {
                    userId: userDoc._id,
                    name: userDoc.name,
                    username: userDoc.username,
                    profilePicture: userDoc.profilePicture,
                    subscriptionStatus: userDoc.subscriptionStatus,
                    currentLevel: levelInfo.currentLevel,
                    levelName: levelInfo.levelName,
                    rank: inList?.rank || inList?.position || null,
                    stats: {
                        highScoreWins: progress?.highScoreWins || 0,
                        totalQuizAttempts: progress?.totalQuizAttempts || 0,
                        accuracy: progress?.accuracy || 0,
                        totalCorrectAnswers: progress?.totalCorrectAnswers || 0,
                        totalScore: progress?.totalScore || 0
                    }
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: leaders,
            currentUser: currentUserData,
            pagination: {
                total: totalEntries,
                page,
                limit,
                pages: Math.ceil(totalEntries / limit)
            }
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
