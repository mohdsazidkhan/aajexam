import crypto from 'crypto';
import OpenAI from 'openai';
import TranslationCache from '@/models/TranslationCache';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
const MAX_INPUT_CHARS = 8000;

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

let _client = null;
function client() {
    if (_client) return _client;
    _client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: { 'HTTP-Referer': SITE_URL, 'X-Title': 'AajExam' }
    });
    return _client;
}

export const LANGUAGE_MAP = {
    'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi', 'gu': 'Gujarati', 'bn': 'Bengali',
    'pa': 'Punjabi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'ur': 'Urdu',
};

export function hashSource(source, target) {
    return crypto.createHash('sha256').update(`${target}:${source}`).digest('hex');
}

function isRetryableError(err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || status === 408 || status === 503 || status === 502 || status >= 500) return true;
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('rate') || msg.includes('timeout') || msg.includes('unavailable') || msg.includes('quota')) return true;
    if (status === 400 && (msg.includes('provider') || msg.includes('upstream'))) return true;
    return false;
}

async function callLLM(text, targetLangName) {
    const chain = getModelChain();
    let lastErr = null;
    for (const model of chain) {
        try {
            const completion = await client().chat.completions.create({
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
            if (out) return { translated: out, model };
            lastErr = new Error('Empty response');
        } catch (err) {
            lastErr = err;
            console.warn(`Model ${model} failed:`, err?.message || err);
            if (!isRetryableError(err)) break;
        }
    }
    throw lastErr || new Error('All models failed');
}

export async function translateText(text, targetCode) {
    const src = (text || '').toString();
    if (!src.trim()) return src;
    const code = (targetCode || '').toLowerCase();
    if (code === 'en' || !LANGUAGE_MAP[code]) return src;
    if (src.length > MAX_INPUT_CHARS) return src;

    const sourceHash = hashSource(src, code);
    const cached = await TranslationCache.findOne({ sourceHash, targetLang: code }).lean();
    if (cached) {
        TranslationCache.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } }).catch(() => {});
        return cached.translated;
    }

    try {
        const { translated, model } = await callLLM(src, LANGUAGE_MAP[code]);
        await TranslationCache.create({
            sourceHash,
            targetLang: code,
            source: src,
            translated,
            model,
            charCount: src.length,
            hitCount: 0
        }).catch(() => {});
        return translated;
    } catch (e) {
        console.error('translateText error:', e.message);
        return src;
    }
}

export async function translateMany(texts, targetCode) {
    return Promise.all(texts.map(t => translateText(t, targetCode)));
}
