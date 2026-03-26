import { createSlice } from '@reduxjs/toolkit';

// Initialize language from localStorage or default to English
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('pageLanguage');
    if (savedLanguage) return savedLanguage;
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
      state.currentLanguage = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pageLanguage', action.payload);
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
          state.currentLanguage = savedLanguage;
        }
      }
    },
  },
});

export const { setLanguage, setTranslations, setIsTranslating, initializeLanguage } = languageSlice.actions;
export default languageSlice.reducer;

