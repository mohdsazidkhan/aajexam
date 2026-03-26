import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { categoryId } = await params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ success: false, message: 'Invalid category ID' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        // Get category details
        const category = await Category.findById(categoryId)
            .select('name description longDescription educationalValue targetAudience')
            .lean();

        if (!category) {
            return NextResponse.json({
                success: false,
                message: 'Category not found'
            }, { status: 404 });
        }

        // Get subcategories for this category
        const subcategories = await Subcategory.find({ category: categoryId })
            .select('name description')
            .lean();

        // Count quizzes per subcategory
        const quizCounts = await Quiz.aggregate([
            { $match: { category: new mongoose.Types.ObjectId(categoryId), isActive: { $in: [true, undefined] } } },
            { $group: { _id: '$subcategory', quizCount: { $sum: 1 } } }
        ]);
        const subcategoryIdToCount = new Map(quizCounts.map(c => [String(c._id), c.quizCount]));

        // Enhance subcategories with quiz counts
        const enhancedSubcategories = subcategories.map(sub => ({
            ...sub,
            quizCount: subcategoryIdToCount.get(String(sub._id)) || 0
        }));

        // Get quizzes for this category
        const quizzes = await Quiz.find({
            category: categoryId,
            isActive: { $in: [true, undefined] }
        })
            .select('title description subcategory difficulty timeLimit tags educationalDescription createdAt')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Quiz.countDocuments({
            category: categoryId,
            isActive: { $in: [true, undefined] }
        });
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                category,
                subcategories: enhancedSubcategories,
                quizzes,
                pagination: {
                    page: page,
                    limit: limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching category details:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch category details',
            error: error.message
        }, { status: 500 });
    }
}
