import { NextResponse } from 'next/server';
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

        // Fetch all completed test attempts for the user
        // Populate the chain to reach the Exam's slug
        const attempts = await UserTestAttempt.find({ user: auth.user.id, status: 'Completed' })
            .populate({
                path: 'practiceTest',
                match: { isPYQ: true }, // Only keep attempts that are PYQs
                select: 'examPattern',
                populate: {
                    path: 'examPattern',
                    select: 'exam',
                    populate: {
                        path: 'exam',
                        select: 'slug'
                    }
                }
            })
            .lean();

        // Calculate progress mapping: { 'ssc-cgl': 4, 'ssc-chsl': 1 }
        const progressMap = {};
        
        attempts.forEach(att => {
            if (
                att.practiceTest && 
                att.practiceTest.examPattern && 
                att.practiceTest.examPattern.exam && 
                att.practiceTest.examPattern.exam.slug
            ) {
                const slug = att.practiceTest.examPattern.exam.slug;
                if (!progressMap[slug]) progressMap[slug] = 0;
                progressMap[slug]++;
            }
        });

        return NextResponse.json({
            success: true,
            data: progressMap
        });

    } catch (error) {
        console.error('PYQ Progress fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
