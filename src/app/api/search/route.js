import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Article from '@/models/Article';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import Question from '@/models/Question';
import { protect } from '@/middleware/auth';
export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const regex = new RegExp(query, 'i');

        const [user, attemptedQuizIds] = await Promise.all([
            User.findById(auth.user.id),
            QuizAttempt.find({ user: auth.user.id }).distinct('quiz')
        ]);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const currentLevel = user.monthlyProgress?.currentLevel || 0;
        const targetLevel = currentLevel === 10 ? 10 : currentLevel + 1;
        const levelAccess = user.canAccessLevel ? user.canAccessLevel(targetLevel) : { canAccess: true, accessibleLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };

        // categories, subcategories, articles, users
        const [categories, subcategories, articles, users] = await Promise.all([
            Category.find({ $or: [{ name: regex }, { description: regex }] }).select('_id name description').lean(),
            Subcategory.find({ $or: [{ name: regex }, { description: regex }] }).populate('category', 'name').select('_id name category description').lean(),
            Article.find({ status: 'published', $or: [{ title: regex }, { content: regex }, { excerpt: regex }, { tags: { $in: [regex] } }] }).populate('category', 'name').populate('author', 'name').select('_id title excerpt slug featuredImage category author publishedAt').sort({ publishedAt: -1 }).lean(),
            User.find({ $or: [{ name: regex }, { username: regex }, { email: regex }] }).select('_id name username profilePicture level').lean()
        ]);

        // govt exams
        const [govtExamCategories, govtExams, examPatterns, practiceTests] = await Promise.all([
            ExamCategory.find({ $or: [{ name: regex }, { description: regex }] }).lean(),
            Exam.find({ isActive: true, $or: [{ name: regex }, { code: regex }] }).populate('category', 'name').lean(),
            ExamPattern.find({ $or: [{ title: regex }] }).populate('exam', 'name').lean(),
            PracticeTest.find({ $or: [{ title: regex }] }).populate('examPattern', 'title').lean()
        ]);

        const quizFilter = {
            isActive: true,
            requiredLevel: targetLevel,
            _id: { $nin: attemptedQuizIds },
            $or: [{ title: regex }, { description: regex }, { category: { $in: categories.map(c => c._id) } }, { subcategory: { $in: subcategories.map(s => s._id) } }]
        };

        const [allQuizzes, quizCount] = await Promise.all([
            Quiz.find(quizFilter).populate('category', 'name').populate('subcategory', 'name').select('_id title category subcategory requiredLevel timeLimit').lean(),
            Quiz.countDocuments(quizFilter)
        ]);

        const shuffled = allQuizzes.sort(() => Math.random() - 0.5).slice(skip, skip + limit);

        // Count questions for each quiz in the result set
        const quizIds = shuffled.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        const countMap = Object.fromEntries(questionCounts.map(q => [q._id.toString(), q.count]));

        return NextResponse.json({
            success: true,
            currentLevel,
            userLevel: { currentLevel, levelName: user.monthlyProgress?.levelName, progress: user.monthlyProgress?.levelProgress },
            levelAccess: { accessibleLevels: levelAccess.accessibleLevels, userPlan: user.subscriptionStatus },
            page, limit, totalQuizzes: quizCount,
            categories: categories.map(c => ({ ...c, type: 'category' })),
            subcategories: subcategories.map(s => ({ ...s, type: 'subcategory' })),
            quizzes: shuffled.map(q => ({ ...q, type: 'quiz', questionsCount: countMap[q._id.toString()] || 0 })),
            blogs: articles.map(a => ({ ...a, type: 'blog' })),
            users: users.map(u => ({ ...u, type: 'user' })),
            govtExamCategories: govtExamCategories.map(c => ({ ...c, type: 'examCategory' })),
            govtExams: govtExams.map(e => ({ ...e, type: 'exam' })),
            examPatterns: examPatterns.map(p => ({ ...p, type: 'pattern' })),
            practiceTests: practiceTests.map(t => ({ ...t, type: 'test' }))
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
