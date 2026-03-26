import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlyWinners from '@/models/MonthlyWinners';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { userId } = await params;

        const history = await MonthlyWinners.find({ 'winners.userId': userId }).sort({ monthYear: -1 });

        return NextResponse.json({ success: true, data: history });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
