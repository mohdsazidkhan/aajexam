import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomePage from '@/models/HomePage';
import { protect, adminOnly } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();

        await HomePage.updateMany({}, { isActive: false });

        const newContent = new HomePage({
            ...data,
            isActive: true,
            version: Date.now(),
            createdBy: auth.user.id,
            updatedBy: auth.user.id
        });

        await newContent.save();

        return NextResponse.json({ success: true, message: 'Updated', data: newContent });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
