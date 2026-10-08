// Generates a Tailwind-style 50-950 shade scale from a single base (500) hex
// color, so a theme's primary color can drive every `bg-primary-*` /
// `text-primary-*` class across the app.

// Curated theme presets — each has a light-mode hex and a dark-mode hex,
// so switching dark/light mode keeps the chosen theme legible on both backgrounds.
export const THEME_PRESETS = [
  { id: 'green', name: 'AajExam Default Light', darkName: 'AajExam Default Dark', light: '#45B800', dark: '#45B800' },
  { id: 'blue', name: 'Ocean Blue', darkName: 'Midnight Blue', light: '#2563EB', dark: '#60A5FA' },
  { id: 'indigo', name: 'Indigo Premium', darkName: 'Violet Night', light: '#6366F1', dark: '#A78BFA' },
  { id: 'orange', name: 'Orange Energy', darkName: 'Ember Dark', light: '#EA580C', dark: '#FB923C' },
  { id: 'cyan', name: 'Cyan Fresh', darkName: 'Cyber Cyan', light: '#0891B2', dark: '#22D3EE' },
  { id: 'red', name: 'Ruby Red', darkName: 'Crimson Night', light: '#DC2626', dark: '#F87171' },
  { id: 'rose', name: 'Rose Pink', darkName: 'Rose Night', light: '#E11D48', dark: '#FB7185' },
  { id: 'emerald', name: 'Emerald Fresh', darkName: 'Emerald Night', light: '#059669', dark: '#34D399' },
  { id: 'amber', name: 'Amber Gold', darkName: 'Golden Night', light: '#D97706', dark: '#FBBF24' },
  { id: 'teal', name: 'Teal Breeze', darkName: 'Teal Night', light: '#0F766E', dark: '#2DD4BF' },
  { id: 'sky', name: 'Sky Blue', darkName: 'Sky Night', light: '#0284C7', dark: '#38BDF8' },
  { id: 'purple', name: 'Royal Purple', darkName: 'Royal Night', light: '#7E22CE', dark: '#C084FC' },
  { id: 'forest', name: 'Forest Green', darkName: 'Forest Night', light: '#166534', dark: '#4ADE80' },
  { id: 'brown', name: 'Coffee Brown', darkName: 'Copper Night', light: '#92400E', dark: '#D97706' },
  { id: 'grey', name: 'Slate Grey', darkName: 'Carbon Night', light: '#475569', dark: '#A1A1AA' },
  { id: 'lime', name: 'Lime Burst', darkName: 'Lime Night', light: '#65A30D', dark: '#A3E635' },
  { id: 'magenta', name: 'Magenta Pop', darkName: 'Magenta Night', light: '#C026D3', dark: '#E879F9' },
  { id: 'periwinkle', name: 'Periwinkle', darkName: 'Periwinkle Night', light: '#4F46A5', dark: '#818CF8' },
  { id: 'coral', name: 'Peach Coral', darkName: 'Coral Night', light: '#F97360', dark: '#FB7185' },
  { id: 'olive', name: 'Moss Olive', darkName: 'Olive Night', light: '#687F3A', dark: '#A3A86B' },
  { id: 'aqua', name: 'Aqua Marine', darkName: 'Aqua Night', light: '#0D9488', dark: '#5EEAD4' },
  { id: 'plum', name: 'Plum Berry', darkName: 'Plum Night', light: '#86198F', dark: '#D946EF' },
  { id: 'sienna', name: 'Burnt Sienna', darkName: 'Sienna Night', light: '#C2410C', dark: '#FB923C' },
  { id: 'steel', name: 'Steel Blue', darkName: 'Steel Night', light: '#3B82A0', dark: '#7DD3FC' },
  { id: 'mustard', name: 'Mustard', darkName: 'Mustard Night', light: '#A16207', dark: '#FACC15' },
];

