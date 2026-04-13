import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Fetch exam + patterns in parallel (matching web SSR logic)
        const [exam, patterns] = await Promise.all([
            Exam.findById(id).populate('category', 'name type').lean(),
            ExamPattern.find({ exam: id })
                .populate('exam', 'name code description')
                .sort({ title: 1 })
                .lean()
        ]);

        if (!exam) {
            return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });
        }

        const patternIds = patterns.map(p => p._id);
        if (!patternIds.length) {
            return NextResponse.json({ success: true, data: [], exam, count: 0 });
        }

        const testCounts = await PracticeTest.aggregate([
            { $match: { examPattern: { $in: patternIds } } },
            { $group: { _id: '$examPattern', total: { $sum: 1 } } }
        ]);

        const testMap = Object.fromEntries(testCounts.map(i => [i._id.toString(), i.total]));

        const data = patterns.map(p => ({
            ...p,
            testCount: testMap[p._id.toString()] || 0
        }));

        return NextResponse.json({ success: true, data, exam, count: data.length });
    } catch (error) {
        console.error('Error fetching patterns:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
