import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import WalletTransaction from '@/models/WalletTransaction';
import { protect, admin } from '@/middleware/auth';

export async function PATCH(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();
        const question = await UserQuestions.findById(id);

        if (!question) {
            return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        }

        const oldStatus = question.status;
        question.status = status;

        // If newly approved, credit the user
        if (status === 'approved' && oldStatus !== 'approved') {
            const rewardAmount = parseInt(process.env.PER_USER_QUIZ_CREDIT_AMOUNT) || 5;
            
            await WalletTransaction.create({
                user: question.author || question.userId, // handle multiple potential field names
                type: 'credit',
                amount: rewardAmount,
                description: `Question approved: ${question.questionText.substring(0, 30)}...`,
                category: 'question_reward',
                status: 'completed',
                questionId: question._id,
                metadata: { 
                    questionId: question._id,
                    questionText: question.questionText
                }
            });
        }

        await question.save();

        return NextResponse.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Update user question status error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
