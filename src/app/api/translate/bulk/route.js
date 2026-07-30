import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import PracticeTest from '@/models/PracticeTest';
import QuestionTranslation from '@/models/QuestionTranslation';
import { protect } from '@/middleware/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
    LANGUAGE_MAP,
    QUESTIONS_PER_CHUNK,
    chunk,
    translateItems,
    isDailyQuotaExhausted,
    getApiKeyPresent
} from '@/lib/translateCore';

// Bulk translation is a long job: a 100-question test is ~7 model calls.
// Vercel Pro allows up to 300s.
export const maxDuration = 300;

// One chunk of 10 questions measures ~170s on the free tier, and running
// chunks in parallel does not speed it up — the provider serialises them. So
// each request does exactly one chunk (well inside maxDuration) and reports
// what is left; the caller posts again to continue. A long practice test is
// translated across several requests instead of dying at the 300s wall.
const CHUNKS_PER_REQUEST = 1;

// Guards against two students opening the same quiz at once and paying for the
// same translation twice. Per-instance only — the upsert keeps it correct
// regardless, this just avoids obvious duplicate spend.
const inFlight = new Set();

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

/**
 * Load a quiz's or practice test's questions in one shape:
 * [{ _id, questionText, options: [string] }]
 */
async function loadQuestions(sourceType, sourceId) {
    if (sourceType === 'quiz') {
        const quiz = await Quiz.findById(sourceId)
            .populate({ path: 'questions', match: { isActive: true }, select: 'questionText options.text' })
            .lean();
        if (!quiz) return null;
        return (quiz.questions || []).map((q) => ({
            _id: q._id,
            questionText: q.questionText || '',
            options: (q.options || []).map((o) => o?.text || '')
        }));
    }

    const test = await PracticeTest.findById(sourceId).select('questions').lean();
    if (!test) return null;
    return (test.questions || []).map((q) => ({
        _id: q._id,
        questionText: q.questionText || '',
        options: (q.options || []).map((o) => (typeof o === 'string' ? o : o?.text || ''))
    }));
}

function parseParams(source) {
    const sourceType = (source.sourceType || '').toLowerCase();
    const sourceId = source.sourceId;
    const lang = (source.lang || 'hi').toLowerCase();

    if (sourceType !== 'quiz' && sourceType !== 'test') return { error: 'sourceType must be quiz or test' };
    if (!isObjectId(sourceId)) return { error: 'Invalid sourceId' };
    if (lang === 'en' || !LANGUAGE_MAP[lang]) return { error: 'Invalid language' };
    return { sourceType, sourceId, lang };
}

