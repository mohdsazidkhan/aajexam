import { createSlice } from '@reduxjs/toolkit';
import { isSupportedLanguage } from '../lib/i18n/languages';

// Supported UI languages live in lib/i18n/languages.js; older or unknown saved codes fall back to English.
const normalizeLanguage = (lang) => (isSupportedLanguage(lang) ? lang : 'en');

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    // Always 'en' on the first render so SSR and hydration match; the saved
    // choice is applied right after mount by initializeLanguage().
    currentLanguage: 'en',
    // Language whose dictionary has finished downloading; useTranslate re-renders when it changes.
    loadedLanguage: 'en',
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
    setLoadedLanguage: (state, action) => {
      state.loadedLanguage = action.payload;
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

export const { setLanguage, setLoadedLanguage, setTranslations, setIsTranslating, initializeLanguage } = languageSlice.actions;
export default languageSlice.reducer;
