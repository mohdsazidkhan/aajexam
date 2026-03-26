import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const search = searchParams.get('search') || '';

        let allAttempts = await UserTestAttempt.find({ user: auth.user.id, status: 'Completed' })
            .populate({
                path: 'practiceTest',
                select: 'title totalMarks duration',
                populate: { path: 'examPattern', select: 'title', populate: { path: 'exam', select: 'name', populate: { path: 'category', select: 'name type' } } }
            })
            .sort({ submittedAt: -1 }).lean();

        if (search) {
            const s = search.toLowerCase();
            allAttempts = allAttempts.filter(a =>
                a.practiceTest?.title?.toLowerCase().includes(s) ||
                a.practiceTest?.examPattern?.title?.toLowerCase().includes(s) ||
                a.practiceTest?.examPattern?.exam?.name?.toLowerCase().includes(s) ||
                a.practiceTest?.examPattern?.exam?.category?.name?.toLowerCase().includes(s)
            );
        }

        const total = allAttempts.length;
        const attempts = allAttempts.slice(skip, skip + limit).map(a => ({
            _id: a._id,
            testTitle: a.practiceTest?.title || 'Unknown',
            examName: a.practiceTest?.examPattern?.exam?.name || 'Unknown',
            patternTitle: a.practiceTest?.examPattern?.title || 'Unknown',
            categoryName: a.practiceTest?.examPattern?.exam?.category?.name || 'Unknown',
            score: a.score || 0,
            totalMarks: a.practiceTest?.totalMarks || 0,
            correctCount: a.correctCount || 0,
            wrongCount: a.wrongCount || 0,
            accuracy: a.accuracy || 0,
            rank: a.rank,
            percentile: a.percentile,
            totalTime: a.totalTime || 0,
            submittedAt: a.submittedAt || a.createdAt,
            startedAt: a.startedAt,
            practiceTest: a.practiceTest?._id
        }));

        return NextResponse.json({
            success: true,
            data: {
                attempts,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalAttempts: total }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
