import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import { protect, admin } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { name, category } = await req.json();
        const { id } = params;

        const subcategory = await Subcategory.findByIdAndUpdate(id, { name, category }, { new: true });
        if (!subcategory) return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });

        return NextResponse.json({ message: '🎉 Subcategory Updated Successfully!', subcategory });
    } catch (error) {
        console.error('Admin update subcategory error:', error);
        return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
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

        const subcategory = await Subcategory.findByIdAndDelete(id);
        if (!subcategory) return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });

        return NextResponse.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error('Admin delete subcategory error:', error);
        return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
    }
}
