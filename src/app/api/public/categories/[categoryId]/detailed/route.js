import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { categoryId } = await params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ success: false, message: 'Invalid category ID' }, { status: 400 });
        }

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

        return NextResponse.json({
            success: true,
            data: {
                category,
                subcategories
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
