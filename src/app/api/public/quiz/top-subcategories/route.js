import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';

export async function GET() {
    try {
        await dbConnect();
        const subcats = await Subcategory.find({ isActive: true }).populate('category', 'name').sort({ attemptsCount: -1 }).limit(12).lean();
        return NextResponse.json({ success: true, data: subcats });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
