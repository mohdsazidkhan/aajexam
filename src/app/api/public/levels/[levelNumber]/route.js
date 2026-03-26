import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Ensure parameters are resolved
        const { levelNumber } = await params;

        const parsedLevel = parseInt(levelNumber);

        if (isNaN(parsedLevel)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid level number'
            }, { status: 400 });
        }

        const level = await Level.findOne({
            levelNumber: parsedLevel,
            isActive: true
        }).select('-createdBy -updatedBy -__v').lean();

        if (!level) {
            return NextResponse.json({
                success: false,
                message: 'Level not found'
            }, { status: 404 });
        }

        // Get user count for this level
        const userCount = await User.countDocuments({
            'level.currentLevel': level.levelNumber,
            role: 'student'
        });

        // Get top users on this level
        const topUsers = await User.find({
            'level.currentLevel': level.levelNumber,
            role: 'student'
        })
            .select('name level.averageScore level.quizzesPlayed username profilePicture')
            .sort({ 'level.averageScore': -1 })
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                ...level,
                userCount,
                topUsers
            }
        });
    } catch (error) {
        console.error('Error fetching level:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch level',
            error: error.message
        }, { status: 500 });
    }
}
