// Comfort / accessibility switches shown in the settings drawer's "Display" tab. Each one is a
// plain on/off flag, mirrored as a `data-*` attribute on <html> so CSS (styles/displayModes.css)
// can react without any component knowing about it.
export const DISPLAY_PREFS = [
  { key: 'liteMode', attr: 'data-lite' },
  { key: 'reduceMotion', attr: 'data-reduce-motion' },
  { key: 'eyeComfort', attr: 'data-eye-comfort' },
  { key: 'pureBlack', attr: 'data-pure-black' },
  { key: 'colorBlind', attr: 'data-color-blind' },
];

export const DISPLAY_PREF_KEYS = DISPLAY_PREFS.map((pref) => pref.key);

export function readDisplayPref(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function applyDisplayPref(key, on) {
  if (typeof document === 'undefined') return;
  const pref = DISPLAY_PREFS.find((p) => p.key === key);
  if (!pref) return;
  const root = document.documentElement;
  if (on) root.setAttribute(pref.attr, '1');
  else root.removeAttribute(pref.attr);
}

export function persistDisplayPref(key, on) {
  try {
    localStorage.setItem(key, on ? '1' : '0');
  } catch {
    // storage blocked: the switch still works for this visit
  }
}
