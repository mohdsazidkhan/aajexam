import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({ status: 'approved' }).lean();
        const data = await Promise.all(categories.map(async (cat) => {
            const subcats = await Subcategory.find({ category: cat._id, status: 'approved' }).limit(5).lean();
            return { ...cat, subcategories: subcats };
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
