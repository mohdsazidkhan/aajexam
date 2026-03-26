import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { protect, proOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const userId = auth.user.id;

        const [categories, myCategories] = await Promise.all([
            Category.find({
                $or: [
                    { createdType: 'admin' },
                    { createdType: 'user', status: 'approved' },
                    { createdType: { $exists: false }, status: 'approved' },
                    { createdType: { $exists: false }, status: { $exists: false } }
                ]
            }).select('name description createdType').sort({ name: 1 }),
            Category.find({
                createdBy: userId,
                createdType: 'user',
                status: { $in: ['pending', 'approved'] }
            }).select('name description status')
        ]);

        return NextResponse.json({
            success: true,
            data: {
                allCategories: categories,
                myCategories
            }
        });
    } catch (error) {
        console.error('getApprovedCategories error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
