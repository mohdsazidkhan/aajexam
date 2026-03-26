import { createSlice } from '@reduxjs/toolkit';

// Initialize dark mode from localStorage or system preference
const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
  }
  return false;
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
      }
    },
    initializeDarkMode: (state) => {
      // This action can be dispatched to ensure the DOM is in sync with the state
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (state.isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    },
  },
});

export const { toggleDarkMode, setDarkMode, initializeDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;

