import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';
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

// Quiz questions all carry the schema-default `language: 'hi'` label even when the text is English, so the
// hero card filters on the script instead: no Devanagari in the question or any option. It is also small,
// so it wants shorter question and options than the sample-quiz page allows.
const NO_DEVANAGARI = { $not: /[ऀ-ॿ]/ };
// Wording that points at a picture, table or passage the card cannot show.
const NEEDS_CONTEXT = { $not: /[ऀ-ॿ]|figure|diagram|image|picture|shown|highlight|underline|passage|given below|above/i };
const HERO_FILTER = {
    isActive: true,
    image: '',
    ...notEmbedded,
    questionText: NEEDS_CONTEXT,
    'options.text': NO_DEVANAGARI,
    $expr: {
        $and: [
            ...SAMPLE_FILTER.$expr.$and,
            { $lte: [{ $strLenCP: '$questionText' }, 140] },
            { $lte: [{ $max: { $map: { input: '$options', as: 'o', in: { $strLenCP: '$$o.text' } } } }, 40] },
        ],
    },
};

// Hero mode: one random question from each of five random published quizzes, with the quiz title.
async function heroQuestions() {
    const quizzes = await Quiz.aggregate([
        { $match: { type: 'subject_test', status: 'published', slug: { $exists: true, $nin: [null, ''] }, 'questions.0': { $exists: true } } },
        { $sample: { size: 40 } },
        {
            $project: {
                title: 1,
                slug: 1,
                pick: {
                    $map: {
                        input: [0, 1, 2, 3],
                        as: 'i',
                        in: { $arrayElemAt: ['$questions', { $floor: { $multiply: [{ $rand: {} }, { $size: '$questions' }] } }] },
                    },
                },
            },
        },
    ]);

    const ids = quizzes.flatMap((qz) => qz.pick);
    const docs = await Question.find({ _id: { $in: ids }, ...HERO_FILTER }).select('questionText options.text').lean();
    const byId = new Map(docs.map((d) => [String(d._id), d]));

    const out = [];
    for (const qz of quizzes) {
        const doc = qz.pick.map((id) => byId.get(String(id))).find(Boolean);
        if (!doc) continue;
        out.push({
            id: String(doc._id),
            text: doc.questionText,
            options: doc.options.map((o) => o.text),
            quiz: { title: qz.title, slug: qz.slug },
        });
        if (out.length === SIZE) break;
    }
    return out;
}

// GET /api/public/sample-quiz  ->  5 random questions for logged-out visitors. The answer key is NOT sent.
// GET /api/public/sample-quiz?quiz=1  ->  hero-card variant: each question comes with the title of its quiz.
export async function GET(req) {
    try {
        const hero = new URL(req.url).searchParams.get('quiz') === '1';
        const limited = await enforceRateLimit(req, hero
            ? { name: 'hero-quiz', limit: 60, windowSec: 3600 }
            : { name: 'sample-quiz', limit: 30, windowSec: 3600 });
        if (limited) return limited;

        await dbConnect();
        if (hero) {
            return NextResponse.json({ success: true, data: await heroQuestions() }, { headers: { 'Cache-Control': 'no-store' } });
        }
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
        const b = await req.json().catch(() => ({}));
        // the hero card checks five answers per round, so it gets its own, larger budget
        const limited = await enforceRateLimit(req, b.hero
            ? { name: 'hero-quiz-check', limit: 150, windowSec: 3600 }
            : { name: 'sample-quiz-check', limit: 60, windowSec: 3600 });
        if (limited) return limited;

        const choice = Number(b.choice);
        if (!mongoose.isValidObjectId(b.id) || !Number.isInteger(choice) || choice < 0 || choice > 3) {
            return NextResponse.json({ success: false, message: 'Invalid answer.' }, { status: 400 });
        }

        await dbConnect();
        const q = await Question.findOne({ _id: b.id, ...(b.hero ? HERO_FILTER : SAMPLE_FILTER) }).select('options.isCorrect').lean();
        if (!q) return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 });

        const correctIndex = q.options.findIndex((o) => o.isCorrect);
        return NextResponse.json({ success: true, correct: choice === correctIndex, correctIndex });
    } catch (error) {
        console.error('sample-quiz check error:', error);
        return NextResponse.json({ success: false, message: 'Could not check the answer.' }, { status: 500 });
    }
}
