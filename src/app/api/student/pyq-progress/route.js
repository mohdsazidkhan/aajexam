import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import PracticeTest from '@/models/PracticeTest'; // Needed for populate
import ExamPattern from '@/models/ExamPattern'; // Needed for populate
import Exam from '@/models/Exam'; // Needed for populate
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        // Count per exam slug inside the DB instead of loading + populating every attempt.
        const rows = await UserTestAttempt.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(auth.user.id), status: 'Completed' } },
            { $group: { _id: '$practiceTest', n: { $sum: 1 } } },
            { $lookup: { from: 'practicetests', localField: '_id', foreignField: '_id', as: 'pt' } },
            { $unwind: '$pt' },
            { $match: { 'pt.isPYQ': true } },
            { $lookup: { from: 'exampatterns', localField: 'pt.examPattern', foreignField: '_id', as: 'pat' } },
            { $unwind: '$pat' },
            { $lookup: { from: 'exams', localField: 'pat.exam', foreignField: '_id', as: 'ex' } },
            { $unwind: '$ex' },
            { $match: { 'ex.slug': { $exists: true, $ne: null } } },
            { $group: { _id: '$ex.slug', count: { $sum: '$n' } } },
        ]);

        // { 'ssc-cgl': 4, 'ssc-chsl': 1 }
        const progressMap = Object.fromEntries(rows.map(r => [r._id, r.count]));

        return NextResponse.json({
            success: true,
            data: progressMap
        });

    } catch (error) {
        console.error('PYQ Progress fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
