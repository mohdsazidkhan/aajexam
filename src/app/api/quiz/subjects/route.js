import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';

// GET - public: list active subjects
export async function GET() {
    try {
        await dbConnect();

        const subjects = await Subject.find({ isActive: true })
            .select('name description icon order')
            .sort({ order: 1, name: 1 });

        return NextResponse.json({ success: true, data: subjects });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
