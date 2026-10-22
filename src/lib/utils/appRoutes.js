import { useSyncExternalStore } from 'react';

// Public pages that a logged-in student also uses. They keep their public URL for
// logged-out visitors (and Google); logged-in students reach the same page under
// /student/... (next.config.mjs rewrites /student/<page> back to the public page).
export const SHARED_ROUTE_PREFIXES = [
  '/blog',
  '/quizzes',
  '/quiz',
  '/subjects',
  '/topics',
  '/govt-exams',
  '/community-questions',
  '/reels',
  '/daily-challenge',
  '/current-affairs',
  '/exam-news',
  '/notes',
  '/interview-questions',
  '/pyq',
  '/practice',
  '/mentors',
  '/mentor',
  '/search',
  '/features',
  '/flashcards',
];

const isShared = (path) =>
  SHARED_ROUTE_PREFIXES.some((prefix) => {
    if (!path.startsWith(prefix)) return false;
    const next = path.charAt(prefix.length);
    return next === '' || next === '/' || next === '?' || next === '#';
  });

// '/blog/x' -> '/student/blog/x' for shared pages; anything else is returned untouched.
export const toStudentPath = (href) => {
  if (typeof href !== 'string') return href;
  return isShared(href) ? `/student${href}` : href;
};

// Accepts a string or a { pathname, query } url object, like next/router does.
export const toStudentUrl = (url) => {
  if (typeof url === 'string') return toStudentPath(url);
  if (url && typeof url.pathname === 'string') return { ...url, pathname: toStudentPath(url.pathname) };
  return url;
};

// '/student/blog' -> '/blog' (for comparing against public route names).
export const stripStudent = (path) =>
  typeof path === 'string' ? path.replace(/^\/student(?=\/|$)/, '') || '/' : path;

// Canonical (public) path for a /student clone; student-only pages are left alone.
export const toPublicPath = (path) => {
  const stripped = stripStudent(path);
  return stripped !== path && isShared(stripped) ? stripped : path;
};

const readIsStudent = () => {
  try {
    if (!localStorage.getItem('token')) return false;
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return info?.role !== 'admin';
  } catch {
    return false;
  }
};

// Non-hook version for plain window.location navigation.
export const resolveAppPath = (href) => (readIsStudent() ? toStudentPath(href) : href);

const subscribe = (cb) => {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
};

// False on the server and during hydration, so public markup never mismatches.
export const useIsLoggedInStudent = () =>
  useSyncExternalStore(subscribe, readIsStudent, () => false);
