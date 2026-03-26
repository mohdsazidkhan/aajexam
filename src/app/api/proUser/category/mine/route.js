import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        
        // Assuming categories can be owned by users or we just filter by creator
        const categories = await Category.find({ createdBy: auth.user._id });

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Pro User categories error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
