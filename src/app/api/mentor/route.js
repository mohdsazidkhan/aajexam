import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect } from '@/middleware/auth';
import { hasAccess } from '@/lib/subscription';

// GET - List verified mentors (PRO ONLY)
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });

        const user = auth.user;
        if (!hasAccess(user, 'PRO', 'mentor')) {
            return NextResponse.json({
                success: false,
                message: 'Mentors are a PRO feature. Upgrade to connect with experts!'
            }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const examName = searchParams.get('exam');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        let query = { status: 'active', isVerified: true };
        if (examName) query['examsCleared.examName'] = { $regex: examName, $options: 'i' };

        const [mentors, total] = await Promise.all([
            MentorProfile.find(query)
                .populate('user', 'name username profilePicture followersCount')
                .select('examsCleared specialization rating totalRatings helpedStudents tips')
                .sort({ rating: -1, helpedStudents: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            MentorProfile.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: mentors,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
