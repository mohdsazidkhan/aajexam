import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const defaultExam = await Exam.findOne({ isActive: true }).lean();
        if (!defaultExam) return NextResponse.json({ message: 'No active exam found' }, { status: 400 });

        const subjects = await Subject.find({ isActive: true }).lean();
        const topics = await Topic.find({ isActive: true }).populate('subject', 'name').lean();
        if (!topics.length) return NextResponse.json({ message: 'No topics found.' }, { status: 400 });

        // Load ALL PT questions flat
        const allPTs = await PracticeTest.find({}).select('questions').lean();
        const allQ = [];
        for (const pt of allPTs) {
            for (const q of (pt.questions || [])) allQ.push(q);
        }

        // For each topic, find matching questions using CONTAINS logic
        // Match against: section, tags, questionText - any contains topic name or subject name
        let questionsCreated = 0;
        let quizzesCreated = 0;
        let skipped = 0;

        for (const topic of topics) {
            const subjectName = topic.subject?.name || '';
            const topicName = topic.name;
            const subjectId = topic.subject?._id;

            const existingCount = await Quiz.countDocuments({ topic: topic._id });

            // Build search keywords from topic name
            const topicLower = topicName.toLowerCase();
            const topicWords = topicLower.split(/[\s&,/()]+/).filter(w => w.length > 2);

            // Build search keywords from subject name
            const subjectLower = subjectName.toLowerCase();
            const subjectWords = subjectLower.split(/[\s&,/()]+/).filter(w => w.length > 2);

            // Find matching questions - CONTAINS match
            const seen = new Set();
            const matched = [];

            for (const q of allQ) {
                const section = (q.section || '').toLowerCase();
                const tags = (q.tags || []).map(t => t.toLowerCase()).join(' ');
                const text = (q.questionText || '').toLowerCase();
                const allText = section + ' ' + tags + ' ' + text;

                // Check if question contains topic keywords
                let topicMatch = false;

                // Full topic name contains
                if (allText.includes(topicLower)) {
                    topicMatch = true;
                }

                // Individual topic words (at least 1 word match in tags/section + in same subject area)
                if (!topicMatch) {
                    const wordMatch = topicWords.some(w => tags.includes(w) || section.includes(w));
                    const subMatch = subjectWords.some(w => section.includes(w));
                    if (wordMatch && subMatch) topicMatch = true;
                }

                // Topic word in questionText + subject in section
                if (!topicMatch) {
                    const wordInText = topicWords.some(w => text.includes(w));
                    const subInSection = subjectWords.some(w => section.includes(w));
                    if (wordInText && subInSection) topicMatch = true;
                }

                if (topicMatch && !seen.has(q.questionText)) {
                    seen.add(q.questionText);
                    matched.push(q);
                }
            }

            // Calculate quizzes
            const maxQuizzes = Math.floor(matched.length / 5);
            const targetQuizzes = Math.min(maxQuizzes, 10);
            const newQuizzes = Math.max(0, targetQuizzes - existingCount);

            if (newQuizzes === 0 || matched.length < 5) { skipped++; continue; }

            const shuffled = matched.sort(() => Math.random() - 0.5);

            for (let i = 0; i < newQuizzes; i++) {
                const batch = shuffled.slice(i * 5, (i + 1) * 5);
                if (batch.length < 5) break;

                const questionIds = [];
                for (const ptQ of batch) {
                    try {
                        const options = (ptQ.options || []).map((optText, idx) => ({
                            text: typeof optText === 'string' ? optText : String(optText),
                            isCorrect: idx === ptQ.correctAnswerIndex,
                        }));
                        const q = await Question.create({
                            exam: defaultExam._id,
                            subject: subjectId,
                            topic: topic._id,
                            questionText: ptQ.questionText,
                            options,
                            explanation: ptQ.explanation || '',
                            difficulty: ptQ.difficulty || 'medium',
                            tags: [topicName.toLowerCase(), subjectName.toLowerCase(), ...(ptQ.tags || []).map(t => t.toLowerCase())],
                            language: 'en',
                            isActive: true,
                            createdBy: auth.user._id,
                        });
                        questionIds.push(q._id);
                        questionsCreated++;
                    } catch (e) {}
                }

                if (questionIds.length < 5) continue;

                const quizNum = existingCount + i + 1;
                const title = quizNum === 1 ? `${topicName} Quiz` : `${topicName} Quiz ${quizNum}`;

                try {
                    await Quiz.create({
                        title,
                        description: `Practice quiz on ${topicName} (${subjectName}). ${questionIds.length} real exam questions.`,
                        exam: defaultExam._id,
                        subject: subjectId,
                        topic: topic._id,
                        questions: questionIds,
                        duration: 5,
                        totalMarks: questionIds.length,
                        marksPerQuestion: 1,
                        negativeMarking: 0,
                        difficulty: 'mixed',
                        type: 'topic_practice',
                        tags: [topicName.toLowerCase(), subjectName.toLowerCase()],
                        isFree: true,
                        status: 'published',
                        publishedAt: new Date(),
                        createdBy: auth.user._id,
                    });
                    quizzesCreated++;
                } catch (e) {}
            }
        }

        return NextResponse.json({
            success: true,
            message: `Created ${quizzesCreated} quizzes with ${questionsCreated} questions. ${skipped} topics skipped.`,
            stats: { totalTopics: topics.length, quizzesCreated, questionsCreated, skipped }
        });
    } catch (error) {
        console.error('Seed quizzes error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
