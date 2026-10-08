import { LANGUAGES } from './i18n/languages';

// Font Family tab: one best font per site language, shown as "Font - Language" (Lato - English, Inter - Hinglish,
// Hind - Hindi, ...). The font of each language is declared in lib/i18n/languages.js; choosing a language selects
// it, and any other font in the list can still be picked by hand. All have the bold/black (700-900) weights the
// site's design language relies on (a family without them just falls back to its heaviest weight).
export const DEFAULT_FONT = 'Inter';

export const LANGUAGE_FONTS = LANGUAGES.map((l) => ({ font: l.font, label: l.label, code: l.code, script: l.script }));
export const GOOGLE_FONTS = [...new Set([DEFAULT_FONT, ...LANGUAGE_FONTS.map((f) => f.font)])];
export const ENGLISH_FONTS = [...new Set([DEFAULT_FONT, ...LANGUAGE_FONTS.filter((f) => f.script === 'latin').map((f) => f.font)])];

// Fonts that can show a script, in language order (the first one is the script's default).
export const SCRIPT_FONTS = LANGUAGE_FONTS.reduce((acc, f) => {
  if (f.script !== 'latin') (acc[f.script] ||= []).includes(f.font) || acc[f.script].push(f.font);
  return acc;
}, { latin: ENGLISH_FONTS });

export const defaultFontForScript = (script) => (SCRIPT_FONTS[script] || ENGLISH_FONTS)[0];

// A saved font that is no longer offered falls back to the font of the saved language's script.
export function sanitizeFont(fontName, script) {
  if (GOOGLE_FONTS.includes(fontName)) return fontName;
  return defaultFontForScript(script);
}

const FONT_LINK_ID = 'dynamic-google-font';

function loadGoogleFont(fontName) {
  if (typeof document === 'undefined') return;
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
