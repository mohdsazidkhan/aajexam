import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { protect, admin } from '@/middleware/auth';

// PUT - Update expense
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();

        await dbConnect();

        const expense = await Expense.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!expense) {
            return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        }, { status: 500 });
    }
}

// DELETE - Delete expense
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;
        await dbConnect();

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        }, { status: 500 });
    }
}
