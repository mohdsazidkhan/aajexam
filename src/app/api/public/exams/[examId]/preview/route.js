import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { examId } = await params;

        let query = { isActive: true };
        if (mongoose.Types.ObjectId.isValid(examId)) {
            query._id = examId;
        } else {
            query.code = examId.toUpperCase();
        }

        // Get exam details without questions
        const exam = await Exam.findOne(query)
            .select('name description examDate duration totalMarks passingMarks category instructions syllabus createdAt code')
            .populate('category', 'name description')
            .lean();

        if (!exam) {
            return NextResponse.json({
                success: false,
                message: 'Exam not found'
            }, { status: 404 });
        }

        // Return empty stats for now to prevent crash
        const stats = {
            totalAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            passedCount: 0
        };

        return NextResponse.json({
            success: true,
            data: {
                exam: {
                    ...exam,
                    stats: {
                        totalAttempts: stats.totalAttempts,
                        averageScore: Math.round(stats.averageScore || 0),
                        highestScore: stats.highestScore || 0,
                        passedCount: stats.passedCount,
                        passRate: stats.totalAttempts > 0
                            ? Math.round((stats.passedCount / stats.totalAttempts) * 100)
                            : 0
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching exam preview:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch exam preview',
            error: error.message
        }, { status: 500 });
    }
}
