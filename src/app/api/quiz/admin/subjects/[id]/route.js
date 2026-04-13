import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { protect, admin } from '@/middleware/auth';

// GET - single subject
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const subject = await Subject.findById(id).populate('exam', 'name code');
        if (!subject) return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: subject });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - update subject
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const body = await req.json();
        const subject = await Subject.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!subject) return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: subject });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'Duplicate subject name for this exam' }, { status: 409 });
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
        const subject = await Subject.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!subject) return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Subject deactivated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
