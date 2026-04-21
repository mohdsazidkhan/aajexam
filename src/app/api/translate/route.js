import { NextResponse } from 'next/server';
import crypto from 'crypto';
import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import TranslationCache from '@/models/TranslationCache';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

function getModelChain() {
    const chain = [];
    const keys = ['AI_MODEL', 'AI_MODEL1', 'AI_MODEL2', 'AI_MODEL3', 'AI_MODEL4', 'AI_MODEL5'];
    for (const k of keys) {
        const v = process.env[k];
        if (v && !chain.includes(v)) chain.push(v);
    }
    if (process.env.OPENROUTER_TRANSLATE_MODEL && !chain.includes(process.env.OPENROUTER_TRANSLATE_MODEL)) {
        chain.unshift(process.env.OPENROUTER_TRANSLATE_MODEL);
    }
    if (chain.length === 0) chain.push('meta-llama/llama-3.3-70b-instruct:free');
    return chain;
}

function getApiKey() {
    return process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_KEY || '';
}

let _openrouter = null;
function getClient() {
    if (_openrouter) return _openrouter;
    _openrouter = new OpenAI({
        apiKey: getApiKey(),
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': SITE_URL,
            'X-Title': 'AajExam'
        }
    });
    return _openrouter;
}

const LANGUAGE_MAP = {
    'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi', 'gu': 'Gujarati', 'bn': 'Bengali',
    'pa': 'Punjabi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'ur': 'Urdu',
};

const MAX_INPUT_CHARS = 8000;

function hashSource(source, target) {
    return crypto.createHash('sha256').update(`${target}:${source}`).digest('hex');
}

function isRetryableError(err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || status === 408 || status === 503 || status === 502 || status >= 500) return true;
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('rate') || msg.includes('timeout') || msg.includes('unavailable') || msg.includes('quota')) return true;
    // OpenRouter's "Provider returned error" (status 400) means the upstream model/provider failed.
    // These are per-model problems — fall through to the next model in the chain.
    if (status === 400 && (msg.includes('provider') || msg.includes('upstream'))) return true;
    return false;
}

async function translateOne(text, targetLangName) {
    const chain = getModelChain();
    let lastErr = null;
    let modelUsed = null;
    for (const model of chain) {
        try {
            const completion = await getClient().chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator for Indian competitive exam content (SSC, RRB, Banking). Translate the user's text to ${targetLangName}. Preserve the EXACT structure: keep markdown, HTML tags, numbers, option labels (A., B., 1., 2.), and special separators (like |||) intact. Translate only the natural language content. Return ONLY the translation with no preface, explanation, or quotes.`
                    },
                    { role: 'user', content: text }
                ],
                temperature: 0.1,
                max_tokens: 2000
            });
            const out = completion.choices[0]?.message?.content?.trim();
            if (out) {
                modelUsed = model;
                return { translated: out, model: modelUsed };
            }
            lastErr = new Error('Empty response');
        } catch (err) {
            lastErr = err;
            console.warn(`Model ${model} failed:`, err?.message || err);
            if (!isRetryableError(err)) break;
        }
    }
    throw lastErr || new Error('All models failed');
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { text, target } = body;
        const items = Array.isArray(body.items) ? body.items : null;

        const targetCode = (target || '').toLowerCase();
        const targetLangName = LANGUAGE_MAP[targetCode];
        if (!targetLangName) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });

        const apiKey = getApiKey();
        if (!apiKey) {
            const detected = Object.keys(process.env).filter(k => /openrouter|ai_model/i.test(k));
            console.error('OpenRouter key missing. Env keys detected matching pattern:', detected);
            return NextResponse.json({
                error: 'OpenRouter key missing on server',
                detectedEnvKeys: detected,
                hint: 'Ensure OPENROUTER_API_KEY is set in Vercel Production env and redeploy.'
            }, { status: 500 });
        }

        await dbConnect();

        // Batch mode: items = [{ id, text }, ...]
        if (items) {
            const results = await Promise.all(items.map(async (item) => {
                const src = (item.text || '').toString();
                if (!src.trim()) return { id: item.id, translated: src };
                if (targetCode === 'en') return { id: item.id, translated: src };
                if (src.length > MAX_INPUT_CHARS) return { id: item.id, translated: src, error: 'Too long' };

                const sourceHash = hashSource(src, targetCode);
                const cached = await TranslationCache.findOne({ sourceHash, targetLang: targetCode }).lean();
                if (cached) {
                    TranslationCache.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } }).catch(() => {});
                    return { id: item.id, translated: cached.translated, cached: true };
                }

                try {
                    const { translated, model } = await translateOne(src, targetLangName);
                    await TranslationCache.create({
                        sourceHash,
                        targetLang: targetCode,
                        source: src,
                        translated,
                        model,
                        charCount: src.length,
                        hitCount: 0
                    }).catch(() => {});
                    return { id: item.id, translated, cached: false, model };
                } catch (e) {
                    return { id: item.id, translated: src, error: e.message };
                }
            }));
            return NextResponse.json({ results });
        }

        // Single mode
        if (!text) return NextResponse.json({ error: 'Missing text or target' }, { status: 400 });
        const src = text.toString();
        if (targetCode === 'en') return NextResponse.json({ translated: src });
        if (src.length > MAX_INPUT_CHARS) return NextResponse.json({ error: 'Text too long' }, { status: 400 });

        const sourceHash = hashSource(src, targetCode);
        const cached = await TranslationCache.findOne({ sourceHash, targetLang: targetCode }).lean();
        if (cached) {
            TranslationCache.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } }).catch(() => {});
            return NextResponse.json({ translated: cached.translated, cached: true });
        }

        const { translated, model } = await translateOne(src, targetLangName);
        await TranslationCache.create({
            sourceHash,
            targetLang: targetCode,
            source: src,
            translated,
            model,
            charCount: src.length,
            hitCount: 0
        }).catch(() => {});

        return NextResponse.json({ translated, cached: false, model });
    } catch (error) {
        console.error('Translate error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
