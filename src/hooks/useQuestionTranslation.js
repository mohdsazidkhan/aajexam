'use client';

import { useState, useEffect, useCallback } from 'react';
import API from '../lib/api';

// Options come as plain strings (govt-exam tests) or { text } objects (quizzes).
const readOption = (opt) => {
  if (typeof opt === 'string') return opt;
  return opt?.text ?? opt?.value ?? opt?.option ?? '';
};

/**
 * EN ⇄ HI translation for an ongoing quiz / practice test.
 * Only the current question (question text + options) is translated, on demand,
 * and every fetched question stays cached for the rest of the attempt.
 */
const useQuestionTranslation = ({ questions, currentIndex, active = true }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const question = questions?.[currentIndex] || null;
  const cacheKey = question?._id ? `${language}:${question._id}` : null;

  useEffect(() => {
    if (!active || language === 'en' || !question || !cacheKey) return;
    if (translations[cacheKey]) return;

    let cancelled = false;
    const run = async () => {
      const optionTexts = (question.options || []).map(readOption);
      const items = [];
      if (question.questionText) items.push({ id: 'q', text: question.questionText });
      optionTexts.forEach((text, i) => {
        if (text) items.push({ id: `o${i}`, text });
      });

      if (items.length === 0) {
        setTranslations((prev) => ({
          ...prev,
          [cacheKey]: { questionText: question.questionText, optionTexts },
        }));
        return;
      }

      try {
        setTranslating(true);
        const res = await API.translateBatch(language, items);
        if (cancelled || !res?.results) return;

        const out = { questionText: question.questionText, optionTexts: [...optionTexts] };
        res.results.forEach((r) => {
          if (r.id === 'q') out.questionText = r.translated;
          else if (r.id?.startsWith('o')) {
            const idx = parseInt(r.id.slice(1), 10);
            if (!Number.isNaN(idx)) out.optionTexts[idx] = r.translated;
          }
        });
        setTranslations((prev) => ({ ...prev, [cacheKey]: out }));
      } catch (err) {
        console.error('Question translate failed:', err);
      } finally {
        if (!cancelled) setTranslating(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [active, language, cacheKey, question, translations]);

  const translated = language === 'en' || !cacheKey ? null : translations[cacheKey] || null;

  return {
    language,
    toggleLanguage,
    // true while the current question is still being fetched in Hindi
    translating: translating && language !== 'en',
    // { questionText, optionTexts } once ready, else null (show original)
    translated,
    readOption,
  };
};

export default useQuestionTranslation;
