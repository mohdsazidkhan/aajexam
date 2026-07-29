/**
 * Database-backed translation helpers.
 *
 * The model plumbing lives in translateCore.js (no DB imports, so scripts can
 * use it too); this layer adds the TranslationCache read/write around it.
 */

import TranslationCache from '@/models/TranslationCache';
import {
    LANGUAGE_MAP,
    MAX_INPUT_CHARS,
    hashSource,
    callLLM
} from './translateCore';

export {
    LANGUAGE_MAP,
    MAX_INPUT_CHARS,
    QUESTIONS_PER_CHUNK,
    hashSource,
    chunk,
    getApiKey,
    getApiKeyPresent,
    isRetryableError,
    isDailyQuotaExhausted,
    translateItems,
    callLLM
} from './translateCore';

/**
 * Translate a single string, served from TranslationCache when possible.
 * Never throws — returns the source text if translation is unavailable.
 */
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
