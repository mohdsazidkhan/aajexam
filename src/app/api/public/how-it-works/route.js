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
                title: 'How It Works',
                methodology: content.learningMethodology,
                features: content.keyFeatures
            }
        });
    } catch (error) {
        console.error('GET /api/public/how-it-works error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
