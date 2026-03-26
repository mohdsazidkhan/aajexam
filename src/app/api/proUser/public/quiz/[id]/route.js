import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        const quiz = await UserQuestions.findById(id).populate('userId', 'name username profilePicture');
        
        if (!quiz) {
            return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Pro User public quiz error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
