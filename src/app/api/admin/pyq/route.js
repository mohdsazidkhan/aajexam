import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

// GET - Admin list all PYQs
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const [tests, total] = await Promise.all([
            PracticeTest.find({ isPYQ: true })
                .populate({ path: 'examPattern', populate: { path: 'exam', select: 'name code' } })
                .sort({ pyqYear: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            PracticeTest.countDocuments({ isPYQ: true })
        ]);

        return NextResponse.json({
            success: true,
            data: tests,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Create new PYQ test
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const body = await req.json();

        const pyqTest = new PracticeTest({
            ...body,
            isPYQ: true,
            pyqYear: body.pyqYear,
            pyqShift: body.pyqShift || null,
            pyqExamName: body.pyqExamName || null
        });

        await pyqTest.save();
        return NextResponse.json({ success: true, data: pyqTest }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
