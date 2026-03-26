import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('category');
        
        const filter = { isActive: true };
        if (categoryId) filter.categoryId = categoryId;

        const subcategories = await Subcategory.find(filter)
            .sort({ name: 1 })
            .populate('categoryId', 'name')
            .lean();

        return NextResponse.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        console.error('GET /api/public/quiz/subcategories error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
