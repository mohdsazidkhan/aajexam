import { createSlice } from '@reduxjs/toolkit';
import { DISPLAY_PREF_KEYS, applyDisplayPref, persistDisplayPref, readDisplayPref } from '../lib/displayPrefs';

// Starts all-off so server and first client render agree; initializeDisplay then reads the saved
// choices (same rationale as initializeTextSize / initializeDarkMode).
const initialState = DISPLAY_PREF_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {});

const displaySlice = createSlice({
  name: 'display',
  initialState,
  reducers: {
    setDisplayPref: (state, action) => {
      const { key, value } = action.payload;
      if (!DISPLAY_PREF_KEYS.includes(key)) return;
      state[key] = !!value;
      if (typeof window !== 'undefined') {
        persistDisplayPref(key, !!value);
        applyDisplayPref(key, !!value);
      }
    },
    initializeDisplay: (state) => {
      if (typeof window === 'undefined') return;
      DISPLAY_PREF_KEYS.forEach((key) => {
        const on = readDisplayPref(key);
        state[key] = on;
        applyDisplayPref(key, on);
      });
    },
  },
});

export const { setDisplayPref, initializeDisplay } = displaySlice.actions;
export default displaySlice.reducer;
