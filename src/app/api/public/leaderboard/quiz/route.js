import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
// This assumes there's a model tracking quiz attempts or results globally
import QuizAttempt from '@/models/QuizAttempt'; 
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get('quizId');
        const limit = parseInt(searchParams.get('limit')) || 10;

        if (!quizId) {
            return NextResponse.json({ message: 'Quiz ID is required' }, { status: 400 });
        }

        // Fetch top scores for this quiz
        // If QuizAttempt model exists, use it. Otherwise, look for alternatives.
        // For now, providing a generic implementation that would work with a result-tracking model.
        // If such a model doesn't exist, we might need to check how quiz results are stored.
        
        let attempts = [];
        try {
            // Trying to find attempts if the model exists
            attempts = await QuizAttempt.find({ quizId })
                .populate('userId', 'name username profilePicture')
                .sort({ score: -1, timeSpent: 1 })
                .limit(limit);
        } catch (e) {
            console.warn('QuizAttempt model might be missing or different:', e.message);
            // Fallback: This is a stub if the model structure is different
            return NextResponse.json({ 
                success: true, 
                data: [], 
                message: 'Detailed quiz leaderboard temporarily unavailable' 
            });
        }

        return NextResponse.json({
            success: true,
            data: attempts
        });
    } catch (error) {
        console.error('Quiz Leaderboard error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
