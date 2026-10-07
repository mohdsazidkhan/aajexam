import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import QuestionTranslation from '@/models/QuestionTranslation';
import { protect } from '@/middleware/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
    LANGUAGE_MAP,
    QUESTIONS_PER_CHUNK,
    translateItems,
    isDailyQuotaExhausted,
    getApiKeyPresent
} from '@/lib/translateCore';

// One model call per request at most (one chunk), well inside the limit.
export const maxDuration = 300;

const MAX_IDS = 60;
const SOURCES = ['daily_challenge', 'revision'];
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

/**
 * POST /api/translate/lookup  { ids: [questionId...], lang: 'hi', source: 'daily_challenge' | 'revision' }
 *
 * For screens that show questions outside a quiz/test attempt (daily
 * challenge, revision queue). Same order as the quiz/test flow:
 *   1. read the stored translation of each question from `questiontranslations`;
 *   2. only for the ids that have none, translate them with the model (one
 *      chunk per call), store them, and return them too.
 * `pending` tells the caller how many ids are still without a translation so
 * it can call again.
 */
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });

        const limited = await enforceRateLimit(req, { name: 'translate-lookup', limit: 30, windowSec: 60 });
        if (limited) return limited;

        const body = await req.json().catch(() => ({}));
        const lang = String(body.lang || 'hi').toLowerCase();
        if (lang === 'en' || !LANGUAGE_MAP[lang]) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
        const source = SOURCES.includes(body.source) ? body.source : 'daily_challenge';
        const ids = [...new Set((Array.isArray(body.ids) ? body.ids : []).map(String).filter(isObjectId))].slice(0, MAX_IDS);
        if (!ids.length) return NextResponse.json({ success: true, lang, translations: {}, pending: 0 });

        await dbConnect();

        const translations = {};
        const existing = await QuestionTranslation.find({ questionId: { $in: ids }, lang })
            .select('questionId questionText options').lean();
        existing.forEach((d) => {
            translations[String(d.questionId)] = { questionText: d.questionText, options: d.options || [] };
        });

        const missingIds = ids.filter((id) => !translations[id]);
        if (!missingIds.length) return NextResponse.json({ success: true, lang, translations, pending: 0 });

        // Nothing stored for these: fall back to the model (one chunk per request).
        if (!getApiKeyPresent()) return NextResponse.json({ success: true, lang, translations, pending: missingIds.length });

        const docs = await Question.find({ _id: { $in: missingIds.slice(0, QUESTIONS_PER_CHUNK) } })
            .select('questionText options.text').lean();
        const group = docs.map((d) => ({
            _id: d._id,
            questionText: d.questionText || '',
            options: (d.options || []).map((o) => o?.text || '')
        }));

        let quotaExhausted = false;
        let translated = 0;
        if (group.length) {
            const items = [];
            group.forEach((q) => {
                const qid = String(q._id);
                if (q.questionText) items.push({ id: qid, text: q.questionText });
                q.options.forEach((opt, idx) => { if (opt) items.push({ id: `${qid}|${idx}`, text: opt }); });
            });
            try {
                const { map, model } = await translateItems(items, lang);
                const ops = group.map((q) => {
                    const qid = String(q._id);
                    const questionText = map[qid] || q.questionText;
                    const options = q.options.map((opt, idx) => map[`${qid}|${idx}`] || opt);
                    translations[qid] = { questionText, options };
                    return {
                        updateOne: {
                            filter: { questionId: q._id, lang },
                            update: {
                                $set: { questionText, options, model: model || '' },
                                $setOnInsert: { sourceType: source }
                            },
                            upsert: true
                        }
                    };
                });
                if (ops.length) await QuestionTranslation.bulkWrite(ops, { ordered: false });
                translated = group.length;
            } catch (err) {
                if (isDailyQuotaExhausted(err)) quotaExhausted = true;
                else console.error('Lookup translate failed:', err?.message || err);
            }
        }

        // Only the ids beyond this call's chunk are still worth asking for; a chunk that
        // failed or ran out of quota is not retried in a loop.
        const pending = quotaExhausted || translated === 0 ? 0 : Math.max(0, missingIds.length - QUESTIONS_PER_CHUNK);
        return NextResponse.json({ success: true, lang, translations, translated, quotaExhausted, pending });
    } catch (error) {
        console.error('Translation lookup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
