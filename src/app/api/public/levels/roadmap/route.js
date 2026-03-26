import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';

export async function GET() {
    try {
        await dbConnect();
        
        const levels = await Level.find({ isActive: true })
            .select('levelNumber name description emoji color quizzesRequired')
            .sort({ levelNumber: 1 });

        const roadmap = levels.map(l => ({
            ...l.toObject(),
            level: l.levelNumber // Mobile parity
        }));

        return NextResponse.json({
            success: true,
            data: roadmap
        });
    } catch (error) {
        console.error('Level roadmap error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
