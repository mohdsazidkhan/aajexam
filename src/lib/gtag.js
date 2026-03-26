// Minimal Google Analytics (gtag.js) helper for Next.js
// Reads measurement ID from NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';

export function pageview(url) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === 'undefined') return;
  if (window.location.hostname === 'localhost') return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function event(action, { category, label, value } = {}) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === 'undefined') return;
  if (window.location.hostname === 'localhost') return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}


