import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        // Fetch active levels from the database, sorted by levelNumber
        const levels = await Level.find({ isActive: true })
            .sort({ levelNumber: 1 })
            .select('levelNumber name description quizzesRequired emoji color icon')
            .lean();

        // If DB is empty, provide a basic fallback so the frontend doesn't crash 
        if (!levels || levels.length === 0) {
            return NextResponse.json({
                success: true,
                data: [
                    { _id: '1', name: 'Starter', levelNumber: 0, description: 'Begin your learning journey', quizzesRequired: 0 }
                ]
            });
        }

        return NextResponse.json({ success: true, data: levels });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
