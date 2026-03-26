import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
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
        const { name, description, image } = body;

        const category = await Category.create({
            name,
            description,
            image,
            createdBy: auth.user._id,
            status: 'pending' // New categories from pro users might need approval
        });

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Pro User category create error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
