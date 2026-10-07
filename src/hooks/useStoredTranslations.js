'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../lib/api';

/**
 * EN ⇄ HI for screens that show a list of questions outside a quiz/test attempt
 * (daily challenge, revision queue).
 *
 * Switching to Hindi: the server returns what is already stored in
 * `questiontranslations`; only the ids with no stored Hindi are translated by the
 * model (and stored), a chunk per request. Stored ids are never asked for again.
 *
 * @param {string[]} ids   Question document ids shown on the screen
 * @param {string}   source 'daily_challenge' | 'revision' (provenance only)
 * @returns {{ language, toggleLanguage, translating, get }}
 *   get(id) -> { questionText, optionTexts } | null (null = show the original)
 */
const useStoredTranslations = ({ ids, source }) => {
  const [language, setLanguage] = useState('en');
  const [stored, setStored] = useState({});
  const [translating, setTranslating] = useState(false);
  const asked = useRef(new Set());

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const key = (ids || []).filter(Boolean).map(String).join(',');

  useEffect(() => {
    if (language === 'en' || !key) return;
    const askedSet = asked.current;
    const todo = key.split(',').filter((id) => !stored[id] && !askedSet.has(id));
    if (!todo.length) return;
    todo.forEach((id) => askedSet.add(id));

    let cancelled = false;
    const run = async () => {
      setTranslating(true);
      try {
        let queue = todo;
        for (let round = 0; round < 8 && queue.length && !cancelled; round += 1) {
          const res = await API.lookupTranslations({ ids: queue, lang: 'hi', source });
          if (cancelled) return;
          if (res?.translations) setStored((prev) => ({ ...prev, ...res.translations }));
          if (!res?.pending) break;
          queue = queue.filter((id) => !res.translations?.[id]);
        }
      } catch (err) {
        console.error('Translation unavailable:', err?.message || err);
        // let a later toggle retry
        todo.forEach((id) => askedSet.delete(id));
      } finally {
        if (!cancelled) setTranslating(false);
      }
    };
    run();
    return () => {
      cancelled = true;
      setTranslating(false);
      // an interrupted request must not block a later retry; ids that did arrive are skipped via `stored`
      todo.forEach((id) => askedSet.delete(id));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, key, source]);

  const get = useCallback((id) => {
    if (language === 'en' || !id) return null;
    const t = stored[String(id)];
    return t ? { questionText: t.questionText, optionTexts: t.options || [] } : null;
  }, [language, stored]);

  return { language, toggleLanguage, translating, get };
};

export default useStoredTranslations;
