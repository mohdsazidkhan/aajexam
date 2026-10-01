/**
 * Browser-side error reporter -> POST /api/web-errors  (admin: /admin/web-errors).
 *
 * Reports: uncaught JS errors, unhandled promise rejections, React render crashes
 * (ErrorBoundary) and failed API calls (HTTP 5xx). Everything is best effort:
 * it can never throw, never retries, and never blocks the UI.
 */
const ENDPOINT = '/api/web-errors';
const MAX_PER_PAGE_LOAD = 20;       // hard cap so a render loop cannot flood the server
const DEDUPE_WINDOW_MS = 60 * 1000; // same error within a minute is sent once

let sent = 0;
const recent = new Map();

// Noise that is never actionable.
const IGNORED = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /Non-Error promise rejection captured/i,
  /AbortError/i,
  /extension:\/\//i,
  /chrome-extension|moz-extension|safari-extension/i,
  /Loading chunk .* failed|ChunkLoadError/i, // happens right after every deploy; the page reloads itself
];

const browserName = () => {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  const m = ua.match(/(Edg|OPR|Chrome|Firefox|Safari)\/([\d.]+)/);
  if (!m) return 'browser';
  return `${m[1] === 'Edg' ? 'Edge' : m[1] === 'OPR' ? 'Opera' : m[1]} ${m[2].split('.')[0]}`;
};

export function reportWebError({ type = 'js', message, errorName, stack, componentStack, endpoint, method, statusCode, extra } = {}) {
  try {
    if (typeof window === 'undefined') return;
    const msg = String(message || 'Unknown error');
    if (IGNORED.some((rx) => rx.test(msg) || rx.test(stack || ''))) return;
    if (endpoint && String(endpoint).includes(ENDPOINT)) return; // never report the reporter
    if (sent >= MAX_PER_PAGE_LOAD) return;

    const key = [type, msg, endpoint, statusCode].join('|');
    const now = Date.now();
    if (recent.get(key) && now - recent.get(key) < DEDUPE_WINDOW_MS) return;
    recent.set(key, now);
    sent += 1;

    const token = localStorage.getItem('token');
    fetch(ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        type,
        message: msg,
        errorName,
        stack,
        componentStack,
        endpoint,
        method,
        statusCode,
        screen: window.location.pathname,
        platform: browserName(),
        osVersion: navigator.platform || '',
        userAgent: navigator.userAgent,
        extra: { ...(extra || {}), viewport: `${window.innerWidth}x${window.innerHeight}`, referrer: document.referrer || undefined },
      }),
    }).catch(() => {});
  } catch (e) {
    // the reporter must never break the page
  }
}

let installed = false;
export function installGlobalErrorReporting() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (ev) => {
    // resource load failures (img/script) have no .error; skip them
    if (!ev.error && !ev.message) return;
    reportWebError({
      type: 'js',
      message: ev.message || ev.error?.message,
      errorName: ev.error?.name,
      stack: ev.error?.stack,
      extra: ev.filename ? { file: ev.filename, line: ev.lineno, col: ev.colno } : undefined,
    });
  });

  window.addEventListener('unhandledrejection', (ev) => {
    const r = ev.reason;
    reportWebError({
      type: 'promise',
      message: (r && (r.message || (typeof r === 'string' ? r : ''))) || 'Unhandled promise rejection',
      errorName: r?.name,
      stack: r?.stack,
    });
  });
}

/** Called from lib/api.js when a request fails with HTTP >= 500. */
export function reportApiFailure({ endpoint, method, statusCode, message }) {
  if (!(statusCode >= 500)) return;
  reportWebError({ type: 'api', message, endpoint, method: method || 'GET', statusCode });
}
