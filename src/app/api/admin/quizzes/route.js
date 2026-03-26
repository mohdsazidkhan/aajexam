import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const search = searchParams.get('search');

        // Filters logic based on adminController.getFilterQuizQuery
        const filters = {};
        const filterKeys = ['difficulty', 'category', 'subcategory', 'isActive', 'requiredLevel'];
        filterKeys.forEach(key => {
            const val = searchParams.get(key);
            if (val !== null && val !== '') {
                if (val === 'true') filters[key] = true;
                else if (val === 'false') filters[key] = false;
                else if (['level', 'requiredLevel'].includes(key)) filters[key] = Number(val);
                else filters[key] = val;
            }
        });

        let searchQuery = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            searchQuery = { $or: [{ title: regex }, { description: regex }, { tags: regex }] };
        }

        const finalQuery = { ...searchQuery, ...filters };

        const quizzes = await Quiz.find(finalQuery)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const quizIds = quizzes.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        const questionCountMap = {};
        questionCounts.forEach(qc => { questionCountMap[qc._id.toString()] = qc.count; });

        const quizzesWithCounts = quizzes.map(q => ({
            ...q.toObject(),
            questionCount: questionCountMap[q._id.toString()] || 0
        }));

        const total = await Quiz.countDocuments(finalQuery);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            quizzes: quizzesWithCounts,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin quizzes error:', error);
        return NextResponse.json({ error: 'Failed to get quizzes' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();
        const { title } = data;

        const titleWithTimestamp = `${title} - ${Math.floor(Date.now() / 1000)}`;

        const quiz = new Quiz({
            ...data,
            title: titleWithTimestamp,
            difficulty: data.difficulty || 'beginner',
            requiredLevel: data.requiredLevel || 1,
            recommendedLevel: data.recommendedLevel || 1,
            levelRange: data.levelRange || { min: 0, max: 10 },
            tags: data.tags || [],
            isActive: data.isActive !== undefined ? data.isActive : true
        });

        await quiz.save();
        return NextResponse.json({ success: true, message: '🎉 Level-based Quiz Created Successfully!', quiz }, { status: 201 });
    } catch (error) {
        console.error('Admin create quiz error:', error);
        return NextResponse.json({ error: 'Failed to create quiz', details: error.message }, { status: 500 });
    }
}
