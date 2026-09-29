import { createSlice } from '@reduxjs/toolkit';
import { applyTextSize, DEFAULT_TEXT_SIZE_ID } from '../lib/textSize';

const getInitialSizeId = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('textSizeId');
    if (saved) return saved;
  }
  return DEFAULT_TEXT_SIZE_ID;
};

const textSizeSlice = createSlice({
  name: 'textSize',
  initialState: {
    sizeId: getInitialSizeId(),
  },
  reducers: {
    setTextSize: (state, action) => {
      state.sizeId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('textSizeId', action.payload);
        applyTextSize(action.payload);
      }
    },
    initializeTextSize: (state) => {
      // Re-read from localStorage on client to fix SSR hydration mismatch,
      // same rationale as initializeDarkMode/initializeThemeColor.
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('textSizeId') || DEFAULT_TEXT_SIZE_ID;
        state.sizeId = saved;
        applyTextSize(saved);
      }
    },
  },
});

export const { setTextSize, initializeTextSize } = textSizeSlice.actions;
export default textSizeSlice.reducer;
