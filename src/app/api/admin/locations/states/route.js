import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import State from '@/models/State';
import { protect, admin } from '@/middleware/auth';

// GET - paginated list of states, optionally filtered by name search.
// Pass a high `limit` (e.g. 1000) to fetch the full list for a dropdown.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search');

        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };

        const skip = (page - 1) * limit;
        const [states, total] = await Promise.all([
            State.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
            State.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: states,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create a new state
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { name } = await req.json();
        if (!name || !name.trim()) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });

        const state = await State.create({ name: name.trim(), isActive: true });
        return NextResponse.json({ success: true, data: state }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This state already exists' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
