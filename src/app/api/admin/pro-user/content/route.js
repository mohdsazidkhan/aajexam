import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'category'; // category, subcategory
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const filter = { createdType: 'user', status: 'pending' };
        let items = [], total = 0;

        if (type === 'category') {
            [items, total] = await Promise.all([
                Category.find(filter).populate('createdBy', 'name email').sort({ createdAt: 1 }).skip(skip).limit(limit),
                Category.countDocuments(filter)
            ]);
        } else if (type === 'subcategory') {
            [items, total] = await Promise.all([
                Subcategory.find(filter).populate('createdBy', 'name email').populate('category', 'name').sort({ createdAt: 1 }).skip(skip).limit(limit),
                Subcategory.countDocuments(filter)
            ]);
        }

        return NextResponse.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
