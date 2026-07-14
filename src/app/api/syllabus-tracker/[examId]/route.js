import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect } from '@/middleware/auth';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import QuizAttempt from '@/models/QuizAttempt';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        
        await dbConnect();
        
        // Ensure params are properly awaited (Next.js 15+ routing)
        const { examId } = await params;
        const userId = auth.user._id;

        // PRO CHECK
        if (auth.user.subscriptionStatus !== 'PRO' && auth.user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Syllabus Tracker is a PRO feature. Upgrade to unlock structured syllabus tracking!',
                isLocked: true
            });
        }

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return NextResponse.json({ success: false, message: 'Invalid Exam ID' }, { status: 400 });
        }

        const objectIdExam = new mongoose.Types.ObjectId(examId);

        // 1. Fetch Subjects applicable to this exam
        const subjects = await Subject.find({
            exams: objectIdExam,
            isActive: true
        }).sort({ order: 1 }).lean();

        // 2. Fetch Topics applicable to this exam
        const topics = await Topic.find({
            exams: objectIdExam,
            isActive: true
        }).sort({ order: 1 }).lean();

        // 3. Find which topics the user has completed at least one quiz for
        // We aggregate QuizAttempt where status='Completed'
        const completedAttempts = await QuizAttempt.aggregate([
            { $match: { user: userId, status: 'Completed' } },
            { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizDoc' } },
            { $unwind: '$quizDoc' },
            { $group: { _id: '$quizDoc.topic' } }
        ]);

        const completedTopicIds = new Set(completedAttempts.map(t => String(t._id)));

        // 4. Structure the data
        let totalTopicsGlobal = 0;
        let completedTopicsGlobal = 0;

        const syllabus = subjects.map(subject => {
            const subjectTopics = topics.filter(t => String(t.subject) === String(subject._id));
            
            const structuredTopics = subjectTopics.map(topic => {
                const isCompleted = completedTopicIds.has(String(topic._id));
                totalTopicsGlobal++;
                if (isCompleted) completedTopicsGlobal++;
                
                return {
                    _id: topic._id,
                    name: topic.name,
                    slug: topic.slug,
                    isCompleted
                };
            });

            return {
                _id: subject._id,
                name: subject.name,
                icon: subject.icon,
                topics: structuredTopics,
                totalTopics: structuredTopics.length,
                completedTopics: structuredTopics.filter(t => t.isCompleted).length
            };
        });

        const overallProgress = totalTopicsGlobal > 0 
            ? Math.round((completedTopicsGlobal / totalTopicsGlobal) * 100) 
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                syllabus,
                totalTopics: totalTopicsGlobal,
                completedTopics: completedTopicsGlobal,
                overallProgress
            }
        });

    } catch (error) {
        console.error('Syllabus Tracker API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
