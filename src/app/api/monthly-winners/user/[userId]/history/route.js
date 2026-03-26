import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlyWinners from '@/models/MonthlyWinners';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required'
            }, { status: 400 });
        }

        const winningHistory = await MonthlyWinners.getUserWinningHistory(userId);

        return NextResponse.json({
            success: true,
            data: winningHistory,
            total: winningHistory.length
        });
    } catch (error) {
        console.error('Error fetching user winning history:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch user winning history',
            error: error.message
        }, { status: 500 });
    }
}
