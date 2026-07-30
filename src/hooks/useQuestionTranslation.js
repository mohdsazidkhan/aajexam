'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../lib/api';

/**
 * EN ⇄ HI translation for an ongoing quiz / practice test.
 *
 * 1. When the attempt opens, the server translates the whole quiz/test in the
 *    background and stores it.
 * 2. Switching to Hindi reads those stored questions — instant, no model call.
 * 3. If the question the student is on hasn't been stored yet, the server is
 *    asked for that one question; it translates it, saves it, and returns it.
 */
const useQuestionTranslation = ({ questions, currentIndex, sourceType, sourceId }) => {
  const [language, setLanguage] = useState('en');
  const [stored, setStored] = useState({});
  const [jobRunning, setJobRunning] = useState(false);
  const [fetchingOne, setFetchingOne] = useState(false);
  const bulkStartedFor = useRef(null);
  const requestedOne = useRef(new Set());

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const question = questions?.[currentIndex] || null;
  const questionId = question?._id ? String(question._id) : null;
  const questionCount = questions?.length || 0;

  // Load what is already stored, and kick off the job for what is missing.
  // Deliberately not gated on the attempt having started: on the practice-test
  // page this runs while the student is still reading the start modal, so Hindi
  // is ready by the time they tap the toggle.
  useEffect(() => {
    if (!sourceType || !sourceId || !questionCount) return;
    const jobKey = `${sourceType}:${sourceId}`;
    if (bulkStartedFor.current === jobKey) return;
    bulkStartedFor.current = jobKey;

    let cancelled = false;

    const load = async () => {
      const res = await API.getBulkTranslations({ sourceType, sourceId, lang: 'hi' });
      if (cancelled || !res?.translations) return 0;
      setStored(res.translations);
      return res.count || 0;
    };

    const run = async () => {
      try {
        if (await load() >= questionCount) return;
        setJobRunning(true);

        // Each request translates one chunk and reports what is left, so a long
        // test is covered by several requests instead of one that would hit the
        // serverless time limit. Rounds are bounded so a repeatedly failing
        // chunk can't loop forever.
        for (let round = 0; round < 15 && !cancelled; round += 1) {
          const res = await API.requestBulkTranslation({ sourceType, sourceId, lang: 'hi' });
          if (cancelled) return;
          await load();
          if (cancelled) return;
          if (res?.quotaExhausted || !res?.pending || res.translated === 0) break;
        }
      } catch (err) {
        console.error('Bulk translation unavailable:', err?.message || err);
      } finally {
        if (!cancelled) setJobRunning(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [sourceType, sourceId, questionCount]);

  const current = language === 'en' || !questionId ? null : stored[questionId] || null;

  // The student is on a question the background job hasn't stored yet — ask
  // the server for just this one. It translates, saves, and returns it.
  useEffect(() => {
    if (language === 'en' || !questionId || current) return;
    if (!sourceType || !sourceId) return;
    if (requestedOne.current.has(questionId)) return;
    requestedOne.current.add(questionId);

    let cancelled = false;
    setFetchingOne(true);
    API.requestBulkTranslation({ sourceType, sourceId, lang: 'hi', questionIds: [questionId] })
      .then((res) => {
        if (cancelled || !res?.translations) return;
        setStored((prev) => ({ ...prev, ...res.translations }));
      })
      .catch((err) => console.error('Question translation failed:', err?.message || err))
      .finally(() => { if (!cancelled) setFetchingOne(false); });

    return () => { cancelled = true; };
  }, [language, questionId, current, sourceType, sourceId]);

  return {
    language,
    toggleLanguage,
    // true while this question's Hindi is still on its way
    translating: language !== 'en' && !current && (fetchingOne || jobRunning),
    // { questionText, optionTexts } once stored, else null (show original)
    translated: current
      ? { questionText: current.questionText, optionTexts: current.options || [] }
      : null,
  };
};

export default useQuestionTranslation;
