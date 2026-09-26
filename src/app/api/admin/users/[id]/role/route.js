import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

// PUT - Promote a student to admin, or demote an admin back to student
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const { role } = await req.json();

        if (!['admin', 'student'].includes(role)) {
            return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
        }

        if (String(auth.user._id) === String(id) && role !== 'admin') {
            return NextResponse.json({ message: 'You cannot remove your own admin access' }, { status: 400 });
        }

        const target = await User.findById(id);
        if (!target) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (target.role === 'admin' && role === 'student') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return NextResponse.json({ message: 'Cannot demote the last remaining admin' }, { status: 400 });
            }
        }

        target.role = role;
        await target.save();

        return NextResponse.json({
            success: true,
            message: `${target.name || target.email} is now ${role === 'admin' ? 'an admin' : 'a student'}`,
            user: { _id: target._id, name: target.name, email: target.email, role: target.role }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
