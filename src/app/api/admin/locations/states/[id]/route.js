import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import State from '@/models/State';
import { protect, admin } from '@/middleware/auth';

// PUT - update state
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const { name, isActive } = await req.json();

        const update = {};
        if (name !== undefined) update.name = name.trim();
        if (isActive !== undefined) update.isActive = isActive;

        const state = await State.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!state) return NextResponse.json({ message: 'State not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: state });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This state already exists' }, { status: 409 });
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
        const state = await State.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!state) return NextResponse.json({ message: 'State not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'State deactivated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
