import { escapeRegex } from '@/lib/utils/pagination';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 1000);
        const skip = (page - 1) * limit;

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const filter = { isActive: true, actualExam: { $ne: false } };
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            filter.$or = [{ name: rx }, { code: rx }];
        }

        const totalExams = await Exam.countDocuments(filter);

        const exams = await Exam.find(filter)
            .populate('category', 'name')
            .select('name code logo description')
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                exams,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalExams / limit),
                    totalExams,
                    limit,
                    hasMore: page * limit < totalExams
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
