import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Exam from '@/models/Exam';
import { parseExamIds } from '@/lib/utils/targetExams';
import { parsePaging, escapeRegex } from '@/lib/utils/pagination';

// GET - public: list published quizzes with filters
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const exam = searchParams.get('exam');
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const type = searchParams.get('type');
        const difficulty = searchParams.get('difficulty');
        const { page, limit, search } = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 20 });

        const filter = { status: 'published' };
        const examIds = parseExamIds(searchParams.get('examIds'));
        if (exam) filter.applicableExams = exam;
        else if (examIds.length) filter.applicableExams = { $in: examIds };
        if (subject) filter.subject = subject;
        if (topic) filter.topic = topic;
        if (type) filter.type = type;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            // title, or the quiz's subject / topic name
            const rx = new RegExp(escapeRegex(search), 'i');
            const [subjIds, topicIds] = await Promise.all([
                Subject.find({ name: rx }).select('_id').limit(100).lean(),
                Topic.find({ name: rx }).select('_id').limit(200).lean(),
            ]);
            filter.$or = [
                { title: rx },
                ...(subjIds.length ? [{ subject: { $in: subjIds.map(x => x._id) } }] : []),
                ...(topicIds.length ? [{ topic: { $in: topicIds.map(x => x._id) } }] : []),
            ];
        }

        let [quizzes, total] = await Promise.all([
            Quiz.find(filter)
                .populate('applicableExams', 'name code')
                .populate('subject', 'name')
                .populate('topic', 'name')
                .sort({ publishedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Quiz.countDocuments(filter)
        ]);

        quizzes = quizzes.map(q => {
             const totalQuestions = q.questions ? q.questions.length : 0;
             delete q.questions;
             return { ...q, totalQuestions };
        });

        return NextResponse.json({
            success: true,
            data: quizzes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
