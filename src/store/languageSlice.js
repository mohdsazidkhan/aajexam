import { createSlice } from '@reduxjs/toolkit';

// English, Hindi and Hinglish (Hindi in Roman script) are supported; older saved codes fall back to English.
const normalizeLanguage = (lang) => (lang === 'hi' || lang === 'hinglish' ? lang : 'en');

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    // Always 'en' on the first render so SSR and hydration match; the saved
    // choice is applied right after mount by initializeLanguage().
    currentLanguage: 'en',
    translations: {},
    isTranslating: false,
  },
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = normalizeLanguage(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pageLanguage', state.currentLanguage);
      }
    },
    setTranslations: (state, action) => {
      state.translations = action.payload;
    },
    setIsTranslating: (state, action) => {
      state.isTranslating = action.payload;
    },
    initializeLanguage: (state) => {
      // This action ensures the language is loaded from localStorage
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('pageLanguage');
        if (savedLanguage) {
          state.currentLanguage = normalizeLanguage(savedLanguage);
        }
      }
    },
  },
});

export const { setLanguage, setTranslations, setIsTranslating, initializeLanguage } = languageSlice.actions;
export default languageSlice.reducer;

