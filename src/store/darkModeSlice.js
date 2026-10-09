import { createSlice } from '@reduxjs/toolkit';
import { applyThemeForMode, DEFAULT_THEME_ID } from '../lib/colorShades';

// Re-applies the user's chosen theme color for the given light/dark mode,
// so toggling dark mode keeps using that theme's correct-contrast variant.
const reapplyThemeColor = (isDark) => {
  if (typeof window === 'undefined') return;
  const themeId = localStorage.getItem('themeId') || DEFAULT_THEME_ID;
  applyThemeForMode(themeId, isDark);
};

// "Follow system" is stored as its own flag. The 'theme' key always keeps the resolved
// 'dark' / 'light' value, so everything else that reads it keeps working.
const FOLLOW_SYSTEM_KEY = 'themeFollowSystem';

// Following the device is the default: it is on unless the user switched it off ('0'), or an
// older visit already saved a manual Dark/Light choice (and never turned the flag on).
const readFollowSystem = () => {
  if (typeof window === 'undefined') return false;
  try {
    const flag = localStorage.getItem(FOLLOW_SYSTEM_KEY);
    if (flag === '1') return true;
    if (flag === '0') return false;
    return !localStorage.getItem('theme');
  } catch {
    return false;
  }
};

const systemPrefersDark = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;

// Writes the mode to the <html> class, localStorage and the theme color.
const applyMode = (isDark) => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  if (isDark) root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  reapplyThemeColor(isDark);
};

const setFollowFlag = (follow) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FOLLOW_SYSTEM_KEY, follow ? '1' : '0');
};

// Initialize dark mode from localStorage or system preference
const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    if (readFollowSystem()) return systemPrefersDark();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
  }
  return true; // server render only; the client re-reads the device setting on mount
};

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: {
    isDark: getInitialDarkMode(),
    followSystem: readFollowSystem(),
  },
  reducers: {
    // Picking a mode by hand turns "follow system" off.
    toggleDarkMode: (state) => {
      state.isDark = !state.isDark;
      state.followSystem = false;
      if (typeof window !== 'undefined') {
        setFollowFlag(false);
        applyMode(state.isDark);
      }
    },
    setDarkMode: (state, action) => {
      state.isDark = action.payload;
      state.followSystem = false;
      if (typeof window !== 'undefined') {
        setFollowFlag(false);
        applyMode(state.isDark);
      }
    },
    // Auto Dark/Light: on = mirror the device setting, off = keep the current mode.
    setFollowSystem: (state, action) => {
      state.followSystem = !!action.payload;
      if (typeof window !== 'undefined') {
        setFollowFlag(state.followSystem);
        if (state.followSystem) {
          state.isDark = systemPrefersDark();
          applyMode(state.isDark);
        }
      }
    },
    // Called when the device's light/dark setting changes.
    syncSystemTheme: (state) => {
      if (typeof window !== 'undefined' && state.followSystem) {
        state.isDark = systemPrefersDark();
        applyMode(state.isDark);
      }
    },
    initializeDarkMode: (state) => {
      // Re-read from localStorage on client to fix SSR hydration mismatch.
      // On the server, getInitialDarkMode() returns false (no window), so Redux
      // starts with isDark=false. This action is called in useEffect (client-only)
      // and re-reads the real preference before syncing the DOM.
      if (typeof window !== 'undefined') {
        const follow = readFollowSystem();
        const savedTheme = localStorage.getItem('theme');
        const shouldBeDark = follow ? systemPrefersDark() : (savedTheme ? savedTheme === 'dark' : true);
        state.followSystem = follow;
        state.isDark = shouldBeDark;
        const root = window.document.documentElement;
        if (shouldBeDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        if (follow) {
          setFollowFlag(true); // remember it, since 'theme' is saved from here on
          localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
        }
        reapplyThemeColor(shouldBeDark);
      }
    },
  },
});

export const { toggleDarkMode, setDarkMode, setFollowSystem, syncSystemTheme, initializeDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
