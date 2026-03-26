import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import { protect, admin } from '@/middleware/auth';

export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        await dbConnect();
        const { id } = params;
        const { type, action, adminNotes } = await req.json(); // type: quiz/category/subcategory, action: approve/reject

        let Model;
        if (type === 'category') Model = Category;
        else if (type === 'subcategory') Model = Subcategory;
        else Model = Quiz;

        const doc = await Model.findOne({ _id: id, createdType: 'user', status: 'pending' });
        if (!doc) return NextResponse.json({ message: 'Not found or processed' }, { status: 404 });

        if (action === 'approve') {
            doc.status = 'approved';
            doc.approvedAt = new Date();
            doc.approvedBy = auth.user.id;
        } else {
            if (!adminNotes) return NextResponse.json({ message: 'Notes required for rejection' }, { status: 400 });
            doc.status = 'rejected';
            doc.adminNotes = adminNotes;
        }

        if (adminNotes) doc.adminNotes = adminNotes;
        await doc.save();

        return NextResponse.json({ success: true, data: doc });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
