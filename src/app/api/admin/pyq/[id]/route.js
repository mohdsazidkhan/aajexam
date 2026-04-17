import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

// GET - Single PYQ detail
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { id } = await params;
        const test = await PracticeTest.findOne({ _id: id, isPYQ: true })
            .populate({ path: 'examPattern', populate: { path: 'exam', select: 'name code' } });

        if (!test) return NextResponse.json({ message: 'PYQ not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: test });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Update PYQ
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const test = await PracticeTest.findOneAndUpdate({ _id: id, isPYQ: true }, body, { new: true });
        if (!test) return NextResponse.json({ message: 'PYQ not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: test });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Delete PYQ
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { id } = await params;
        const test = await PracticeTest.findOneAndDelete({ _id: id, isPYQ: true });
        if (!test) return NextResponse.json({ message: 'PYQ not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'PYQ deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