// One theme per UI language (light + dark variant). English reuses the default 'green' preset.
const LANGUAGE_THEME_DEFS = [
  ['hi', 'Saffron Green', 'India Green Night', '#EA7B0C', '#22C55E'],
  ['bn', 'Bengal Blue', 'Bengal Midnight', '#1D4ED8', '#60A5FA'],
  ['mr', 'Maharashtra Orange', 'Maratha Dark', '#F26B0F', '#D08A52'],
  ['te', 'Telugu Teal', 'Telugu Ocean', '#0E8F9A', '#2BB8D9'],
  ['ta', 'Tamil Maroon', 'Tamil Ruby Night', '#9F1239', '#F43F5E'],
  ['gu', 'Gujarat Blue', 'Gujarat Deep Blue', '#2563EB', '#5B8DEF'],
  ['ur', 'Royal Emerald', 'Emerald Night', '#059669', '#34D399'],
  ['kn', 'Karnataka Red', 'Karnataka Crimson', '#DC2626', '#FF5A6E'],
  ['or', 'Odisha Blue', 'Odisha Navy', '#1E40AF', '#6B8DE8'],
  ['ml', 'Kerala Green', 'Kerala Forest', '#16A34A', '#3FAE6A'],
  ['pa', 'Punjab Gold', 'Punjab Dark Gold', '#CA8A04', '#E0A82E'],
  ['as', 'Assam Red', 'Assam Burgundy', '#B91C1C', '#E0556B'],
  ['mai', 'Mithila Purple', 'Mithila Violet Night', '#7E22CE', '#A78BFA'],
  ['sat', 'Ol Chiki Green', 'Ol Chiki Forest', '#0F8F4A', '#2FBF71'],
  ['ks', 'Kashmir Sky', 'Kashmir Midnight', '#0EA5E9', '#6D8CFF'],
  ['ne', 'Himalayan Blue', 'Himalayan Night', '#1D5FB8', '#5AA0F0'],
  ['sd', 'Sindhi Turquoise', 'Sindhi Deep Teal', '#0D9488', '#1FA89A'],
  ['doi', 'Dogri Orange', 'Dogri Ember', '#EA580C', '#FF6B35'],
  ['kok', 'Konkan Coral', 'Konkan Deep Coral', '#E5533D', '#F07A66'],
  ['mni', 'Meitei Royal Blue', 'Meitei Royal Night', '#2F4FD6', '#7A8CFF'],
  ['brx', 'Bodo Forest', 'Bodo Deep Forest', '#1B7A3E', '#52C07A'],
  ['sa', 'Sanskrit Gold', 'Sanskrit Dark Gold', '#B8860B', '#E5B83A'],
  ['hinglish', 'AajExam Purple', 'AajExam Violet Night', '#7C3AED', '#A78BFA'],
];

export const LANGUAGE_THEME_PRESETS = LANGUAGE_THEME_DEFS.map(([lang, name, darkName, light, dark]) => (
  { id: `lang-${lang}`, lang, name, darkName, light, dark }
));
THEME_PRESETS.push(...LANGUAGE_THEME_PRESETS);

// Theme id that belongs to a UI language (English -> the default green).
export const themeIdForLanguage = (code) => (
  LANGUAGE_THEME_PRESETS.some((t) => t.lang === code) ? `lang-${code}` : DEFAULT_THEME_ID
);

export const DEFAULT_THEME_ID = 'green';

export function getThemeHex(themeId, isDark) {
  const theme = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  return isDark ? theme.dark : theme.light;
}

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

// How far each stop sits from the base color, toward white (<500) or black (>500).
const SHADE_WEIGHTS = {
  50: 0.95,
  100: 0.88,
  200: 0.72,
  300: 0.55,
  400: 0.28,
  500: 0,
  600: 0.13,
  700: 0.28,
  800: 0.42,
  900: 0.55,
  950: 0.7,
};

function hexToRgb(hex) {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('');
  }
  const num = parseInt(normalized, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
    .join('');
}

function mix(rgb, target, weight) {
  return {
    r: rgb.r + (target.r - rgb.r) * weight,
    g: rgb.g + (target.g - rgb.g) * weight,
    b: rgb.b + (target.b - rgb.b) * weight,
  };
}

export function generatePrimaryShades(baseHex) {
  const base = hexToRgb(baseHex);
  const shades = {};
  Object.entries(SHADE_WEIGHTS).forEach(([stop, weight]) => {
    const num = Number(stop);
    if (num < 500) shades[stop] = rgbToHex(mix(base, WHITE, weight));
    else if (num === 500) shades[stop] = rgbToHex(base);
    else shades[stop] = rgbToHex(mix(base, BLACK, weight));
  });
  return shades;
}

export function applyPrimaryColor(hex) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(generatePrimaryShades(hex)).forEach(([stop, value]) => {
    root.style.setProperty(`--color-primary-${stop}`, value);
  });
}

export function applyThemeForMode(themeId, isDark) {
  applyPrimaryColor(getThemeHex(themeId, isDark));
}
