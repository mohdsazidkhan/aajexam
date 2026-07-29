/**
 * Model-facing translation helpers — the OpenRouter chain and the prompts.
 *
 * Kept free of database imports so it can be used from anywhere; translate.js
 * layers the TranslationCache read/write on top.
 */

import crypto from 'crypto';
import OpenAI from 'openai';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
export const MAX_INPUT_CHARS = 8000;

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
    if (chain.length === 0) chain.push('openai/gpt-oss-20b:free');
    return chain;
}

export function getApiKey() {
    return process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_KEY || '';
}

export function getApiKeyPresent() {
    return !!getApiKey();
}

let _client = null;
function client() {
    if (_client) return _client;
    _client = new OpenAI({
        apiKey: getApiKey(),
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

export function isRetryableError(err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || status === 408 || status === 503 || status === 502 || status >= 500) return true;
    if (status === 404) return true;
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('rate') || msg.includes('timeout') || msg.includes('unavailable') || msg.includes('quota')) return true;
    if (msg.includes('no endpoints') || msg.includes('not found') || msg.includes('does not exist')) return true;
    // A retired/renamed model slug must not abort the chain — skip to the next model.
    if (msg.includes('not a valid model') || msg.includes('invalid model')) return true;
    if (status === 400 && (msg.includes('provider') || msg.includes('upstream'))) return true;
    return false;
}

/**
 * True when the account's shared daily allowance for `:free` models is gone.
 * No other model in the chain can succeed, so callers should stop immediately
 * instead of burning time walking the rest of the chain.
 */
export function isDailyQuotaExhausted(err) {
    const msg = (err?.message || '').toLowerCase();
    return msg.includes('free-models-per-day') || msg.includes('free model requests per day');
}

/**
 * Translate one string, walking the model chain on failure.
 * @param {string} text
 * @param {string} targetLangName - e.g. 'Hindi'
 * @returns {Promise<{translated: string, model: string}>}
 */
export async function callLLM(text, targetLangName) {
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

// ─── Bulk (one model call for many strings) ───────────────────────────────
//
// One request per string burns the OpenRouter daily allowance in a single quiz
// attempt (10 questions × 5 strings = 50 calls). Bulk mode sends a JSON array
// and gets one back, so a whole quiz costs 1-2 calls instead of 50.

// 10 questions ≈ 50 strings ≈ 2-3k output tokens in Devanagari — inside every
// free model's response cap and comfortably under the route's maxDuration.
export const QUESTIONS_PER_CHUNK = 10;

export function chunk(list, size) {
    const out = [];
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    return out;
}

function parseJsonArray(raw) {
    if (!raw) return null;
    let text = raw.trim();
    // Models often wrap JSON in ``` fences despite being told not to
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) text = fenced[1].trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) return null;
    try {
        const parsed = JSON.parse(text.slice(start, end + 1));
        return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
        return null;
    }
}

/**
 * Translate many strings in ONE model call.
 * @param {Array<{id: string, text: string}>} items
 * @param {string} targetCode - e.g. 'hi'
 * @returns {Promise<{ map: Object<string,string>, model: string|null }>} id → translation, for the ids the model returned
 */
export async function translateItems(items, targetCode) {
    const code = (targetCode || '').toLowerCase();
    const targetLangName = LANGUAGE_MAP[code];
    if (!targetLangName || code === 'en') return { map: {}, model: null };

    const usable = (items || []).filter(
        (it) => (it?.text || '').trim() && it.text.length <= MAX_INPUT_CHARS
    );
    if (usable.length === 0) return { map: {}, model: null };

    const payload = JSON.stringify(usable.map(({ id, text }) => ({ id: String(id), text })));
    const chain = getModelChain();
    let lastErr = null;

    for (const model of chain) {
        try {
            const completion = await client().chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator for Indian competitive exam content (SSC, RRB, Banking). The user sends a JSON array of {"id","text"} objects. Translate every "text" into ${targetLangName} and return ONLY a JSON array of {"id","text"} objects with the SAME ids, in the SAME order, and the SAME number of entries. Keep numbers, units, formulae, option labels (A., B., 1., 2.), markdown and HTML tags exactly as they are — translate only natural language. No commentary, no explanations, no code fences.`
                    },
                    { role: 'user', content: payload }
                ],
                temperature: 0.1,
                max_tokens: 16000
            });

            const parsed = parseJsonArray(completion.choices[0]?.message?.content);
            if (!parsed) {
                lastErr = new Error(`Model ${model} returned unparsable JSON`);
                console.warn(lastErr.message);
                continue; // another model may format better
            }

            const map = {};
            parsed.forEach((entry) => {
                const id = entry?.id === undefined || entry?.id === null ? null : String(entry.id);
                const text = typeof entry?.text === 'string' ? entry.text.trim() : '';
                if (id && text) map[id] = text;
            });

            if (Object.keys(map).length === 0) {
                lastErr = new Error(`Model ${model} returned no usable entries`);
                continue;
            }
            return { map, model };
        } catch (err) {
            lastErr = err;
            console.warn(`Model ${model} failed (bulk):`, err?.message || err);
            // The daily cap is account-wide — no other free model can succeed
            if (isDailyQuotaExhausted(err)) break;
            if (!isRetryableError(err)) break;
        }
    }
    throw lastErr || new Error('All models failed');
}
