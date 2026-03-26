import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { protect, admin } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { name, description } = await req.json();
        const { id } = params;

        const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

        return NextResponse.json({ message: '🎉 Category Updated Successfully!', category });
    } catch (error) {
        console.error('Admin update category error:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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

        const category = await Category.findByIdAndDelete(id);
        if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Admin delete category error:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
