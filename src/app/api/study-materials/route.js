import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyMaterial from '@/models/StudyMaterial';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const examType = searchParams.get('examType');
        const resourceType = searchParams.get('resourceType'); // pdf | video

        const query = { isActive: true };
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (examType) query.examType = examType;
        if (resourceType) query.resourceType = resourceType;

        const skip = (page - 1) * limit;

        const [materials, total] = await Promise.all([
            StudyMaterial.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            StudyMaterial.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: materials,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Study Materials API Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch study materials' 
        }, { status: 500 });
    }
}
