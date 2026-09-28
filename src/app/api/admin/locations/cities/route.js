import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';
import State from '@/models/State';
import { protect, admin } from '@/middleware/auth';

// GET - paginated list of cities, optionally filtered by name search / state
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search');
        const state = searchParams.get('state');

        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };
        if (state) filter.state = state;

        const skip = (page - 1) * limit;
        const [cities, total] = await Promise.all([
            City.find(filter).populate('state', 'name').sort({ name: 1 }).skip(skip).limit(limit).lean(),
            City.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: cities,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create a new city
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { name, state } = await req.json();
        if (!name || !name.trim()) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });
        if (!state) return NextResponse.json({ success: false, message: 'state is required' }, { status: 400 });

        const stateDoc = await State.findById(state);
        if (!stateDoc) return NextResponse.json({ success: false, message: 'Selected state was not found' }, { status: 400 });

        const city = await City.create({ name: name.trim(), state, isActive: true });
        const populated = await city.populate('state', 'name');
        return NextResponse.json({ success: true, data: populated }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This city already exists in the selected state' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
