import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { protect, admin } from '@/middleware/auth';

// GET - list all subjects
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };

        const subjects = await Subject.find(filter).sort({ order: 1, name: 1 });
        return NextResponse.json({ success: true, data: subjects });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create a new subject
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { name, description, icon, order } = await req.json();
        if (!name) return NextResponse.json({ message: 'name is required' }, { status: 400 });

        const subject = await Subject.create({ name, description, icon, order });
        return NextResponse.json({ success: true, data: subject }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This subject already exists' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
