import { createSlice } from '@reduxjs/toolkit';
import { applyThemeForMode, DEFAULT_THEME_ID } from '../lib/colorShades';

const getInitialThemeId = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('themeId');
    if (saved) return saved;
  }
  return DEFAULT_THEME_ID;
};

const isDarkModeActive = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

const themeColorSlice = createSlice({
  name: 'themeColor',
  initialState: {
    themeId: getInitialThemeId(),
  },
  reducers: {
    setThemeId: (state, action) => {
      state.themeId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeId', action.payload);
        applyThemeForMode(action.payload, isDarkModeActive());
      }
    },
    initializeThemeColor: (state) => {
      // Re-read from localStorage on client to fix SSR hydration mismatch,
      // same rationale as initializeDarkMode.
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('themeId') || DEFAULT_THEME_ID;
        state.themeId = saved;
        applyThemeForMode(saved, isDarkModeActive());
      }
    },
  },
});

export const { setThemeId, initializeThemeColor } = themeColorSlice.actions;
export default themeColorSlice.reducer;
