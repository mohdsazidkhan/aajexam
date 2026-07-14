import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';
import Topic from '@/models/Topic';
import QuizAttempt from '@/models/QuizAttempt';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';

// Helper to shuffle array
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        
        await dbConnect();
        
        const user = auth.user;
        const body = await req.json();
        const { topicId } = body;

        // PRO CHECK
        if (user.subscriptionStatus !== 'PRO' && user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Adaptive Practice is a PRO feature. Upgrade to unlock AI-driven personalized learning!',
                isLocked: true
            });
        }

        if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
            return NextResponse.json({ success: false, message: 'Invalid Topic ID' }, { status: 400 });
        }

        const objectIdTopic = new mongoose.Types.ObjectId(topicId);
        const topic = await Topic.findById(objectIdTopic).populate('subject');
        
        if (!topic) {
            return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
        }

        // 1. Calculate historical accuracy for this topic
        const pastAttempts = await QuizAttempt.aggregate([
            { $match: { user: user._id, status: 'Completed' } },
            { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizDoc' } },
            { $unwind: '$quizDoc' },
            { $match: { 'quizDoc.topic': objectIdTopic } }
        ]);

        let totalCorrect = 0;
        let totalQuestionsAttempted = 0;

        pastAttempts.forEach(attempt => {
            totalCorrect += (attempt.correctCount || 0);
            totalQuestionsAttempted += ((attempt.correctCount || 0) + (attempt.wrongCount || 0) + (attempt.skippedCount || 0));
        });

        // Default to Beginner if no history
        const accuracy = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) : 0;
        
        // 2. Determine ideal difficulty distribution for 10 questions
        let idealCounts = { easy: 7, medium: 3, hard: 0 }; // Beginner
        
        if (accuracy >= 0.75) { // Advanced
            idealCounts = { easy: 1, medium: 4, hard: 5 };
        } else if (accuracy >= 0.40) { // Intermediate
            idealCounts = { easy: 2, medium: 5, hard: 3 };
        }

        // 3. Fetch available questions
        const availableQuestions = await Question.find({ 
            topic: objectIdTopic, 
            isActive: true 
        }, '_id difficulty').lean();

        if (availableQuestions.length === 0) {
            return NextResponse.json({ success: false, message: 'No questions available for this topic yet.' }, { status: 404 });
        }

        // Group by difficulty
        const pool = { easy: [], medium: [], hard: [] };
        availableQuestions.forEach(q => {
            const diff = q.difficulty || 'medium';
            if (pool[diff]) pool[diff].push(q._id);
            else pool.medium.push(q._id);
        });

        // Shuffle pools
        pool.easy = shuffleArray(pool.easy);
        pool.medium = shuffleArray(pool.medium);
        pool.hard = shuffleArray(pool.hard);

        // 4. Select questions
        let selectedQuestions = [];
        
        // Helper to pick n questions from a pool, spilling over if not enough
        const pickQuestions = (targetCount, primaryPool, secondaryPool, tertiaryPool) => {
            let picked = [];
            while (picked.length < targetCount && primaryPool.length > 0) {
                picked.push(primaryPool.pop());
            }
            while (picked.length < targetCount && secondaryPool.length > 0) {
                picked.push(secondaryPool.pop());
            }
            while (picked.length < targetCount && tertiaryPool.length > 0) {
                picked.push(tertiaryPool.pop());
            }
            return picked;
        };

        selectedQuestions.push(...pickQuestions(idealCounts.easy, pool.easy, pool.medium, pool.hard));
        selectedQuestions.push(...pickQuestions(idealCounts.medium, pool.medium, pool.easy, pool.hard));
        selectedQuestions.push(...pickQuestions(idealCounts.hard, pool.hard, pool.medium, pool.easy));

        // Shuffle final selection so difficulties are mixed during the test
        selectedQuestions = shuffleArray(selectedQuestions);
        
        // Ensure we don't exceed what's available
        selectedQuestions = selectedQuestions.slice(0, 10);

        if (selectedQuestions.length === 0) {
            return NextResponse.json({ success: false, message: 'Failed to generate questions.' }, { status: 500 });
        }

        // 5. Create a dynamically generated Quiz document
        // We set accessLevel to FREE because we already checked PRO status above, 
        // and we want AttemptQuizPage to just load it without issues.
        const adaptiveQuiz = await Quiz.create({
            title: `Adaptive Practice: ${topic.name}`,
            slug: `adaptive-${user._id}-${Date.now()}`,
            description: `Auto-generated adaptive session based on your past performance (${Math.round(accuracy * 100)}% historic accuracy).`,
            applicableExams: topic.exams && topic.exams.length > 0 ? [topic.exams[0]] : [],
            subject: topic.subject,
            topic: topic._id,
            questions: selectedQuestions,
            duration: selectedQuestions.length * 1, // 1 min per question
            totalMarks: selectedQuestions.length,
            marksPerQuestion: 1,
            negativeMarking: 0.25,
            difficulty: 'mixed',
            type: 'topic_practice',
            tags: ['adaptive', topic.slug],
            accessLevel: 'FREE',
            status: 'published',
            publishedAt: new Date(),
            createdBy: user._id // The user essentially "creates" their own adaptive session
        });

        // Create the attempt immediately so they don't have to click "Start" again
        const attempt = await QuizAttempt.create({
            user: user._id,
            quiz: adaptiveQuiz._id,
            totalMarks: adaptiveQuiz.totalMarks,
            answers: selectedQuestions.map(q => ({ question: q, selectedOptionIndex: -1, isCorrect: false, timeTaken: 0 }))
        });

        return NextResponse.json({ 
            success: true, 
            data: { 
                quizId: adaptiveQuiz._id,
                quizSlug: adaptiveQuiz.slug,
                attemptId: attempt._id
            } 
        });

    } catch (error) {
        console.error('Adaptive Practice API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
