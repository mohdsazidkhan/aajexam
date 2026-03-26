import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        
        const subcategories = await Subcategory.find({ createdBy: auth.user._id });

        return NextResponse.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        console.error('Pro User subcategories error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
