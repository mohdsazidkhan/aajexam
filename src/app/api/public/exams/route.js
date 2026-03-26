import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 9; // Show 9 per page
        const skip = (page - 1) * limit;

        const totalExams = await Exam.countDocuments({ isActive: true });

        const exams = await Exam.find({ isActive: true })
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