/**
 * GET — read whatever is already translated. Never calls the model.
 * /api/translate/bulk?sourceType=quiz&sourceId=<id>&lang=hi
 */
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const parsed = parseParams({
            sourceType: searchParams.get('sourceType'),
            sourceId: searchParams.get('sourceId'),
            lang: searchParams.get('lang')
        });
        if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

        await dbConnect();

        // Look up by question id, not by sourceId: quizzes share Question
        // documents, so a question translated for one quiz already serves the
        // others.
        const questions = await loadQuestions(parsed.sourceType, parsed.sourceId);
        if (!questions) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

        const docs = questions.length === 0 ? [] : await QuestionTranslation.find({
            questionId: { $in: questions.map((q) => q._id) },
            lang: parsed.lang
        }).select('questionId questionText options').lean();

        const translations = {};
        docs.forEach((d) => {
            translations[String(d.questionId)] = {
                questionText: d.questionText,
                options: d.options || []
            };
        });

        return NextResponse.json({ success: true, lang: parsed.lang, count: docs.length, translations });
    } catch (error) {
        console.error('Bulk translate GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST — translate whatever is still missing and store it.
 *
 * Two modes:
 *  - whole source (no `questionIds`): the background job fired when an attempt
 *    opens. Safe to call repeatedly — stored questions are skipped.
 *  - targeted (`questionIds: [...]`): the student switched to Hindi on a
 *    question the job hasn't reached yet. Translates just those, saves them,
 *    and returns them in the response so the screen can render immediately.
 */
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });

        // Each request can trigger several model calls, so keep the per-IP cap tight.
        const limited = await enforceRateLimit(req, { name: 'translate-bulk', limit: 20, windowSec: 60 });
        if (limited) return limited;

        const body = await req.json().catch(() => ({}));
        const parsed = parseParams(body);
        if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
        const { sourceType, sourceId, lang } = parsed;

        if (!getApiKeyPresent()) {
            return NextResponse.json({ error: 'OpenRouter key missing on server' }, { status: 500 });
        }

        await dbConnect();

        const allQuestions = await loadQuestions(sourceType, sourceId);
        if (!allQuestions) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

        // Targeted mode: only the ids asked for, and only if they really belong
        // to this quiz/test.
        const wanted = Array.isArray(body.questionIds)
            ? new Set(body.questionIds.filter(isObjectId).map(String))
            : null;
        const questions = wanted
            ? allQuestions.filter((q) => wanted.has(String(q._id)))
            : allQuestions;

        if (questions.length === 0) {
            return NextResponse.json({
                success: true, total: 0, alreadyDone: 0, translated: 0, pending: 0, translations: {}
            });
        }

        // Same reason as GET: match on question ids so a question shared with
        // another quiz is never paid for twice.
        const existing = await QuestionTranslation.find({
            questionId: { $in: questions.map((q) => q._id) },
            lang
        }).select('questionId questionText options').lean();
        const done = new Set(existing.map((d) => String(d.questionId)));
        const missing = questions.filter((q) => !done.has(String(q._id)));

        // Targeted callers render straight from the response, so hand back
        // whatever was already stored plus whatever this call produces.
        const translations = {};
        if (wanted) {
            existing.forEach((d) => {
                translations[String(d.questionId)] = {
                    questionText: d.questionText,
                    options: d.options || []
                };
            });
        }

        if (missing.length === 0) {
            return NextResponse.json({
                success: true, total: questions.length, alreadyDone: done.size,
                translated: 0, pending: 0, translations
            });
        }

        // Only the whole-source job takes the lock; a targeted request is one
        // question and must stay responsive even while the job is running.
        const jobKey = `${sourceType}:${sourceId}:${lang}`;
        if (!wanted) {
            if (inFlight.has(jobKey)) {
                return NextResponse.json({
                    success: true, inProgress: true,
                    total: questions.length, alreadyDone: done.size, translated: 0, pending: missing.length
                });
            }
            inFlight.add(jobKey);
        }

        let translated = 0;
        let quotaExhausted = false;

        try {
            const groups = chunk(missing, QUESTIONS_PER_CHUNK).slice(0, CHUNKS_PER_REQUEST);

            for (const group of groups) {
                if (quotaExhausted) break;

                // Flatten the chunk: "<qid>" for the question, "<qid>|<n>" per option
                const items = [];
                group.forEach((q) => {
                    const qid = String(q._id);
                    if (q.questionText) items.push({ id: qid, text: q.questionText });
                    q.options.forEach((opt, idx) => {
                        if (opt) items.push({ id: `${qid}|${idx}`, text: opt });
                    });
                });

                try {
                    const { map, model } = await translateItems(items, lang);
                    const ops = group.map((q) => {
                        const qid = String(q._id);
                        const questionText = map[qid] || q.questionText;
                        const options = q.options.map((opt, idx) => map[`${qid}|${idx}`] || opt);
                        if (wanted) translations[qid] = { questionText, options };
                        return {
                            updateOne: {
                                filter: { questionId: q._id, lang },
                                update: {
                                    $set: {
                                        questionText,
                                        options,
                                        model: model || ''
                                    },
                                    // Provenance only — a shared question keeps its first owner
                                    $setOnInsert: { sourceType, sourceId }
                                },
                                upsert: true
                            }
                        };
                    });
                    if (ops.length) await QuestionTranslation.bulkWrite(ops, { ordered: false });
                    translated += group.length;
                } catch (err) {
                    if (isDailyQuotaExhausted(err)) {
                        quotaExhausted = true;
                        break;
                    }
                    console.error('Bulk chunk failed:', err?.message || err);
                }
            }
        } finally {
            if (!wanted) inFlight.delete(jobKey);
        }

        return NextResponse.json({
            success: true,
            total: questions.length,
            alreadyDone: done.size,
            translated,
            pending: missing.length - translated,
            quotaExhausted,
            translations
        });
    } catch (error) {
        console.error('Bulk translate POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
