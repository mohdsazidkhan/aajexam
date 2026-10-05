import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import { hydrateTestQuestions } from '@/lib/utils/hydrateTestQuestions';
import { protect, admin } from '@/middleware/auth';

// Admin CRUD for one practice test. The test stores its questions as links into the `questions` collection; the PracticeTest
// model hooks do the linking on save/update (an edited question updates its shared document), and GET hands the edit form the
// full question content read from `questions`.
const forbidden = () => NextResponse.json({ message: 'Forbidden' }, { status: 403 });

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return forbidden();
        await dbConnect();
        const { id } = await params;
        const test = await PracticeTest.findById(id).lean();
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
        await hydrateTestQuestions(test);
        return NextResponse.json({ success: true, data: test });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return forbidden();
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const test = await PracticeTest.findByIdAndUpdate(id, body, { new: true });
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: test });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return forbidden();
        await dbConnect();
        const { id } = await params;
        const test = await PracticeTest.findOneAndDelete({ _id: id });
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Test deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
