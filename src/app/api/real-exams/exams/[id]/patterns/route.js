import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const patterns = await ExamPattern.find({ exam: id })
            .populate('exam', 'name code')
            .sort({ title: 1 })
            .lean();

        const patternIds = patterns.map(p => p._id);
        if (!patternIds.length) return NextResponse.json({ success: true, data: [], count: 0 });

        const testCounts = await PracticeTest.aggregate([
            { $match: { examPattern: { $in: patternIds } } },
            { $group: { _id: '$examPattern', total: { $sum: 1 } } }
        ]);

        const testMap = Object.fromEntries(testCounts.map(i => [i._id.toString(), i.total]));

        const data = patterns.map(p => ({
            ...p,
            testCount: testMap[p._id.toString()] || 0
        }));

        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
