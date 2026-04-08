import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query = {};
        if (category) {
            query.category = category;
        }

        const subs = await Subcategory.find(query).populate('category', 'name');

        if (!subs || subs.length === 0) {
            return NextResponse.json([]);
        }

        return NextResponse.json(subs);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch subcategories' }, { status: 500 });
    }
}
