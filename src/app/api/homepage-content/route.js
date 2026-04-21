import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomePage from '@/models/HomePage';

export async function GET() {
    try {
        await dbConnect();
        const content = await HomePage.getActiveContent();

        if (!content) {
            return NextResponse.json({
                success: true,
                data: {
                    platformPurpose: "AajExam is India's premier online platform for government exam preparation...",
                    targetAudience: "Our platform is designed for students and professionals preparing for SSC, UPSC, Banking...",
                    educationalBenefits: "Regular practice through our exam platform offers numerous educational benefits...",
                    learningMethodology: "AajExam employs a structured preparation methodology...",
                    keyFeatures: [
                        { title: 'Exam Preparation', description: 'Structured preparation for all major government exams...', icon: 'exam' },
                        { title: 'Comprehensive Coverage', description: 'Tests covering all major government exam patterns...', icon: 'coverage' },
                        { title: 'Performance Analytics', description: 'Detailed insights into your strengths and weaknesses...', icon: 'analytics' },
                        { title: 'Refer & Earn', description: 'Invite friends and earn cash rewards when they upgrade to PRO.', icon: 'rewards' }
                    ],
                    successStories: [],
                    isActive: true,
                    version: 1
                }
            });
        }

        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

