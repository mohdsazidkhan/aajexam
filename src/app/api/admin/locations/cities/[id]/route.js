import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';
import State from '@/models/State';
import { protect, admin } from '@/middleware/auth';

// PUT - update city
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const { name, state, isActive } = await req.json();

        const update = {};
        if (name !== undefined) update.name = name.trim();
        if (isActive !== undefined) update.isActive = isActive;
        if (state !== undefined) {
            const stateDoc = await State.findById(state);
            if (!stateDoc) return NextResponse.json({ success: false, message: 'Selected state was not found' }, { status: 400 });
            update.state = state;
        }

        const city = await City.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('state', 'name');
        if (!city) return NextResponse.json({ message: 'City not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: city });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This city already exists in the selected state' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - soft delete (deactivate)
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const city = await City.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!city) return NextResponse.json({ message: 'City not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'City deactivated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
