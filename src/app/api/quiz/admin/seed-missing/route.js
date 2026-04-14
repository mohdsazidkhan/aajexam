import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';
import { protect, admin } from '@/middleware/auth';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const defaultExam = await Exam.findOne({ isActive: true }).lean();
        if (!defaultExam) return NextResponse.json({ message: 'No active exam found' }, { status: 400 });

        // Read JSON file
        let data;
        try {
            const filePath = join(process.cwd(), 'public', 'all_topics_master_quiz.json');
            const raw = readFileSync(filePath, 'utf-8');
            data = JSON.parse(raw);
        } catch (e) {
            return NextResponse.json({ message: 'Could not read all_topics_master_quiz.json: ' + e.message }, { status: 500 });
        }

        const questions = data.questions || [];
        if (!questions.length) return NextResponse.json({ message: 'No questions in file' }, { status: 400 });

        // Build subject/topic lookups
        const subjects = await Subject.find({ isActive: true }).lean();
        const topics = await Topic.find({ isActive: true }).populate('subject', 'name').lean();
        const subjectMap = {};
        for (const s of subjects) subjectMap[s.name.toLowerCase()] = s;
        const topicMap = {};
        for (const t of topics) topicMap[t.name.toLowerCase()] = t;

        let questionsCreated = 0;
        let quizzesCreated = 0;
        let skipped = 0;

        // Group questions by topic
        const byTopic = {};
        for (const q of questions) {
            const key = (q.topic || '').toLowerCase();
            if (!byTopic[key]) byTopic[key] = [];
            byTopic[key].push(q);
        }

        for (const [topicKey, qs] of Object.entries(byTopic)) {
            const topicObj = topicMap[topicKey];
            if (!topicObj) { skipped += qs.length; continue; }

            const subjectName = qs[0]?.subject || '';
            const subjectObj = subjectMap[subjectName.toLowerCase()] || topicObj.subject;
            const subjectId = subjectObj?._id || topicObj.subject?._id;

            // Check if quiz already exists
            const existing = await Quiz.findOne({ topic: topicObj._id });
            if (existing) { skipped += qs.length; continue; }

            const questionIds = [];
            for (const q of qs) {
                try {
                    const options = (q.answerOptions || []).map(o => ({
                        text: o.text,
                        isCorrect: o.isCorrect === true,
                    }));

                    if (options.length < 2) continue;
                    if (!options.some(o => o.isCorrect)) continue;

                    const created = await Question.create({
                        exam: defaultExam._id,
                        subject: subjectId,
                        topic: topicObj._id,
                        questionText: q.question,
                        options,
                        explanation: q.hint || (q.answerOptions?.find(o => o.isCorrect)?.rationale) || '',
                        difficulty: 'medium',
                        tags: [topicKey, (subjectName || '').toLowerCase()],
                        language: 'en',
                        isActive: true,
                        createdBy: auth.user._id,
                    });
                    questionIds.push(created._id);
                    questionsCreated++;
                } catch (e) {}
            }

            if (questionIds.length < 3) continue;

            // Create quiz
            try {
                await Quiz.create({
                    title: `${topicObj.name} Quiz`,
                    description: `Practice quiz on ${topicObj.name} (${subjectName}). ${questionIds.length} questions.`,
                    exam: defaultExam._id,
                    subject: subjectId,
                    topic: topicObj._id,
                    questions: questionIds,
                    duration: 5,
                    totalMarks: questionIds.length,
                    marksPerQuestion: 1,
                    negativeMarking: 0,
                    difficulty: 'mixed',
                    type: 'topic_practice',
                    tags: [topicKey, (subjectName || '').toLowerCase()],
                    isFree: true,
                    status: 'published',
                    publishedAt: new Date(),
                    createdBy: auth.user._id,
                });
                quizzesCreated++;
            } catch (e) {}
        }

        return NextResponse.json({
            success: true,
            message: `Created ${quizzesCreated} quizzes with ${questionsCreated} questions from JSON file. ${skipped} skipped.`,
            stats: { questionsCreated, quizzesCreated, skipped, totalInFile: questions.length }
        });
    } catch (error) {
        console.error('Seed missing error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
