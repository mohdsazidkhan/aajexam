import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = params;
        const levelNum = parseInt(id);

        const level = await Level.findOne({ levelNumber: levelNum });
        if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });

        const usersOnLevel = await User.countDocuments({ 'level.currentLevel': levelNum, role: 'student' });

        const avgStats = await User.aggregate([
            { $match: { 'level.currentLevel': levelNum, role: 'student' } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$level.averageScore' },
                    avgQuizzesPlayed: { $avg: '$level.quizzesPlayed' },
                    avgHighScoreQuizzes: { $avg: '$level.highScoreQuizzes' }
                }
            }
        ]);

        const stats = avgStats[0] || { avgScore: 0, avgQuizzesPlayed: 0, avgHighScoreQuizzes: 0 };

        return NextResponse.json({
            success: true,
            data: {
                level,
                statistics: {
                    usersOnLevel,
                    averageScore: Math.round(stats.avgScore || 0),
                    averageQuizzesPlayed: Math.round(stats.avgQuizzesPlayed || 0),
                    averageHighScoreQuizzes: Math.round(stats.avgHighScoreQuizzes || 0)
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
