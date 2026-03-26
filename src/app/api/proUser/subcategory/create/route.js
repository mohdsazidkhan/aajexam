import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import { protect, proOnly } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        if (!proOnly(auth.user)) {
            return NextResponse.json({ message: 'Pro subscription required' }, { status: 403 });
        }

        await dbConnect();
        const body = await req.json();
        const { name, description, category, image } = body;

        const subcategory = await Subcategory.create({
            name,
            description,
            category,
            image,
            createdBy: auth.user._id,
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            data: subcategory
        });
    } catch (error) {
        console.error('Pro User subcategory create error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
