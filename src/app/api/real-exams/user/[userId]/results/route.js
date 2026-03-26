import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const authResult = await protect(req);
        if (!authResult.authenticated) {
            return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
        }
        const authUserId = authResult.user.id;

        await dbConnect();
        const { userId } = await params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        if (authUserId !== userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized to view this user\'s results' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const attempts = await UserTestAttempt.find({
            user: userId,
            status: 'Completed'
        })
            .populate('practiceTest', 'title totalMarks duration')
            .populate({
                path: 'practiceTest',
                populate: {
                    path: 'examPattern',
                    select: 'title'
                }
            })
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await UserTestAttempt.countDocuments({
            user: userId,
            status: 'Completed'
        });

        return NextResponse.json({
            success: true,
            data: attempts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching user results:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
