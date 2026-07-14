import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import QuizChallenge from '@/models/QuizChallenge';
import QuizAttempt from '@/models/QuizAttempt';
import { protect, proOnly } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        
        const user = auth.user;
        
        if (!proOnly(user)) {
            return NextResponse.json({ success: false, message: 'Only PRO users can create challenges' }, { status: 403 });
        }

        await connectDB();
        const { quizId, attemptId } = await req.json();

        if (!quizId || !attemptId) {
            return NextResponse.json({ success: false, message: 'quizId and attemptId are required' }, { status: 400 });
        }

        // Verify the attempt belongs to the user and is completed
        const attempt = await QuizAttempt.findOne({ _id: attemptId, user: user._id, status: 'Completed' });
        
        if (!attempt) {
            return NextResponse.json({ success: false, message: 'Valid completed quiz attempt not found' }, { status: 404 });
        }

        // Generate a 6-character short code
        const code = uuidv4().substring(0, 6).toUpperCase();

        const challenge = await QuizChallenge.create({
            host: user._id,
            quiz: quizId,
            hostAttempt: attemptId,
            code: code,
            challengers: []
        });

        return NextResponse.json({
            success: true,
            challengeCode: challenge.code
        });
    } catch (error) {
        console.error('Create challenge error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
