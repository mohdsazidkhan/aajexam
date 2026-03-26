import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomePage from '@/models/HomePage';

export async function GET() {
    try {
        await dbConnect();
        const content = await HomePage.findOne({ isActive: true }).sort({ version: -1 });

        const defaultData = {
            platformPurpose: "AajExam is India's premier online platform for government exam preparation...",
            targetAudience: "Our platform is designed for students and professionals preparing for SSC, UPSC, Banking...",
            educationalBenefits: "Regular practice through our quiz platform offers numerous educational benefits...",
            learningMethodology: "AajExam employs a unique 10-level progression system...",
            keyFeatures: [
                { title: 'Level-Based Progression', description: '10 carefully designed levels...', icon: 'level' },
                { title: 'Comprehensive Coverage', description: 'Quizzes covering all major government exam patterns...', icon: 'coverage' }
            ],
            successStories: [],
            isActive: true,
            version: 1
        };

        return NextResponse.json({ success: true, data: content || defaultData });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

