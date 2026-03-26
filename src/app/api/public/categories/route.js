import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({});
        return NextResponse.json({ success: true, data: categories });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Failed to fetch categories', error: err.message }, { status: 500 });
    }
}
