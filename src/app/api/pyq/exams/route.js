import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import Exam from '@/models/Exam';

// GET - Exams that have PYQ papers, with paper counts (public).
// Same data the web /pyq page builds server-side for its "Browse PYQs by Exam" grid and exam dropdown.
export async function GET() {
    try {
        await dbConnect();

        const totalPYQs = await PracticeTest.countDocuments({ isPYQ: true, slug: { $exists: true, $ne: null } });

        const allPatternsAgg = await PracticeTest.aggregate([
            { $match: { isPYQ: true, slug: { $exists: true, $ne: null } } },
            { $group: { _id: '$examPattern', count: { $sum: 1 } } },
        ]);
        const patternCountMap = new Map(allPatternsAgg.map((r) => [String(r._id), r.count]));
        const allPatterns = await ExamPattern.find({ _id: { $in: allPatternsAgg.map((r) => r._id) } })
            .select('exam')
            .lean();

        const examIdToCount = new Map();
        allPatterns.forEach((p) => {
            const eid = String(p.exam);
            const cnt = patternCountMap.get(String(p._id)) || 0;
            examIdToCount.set(eid, (examIdToCount.get(eid) || 0) + cnt);
        });

        const examDocs = await Exam.find({
            _id: { $in: Array.from(examIdToCount.keys()) },
            isActive: true,
            slug: { $exists: true, $ne: null },
        }).select('name slug').lean();

        const exams = examDocs
            .map((e) => ({
                _id: String(e._id),
                slug: e.slug,
                name: e.name,
                paperCount: examIdToCount.get(String(e._id)) || 0,
            }))
            .sort((a, b) => b.paperCount - a.paperCount);

        return NextResponse.json({ success: true, data: { exams, totalPYQs } });
    } catch (error) {
        console.error('PYQ exams error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
