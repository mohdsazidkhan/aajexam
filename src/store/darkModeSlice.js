import { createSlice } from '@reduxjs/toolkit';
import { applyThemeForMode, DEFAULT_THEME_ID } from '../lib/colorShades';

// Re-applies the user's chosen theme color for the given light/dark mode,
// so toggling dark mode keeps using that theme's correct-contrast variant.
const reapplyThemeColor = (isDark) => {
  if (typeof window === 'undefined') return;
  const themeId = localStorage.getItem('themeId') || DEFAULT_THEME_ID;
  applyThemeForMode(themeId, isDark);
};

// Initialize dark mode from localStorage or system preference
const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
  }
  return true; // dark is the default until the user picks a mode
};

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: {
    isDark: getInitialDarkMode(),
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.isDark = !state.isDark;
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (state.isDark) {
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        reapplyThemeColor(state.isDark);
      }
    },
    setDarkMode: (state, action) => {
      state.isDark = action.payload;
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (state.isDark) {
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        reapplyThemeColor(state.isDark);
      }
    },
    initializeDarkMode: (state) => {
      // Re-read from localStorage on client to fix SSR hydration mismatch.
      // On the server, getInitialDarkMode() returns false (no window), so Redux
      // starts with isDark=false. This action is called in useEffect (client-only)
      // and re-reads the real preference before syncing the DOM.
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        const shouldBeDark = savedTheme ? savedTheme === 'dark' : true;
        state.isDark = shouldBeDark;
        const root = window.document.documentElement;
        if (shouldBeDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        reapplyThemeColor(shouldBeDark);
      }
    },
  },
});

export const { toggleDarkMode, setDarkMode, initializeDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;

