import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import { notEmbedded } from '@/lib/utils/embeddedSource';
import { enforceRateLimit } from '@/lib/rateLimit';

const SIZE = 5;

// Short, text-only, English questions with exactly four options and one correct answer.
const SAMPLE_FILTER = {
    isActive: true,
    language: 'en',
    image: '',
    ...notEmbedded,
    $expr: {
        $and: [
            { $eq: [{ $size: '$options' }, 4] },
            { $lte: [{ $strLenCP: '$questionText' }, 220] },
            { $eq: [{ $size: { $filter: { input: '$options', as: 'o', cond: '$$o.isCorrect' } } }, 1] },
        ],
    },
};

// GET /api/public/sample-quiz  ->  5 random questions for logged-out visitors. The answer key is NOT sent.
export async function GET(req) {
    try {
        const limited = await enforceRateLimit(req, { name: 'sample-quiz', limit: 30, windowSec: 3600 });
        if (limited) return limited;

        await dbConnect();
        const rows = await Question.aggregate([
            { $match: SAMPLE_FILTER },
            { $sample: { size: SIZE } },
            { $project: { questionText: 1, 'options.text': 1 } },
        ]);

        return NextResponse.json(
            { success: true, data: rows.map((q) => ({ id: String(q._id), text: q.questionText, options: q.options.map((o) => o.text) })) },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('sample-quiz error:', error);
        return NextResponse.json({ success: false, message: 'Could not load the sample quiz.' }, { status: 500 });
    }
}

// POST /api/public/sample-quiz  { id, choice }  ->  { correct, correctIndex }
// Reveals the answer of ONE question after the visitor has picked an option. The explanation is deliberately
// not returned: unlocking explanations is the reason to sign up.
export async function POST(req) {
    try {
        const limited = await enforceRateLimit(req, { name: 'sample-quiz-check', limit: 60, windowSec: 3600 });
        if (limited) return limited;

        const b = await req.json().catch(() => ({}));
        const choice = Number(b.choice);
        if (!mongoose.isValidObjectId(b.id) || !Number.isInteger(choice) || choice < 0 || choice > 3) {
            return NextResponse.json({ success: false, message: 'Invalid answer.' }, { status: 400 });
        }

        await dbConnect();
        const q = await Question.findOne({ _id: b.id, ...SAMPLE_FILTER }).select('options.isCorrect').lean();
        if (!q) return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 });

        const correctIndex = q.options.findIndex((o) => o.isCorrect);
        return NextResponse.json({ success: true, correct: choice === correctIndex, correctIndex });
    } catch (error) {
        console.error('sample-quiz check error:', error);
        return NextResponse.json({ success: false, message: 'Could not check the answer.' }, { status: 500 });
    }
}
