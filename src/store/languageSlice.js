import { createSlice } from '@reduxjs/toolkit';

// Only English ⇄ Hindi is supported; older saved codes fall back to English.
const normalizeLanguage = (lang) => (lang === 'hi' ? 'hi' : 'en');

// Initialize language from localStorage or default to English
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('pageLanguage');
    if (savedLanguage) return normalizeLanguage(savedLanguage);
  }
  return 'en';
};

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    currentLanguage: getInitialLanguage(),
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

