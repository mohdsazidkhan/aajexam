import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomePage from '@/models/HomePage';

export async function GET() {
    try {
        await dbConnect();
        const content = await HomePage.getActiveContent();
        
        if (!content) {
            return NextResponse.json({ 
                success: false, 
                message: 'Content not found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                title: 'About Subg Quiz',
                purpose: content.platformPurpose,
                audience: content.targetAudience,
                benefits: content.educationalBenefits,
                methodology: content.learningMethodology,
                successStories: content.successStories
            }
        });
    } catch (error) {
        console.error('GET /api/public/about-us error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
