'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import API from '../lib/api';
import { getCurrentUser } from '../lib/utils/authUtils';

// After login: cache the user's target exams for content filtering. (Asking users to
// pick them is done by CityPromptModal.)
const TargetExamPrompt = () => {
  const router = useRouter();

  // Runs on route changes too: login is a client-side navigation, so _app never remounts.
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    const key = `targetExamsSynced:${user._id || user.id || user.email}`;
    if (sessionStorage.getItem(key)) return;

    let cancelled = false;
    API.getProfile().then((res) => {
      if (cancelled || !res?.success) return;
      sessionStorage.setItem(key, 'true');
      const u = res.user || {};
      const ids = (u.targetExams || []).map((e) => String(e?._id || e));
      // Content filters read targetExams from the cached user, so keep it fresh.
      const stored = getCurrentUser();
      if (stored) localStorage.setItem('userInfo', JSON.stringify({ ...stored, targetExams: ids, primaryTargetExam: u.primaryTargetExam }));
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [router.pathname]);

  return null;
};

export default TargetExamPrompt;
