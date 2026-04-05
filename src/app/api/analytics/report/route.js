import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const userId = auth.user.id;
        
        // Fetch only the performanceMetrics and primaryTargetExam fields for maximum speed
        const user = await User.findById(userId)
            .select('performanceMetrics primaryTargetExam name dailyProgress weeklyProgress monthlyProgress')
            .lean();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                name: user.name,
                primaryTargetExam: user.primaryTargetExam,
                // New Pre-computed Metrics (The "AajExam" track)
                performanceMetrics: user.performanceMetrics,
                // Legacy Progress (The "Reward" track) - kept for backward compatibility
                legacyProgress: {
                    daily: user.dailyProgress,
                    weekly: user.weeklyProgress,
                    monthly: user.monthlyProgress
                }
            }
        });

    } catch (error) {
        console.error('Analytics Report API Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch analytics report' 
        }, { status: 500 });
    }
}
