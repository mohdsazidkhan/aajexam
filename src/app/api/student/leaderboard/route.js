import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        // Note: Leaderboard might be public or protected. Express used protect.
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly';
        const date = searchParams.get('date');
        const week = searchParams.get('week');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
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

        let leaderboard;
        let total;

        if (isHistorical) {
            const records = await HistoricalModel.find(query)
                .select('name userName dailyProgress weeklyProgress monthlyProgress originalUserId')
                .sort({ 
                    [`${type}Progress.highScoreWins`]: -1, 
                    [`${type}Progress.accuracy`]: -1, 
                    [`${type}Progress.totalScore`]: -1,
                    [`${type}Progress.totalQuizAttempts`]: -1
                })
                .skip(skip)
                .limit(limit);

            leaderboard = records.map((leader, index) => {
                const progress = type === 'daily' ? leader.dailyProgress : leader.weeklyProgress;
                return {
                    rank: skip + index + 1,
                    studentId: leader.originalUserId,
                    studentName: leader.name || 'Anonymous',
                    level: {
                        currentLevel: progress?.currentLevel || 1,
                        levelName: progress?.levelName || 'Rookie',
                        highScoreQuizzes: progress?.highScoreWins || 0,
                        averageScore: progress?.accuracy || 0
                    },
                    badges: [], // Historical records might not have full badges, keeping empty for now
                    subscriptionStatus: 'pro' // Historical players for daily/weekly are usually pro
                };
            });

            total = await HistoricalModel.countDocuments(query);
        } else {
            const users = await User.find({ role: 'student', status: 'active' })
                .select('name dailyProgress weeklyProgress monthlyProgress badges subscriptionStatus')
                .sort({ 
                    [`${type}Progress.highScoreWins`]: -1, 
                    [`${type}Progress.accuracy`]: -1, 
                    [`${type}Progress.totalScore`]: -1,
                    [`${type}Progress.totalQuizAttempts`]: -1
                })
                .skip(skip)
                .limit(limit);

            total = await User.countDocuments({ role: 'student' });

            leaderboard = users.map((user, index) => {
                const levelInfo = user.getCompetitionLevel(type);
                const progress = type === 'daily' ? user.dailyProgress : 
                                (type === 'weekly' ? user.weeklyProgress : user.monthlyProgress);
                
                return {
                    rank: skip + index + 1,
                    studentId: user._id,
                    studentName: user.name || 'Anonymous',
                    level: {
                        currentLevel: levelInfo.currentLevel,
                        levelName: levelInfo.levelName,
                        highScoreQuizzes: progress?.highScoreWins || 0,
                        averageScore: progress?.accuracy || 0
                    },
                    badges: user.badges || [],
                    subscriptionStatus: user.subscriptionStatus || 'free'
                };
            });
        }

        return NextResponse.json({
            success: true,
            leaderboard,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNextPage: skip + leaderboard.length < total,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        console.error('Leaderboard fetch error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
