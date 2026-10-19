/**
 * First-party visitor beacon -> POST /api/track  (admin: /admin/traffic).
 * Keeps a random anonymous id in a 1-year cookie (`aj_vid`); no personal data is sent.
 * Best effort: never throws, never blocks, and is skipped for admin pages.
 */
const ENDPOINT = '/api/track';
const COOKIE = 'aj_vid';

let firstViewOfLoad = true;
let lastPath = '';

const randomId = () => {
  try {
    const a = new Uint8Array(12);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return Math.random().toString(16).slice(2, 14).padEnd(16, '0') + Date.now().toString(16);
  }
};

const getVid = () => {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{16,32})`));
  if (m) return m[1];
  const vid = randomId();
  document.cookie = `${COOKIE}=${vid}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  return vid;
};

export function trackPageView(path) {
  try {
    if (typeof window === 'undefined') return;
    const clean = String(path || '').split('?')[0].split('#')[0];
    if (!clean.startsWith('/') || clean.startsWith('/admin') || clean === lastPath) return;
    lastPath = clean;

    const body = JSON.stringify({
      vid: getVid(),
      path: clean,
      ref: firstViewOfLoad ? document.referrer : '',
      loggedIn: !!localStorage.getItem('token'),
    });
    firstViewOfLoad = false;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(ENDPOINT, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body });
    }
  } catch (e) {
    // analytics must never affect the visitor
  }
}
