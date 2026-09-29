import { createSlice } from '@reduxjs/toolkit';
import { applyFont, DEFAULT_FONT } from '../lib/googleFonts';

const getInitialFont = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fontFamily');
    if (saved) return saved;
  }
  return DEFAULT_FONT;
};

const fontSlice = createSlice({
  name: 'font',
  initialState: {
    fontFamily: getInitialFont(),
  },
  reducers: {
    setFontFamily: (state, action) => {
      state.fontFamily = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fontFamily', action.payload);
        applyFont(action.payload);
      }
    },
    initializeFont: (state) => {
      // Re-read from localStorage on client to fix SSR hydration mismatch,
      // same rationale as initializeDarkMode/initializeThemeColor.
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('fontFamily') || DEFAULT_FONT;
        state.fontFamily = saved;
        applyFont(saved);
      }
    },
  },
});

export const { setFontFamily, initializeFont } = fontSlice.actions;
export default fontSlice.reducer;
