import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import { protect, admin, proOnly } from '@/middleware/auth';

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

        let query = {};
        if (search && search.trim()) {
            query = { name: new RegExp(search.trim(), 'i') };
        }

        const subcategories = await Subcategory.find(query)
            .populate('category', 'name')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const subcategoryIds = subcategories.map(sc => sc._id);
        const quizCounts = await Quiz.aggregate([
            { $match: { subcategory: { $in: subcategoryIds } } },
            { $group: { _id: '$subcategory', count: { $sum: 1 } } }
        ]);
        const quizCountMap = {};
        quizCounts.forEach(qc => { quizCountMap[qc._id.toString()] = qc.count; });

        const subcategoriesWithCounts = subcategories.map(sc => ({
            ...sc.toObject(),
            quizCount: quizCountMap[sc._id.toString()] || 0
        }));

        const total = await Subcategory.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            subcategories: subcategoriesWithCounts,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin subcategories error:', error);
        return NextResponse.json({ error: 'Failed to get subcategories' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || (!admin(auth.user) && !proOnly(auth.user))) {
            return NextResponse.json({ message: 'Pro access required' }, { status: 403 });
        }

        await dbConnect();
        const { name, category, description } = await req.json();

        if (!name || !category) return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });

        const isUser = !admin(auth.user);
        const subcategory = new Subcategory({
            name,
            category,
            description,
            createdBy: isUser ? auth.user.id : null,
            createdType: isUser ? 'user' : 'admin',
            status: isUser ? 'pending' : 'approved'
        });
        await subcategory.save();

        const message = isUser ? 'Subcategory submitted for admin approval!' : '🎉 Subcategory Created Successfully!';
        return NextResponse.json({ success: true, message, subcategory }, { status: 201 });
    } catch (error) {
        console.error('Admin create subcategory error:', error);
        return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
    }
}

