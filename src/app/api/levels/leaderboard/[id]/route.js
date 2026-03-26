import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const levelNumber = parseInt(id);
        const config = User.LEVEL_CONFIG[levelNumber];
        if (!config) return NextResponse.json({ success: false, message: 'Invalid level' }, { status: 400 });

        const query = { role: 'student', 'level.currentLevel': levelNumber };
        const [users, total] = await Promise.all([
            User.find(query)
                .select('name level badges')
                .sort({ 'level.averageScore': -1, 'level.quizzesPlayed': -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        const leaderboard = users.map((u, i) => ({
            rank: skip + i + 1,
            user: { _id: u._id, name: u.name, badges: u.badges },
            level: u.level
        }));

        return NextResponse.json({
            success: true,
            data: {
                level: { number: levelNumber, name: config.name, description: config.description },
                leaderboard,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalUsers: total }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
