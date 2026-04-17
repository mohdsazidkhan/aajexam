import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';
import { protect, admin } from '@/middleware/auth';

// GET - Admin list
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const [affairs, total] = await Promise.all([
            CurrentAffair.find().sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
            CurrentAffair.countDocuments()
        ]);

        return NextResponse.json({ success: true, data: affairs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Create
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const body = await req.json();
        body.createdBy = auth.user._id;

        const affair = await CurrentAffair.create(body);
        return NextResponse.json({ success: true, data: affair }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
