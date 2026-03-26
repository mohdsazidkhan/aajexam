import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
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
            query = {
                $or: [
                    { name: new RegExp(search.trim(), 'i') },
                    { description: new RegExp(search.trim(), 'i') }
                ]
            };
        }

        const categories = await Category.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const categoryIds = categories.map(cat => cat._id);
        const subcategoryCounts = await Subcategory.aggregate([
            { $match: { category: { $in: categoryIds } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        const subcategoryCountMap = {};
        subcategoryCounts.forEach(sc => { subcategoryCountMap[sc._id.toString()] = sc.count; });

        const categoriesWithCounts = categories.map(cat => ({
            ...cat.toObject(),
            subcategoryCount: subcategoryCountMap[cat._id.toString()] || 0
        }));

        const total = await Category.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            categories: categoriesWithCounts,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin categories error:', error);
        return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || (!admin(auth.user) && !proOnly(auth.user))) {
            return NextResponse.json({ message: 'Pro access required' }, { status: 403 });
        }

        await dbConnect();
        const { name, description } = await req.json();

        if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });

        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCategory) return NextResponse.json({ error: 'Category already exists' }, { status: 400 });

        const isUser = !admin(auth.user);
        const category = new Category({
            name,
            description,
            createdBy: isUser ? auth.user.id : null,
            createdType: isUser ? 'user' : 'admin',
            status: isUser ? 'pending' : 'approved'
        });
        await category.save();

        const message = isUser ? 'Category submitted for admin approval!' : '🎉 Category Created Successfully!';
        return NextResponse.json({ success: true, message, category }, { status: 201 });
    } catch (error) {
        console.error('Admin create category error:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

