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
                message: 'No active landing page content found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('GET /api/public/landing-data error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
