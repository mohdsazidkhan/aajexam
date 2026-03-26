import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';

        const limitNum = Math.min(limitParam, 100);
        const skip = (page - 1) * limitNum;

        const filter = { status: 'approved' };

        if (search && search.trim()) {
            const searchTerm = search.trim();

            const matchingUsers = await User.find({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');

            const matchingUserIds = matchingUsers.map(u => u._id);

            const searchConditions = [
                { questionText: { $regex: searchTerm, $options: 'i' } },
                { options: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
            ];

            if (matchingUserIds.length > 0) {
                searchConditions.push({ userId: { $in: matchingUserIds } });
            }

            filter.$or = searchConditions;
        }

        const [items, total] = await Promise.all([
            UserQuestions.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .select('questionText options correctOptionIndex viewsCount likesCount sharesCount createdAt userId answers')
                .populate('userId', 'name username profilePicture level.levelName'),
            UserQuestions.countDocuments(filter)
        ]);

        let viewerId = null;
        try {
            const auth = await protect(req);
            if (auth.authenticated && auth.user) {
                viewerId = auth.user._id || auth.user.id;
            }
        } catch (e) {
            // Ignore auth errors for public routes
        }

        const data = items.map(doc => {
            let selectedOptionIndex = null;
            if (viewerId && Array.isArray(doc.answers) && doc.answers.length) {
                const found = doc.answers.find(a => String(a.userId) === String(viewerId));
                if (found) selectedOptionIndex = found.selectedOptionIndex;
            }
            return {
                _id: doc._id,
                questionText: doc.questionText,
                options: doc.options,
                correctAnswer: doc.correctOptionIndex,
                viewsCount: doc.viewsCount,
                likesCount: doc.likesCount,
                sharesCount: doc.sharesCount,
                answersCount: doc.answers ? doc.answers.length : 0,
                createdAt: doc.createdAt,
                userId: doc.userId,
                selectedOptionIndex
            };
        });

        return NextResponse.json({
            success: true,
            data,
            pagination: { page, limit: limitNum, total, totalPages: Math.max(1, Math.ceil(total / limitNum)) }
        });
    } catch (err) {
        console.error('listPublicQuestions error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
