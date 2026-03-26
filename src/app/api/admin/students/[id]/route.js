import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { name, email, phone, status, isBlocked } = await req.json();
        const { id } = params;

        const student = await User.findById(id);
        if (!student || student.role !== 'student') return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        if (name) student.name = name;
        if (email) student.email = email;
        if (phone) student.phone = phone;
        if (status !== undefined) student.status = status;
        if (isBlocked !== undefined) student.isBlocked = isBlocked;

        await student.save();
        return NextResponse.json({ message: '🎉 Student Updated Successfully!', student });
    } catch (error) {
        console.error('Admin update student error:', error);
        return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = params;

        const student = await User.findByIdAndDelete(id);
        if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Admin delete student error:', error);
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }
}
