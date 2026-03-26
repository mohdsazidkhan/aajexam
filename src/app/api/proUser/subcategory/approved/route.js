import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const authResult = await protect(req);
        if (!authResult.authenticated) {
            return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
        }
        const userId = authResult.user.id;

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ message: 'Valid category ID required' }, { status: 400 });
        }

        const subcategories = await Subcategory.find({
            category: categoryId,
            $or: [
                { createdType: 'admin' },
                { createdType: 'user', status: 'approved' },
                { createdType: { $exists: false }, status: 'approved' },
                { createdType: { $exists: false }, status: { $exists: false } }
            ]
        }).select('name description createdType').sort({ name: 1 });

        const mySubcategories = await Subcategory.find({
            category: categoryId,
            createdBy: userId,
            createdType: 'user',
            status: { $in: ['pending', 'approved'] }
        }).select('name description status');

        return NextResponse.json({
            success: true,
            data: {
                allSubcategories: subcategories,
                mySubcategories: mySubcategories
            }
        });
    } catch (error) {
        console.error('getApprovedSubcategories error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
