// Fonts offered in the Font Family tab: five English and five Hindi (Devanagari) fonts, all
// with the bold/black (700-900) weights the site's design language relies on.
export const DEFAULT_FONT = 'Lato';
export const HINDI_FONT = 'Hind';

export const ENGLISH_FONTS = ['Lato', 'Inter', 'Poppins', 'Roboto', 'Open Sans'];
export const HINDI_FONTS = ['Hind', 'Mukta', 'Noto Sans Devanagari', 'Baloo 2', 'Yantramanav'];
export const GOOGLE_FONTS = [...ENGLISH_FONTS, ...HINDI_FONTS];

// A font saved before the list was trimmed falls back to one that is still offered
// (a Hindi font when the site language is Hindi).
export function sanitizeFont(fontName, language) {
  if (GOOGLE_FONTS.includes(fontName)) return fontName;
  return language === 'hi' ? HINDI_FONT : DEFAULT_FONT;
}

const FONT_LINK_ID = 'dynamic-google-font';

function loadGoogleFont(fontName) {
  if (typeof document === 'undefined' || fontName === DEFAULT_FONT) return;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, '+')}:wght@400;500;600;700;800;900&display=swap`;
  let link = document.getElementById(FONT_LINK_ID);
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function applyFont(fontName) {
  if (typeof document === 'undefined') return;
  loadGoogleFont(fontName);
  document.documentElement.style.setProperty('--font-primary', `'${fontName}', var(--font-lato), sans-serif`);
}
