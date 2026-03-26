import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const exam = await Exam.findById(id).populate('category', 'name type').lean();
        if (!exam) return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: exam });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        if (body.code) body.code = body.code.toUpperCase();
        const exam = await Exam.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!exam) return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: exam });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { id } = await params;

        // Find exam first
        const exam = await Exam.findById(id);
        if (!exam) return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });

        // Delete associated patterns and tests first
        const patterns = await ExamPattern.find({ exam: id });
        const patternIds = patterns.map(p => p._id);

        await Promise.all([
            PracticeTest.deleteMany({ examPattern: { $in: patternIds } }),
            ExamPattern.deleteMany({ exam: id }),
            Exam.findByIdAndDelete(id)
        ]);

        return NextResponse.json({ success: true, message: 'Exam and all associated data deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
