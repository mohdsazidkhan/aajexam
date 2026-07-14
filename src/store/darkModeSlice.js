import { createSlice } from '@reduxjs/toolkit';

// Initialize dark mode from localStorage or system preference
const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
  }
  return process.env.NEXT_PUBLIC_DEFAULT_THEME === 'dark';
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
      // Re-read from localStorage on client to fix SSR hydration mismatch.
      // On the server, getInitialDarkMode() returns false (no window), so Redux
      // starts with isDark=false. This action is called in useEffect (client-only)
      // and re-reads the real preference before syncing the DOM.
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        state.isDark = shouldBeDark;
        const root = window.document.documentElement;
        if (shouldBeDark) {
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

