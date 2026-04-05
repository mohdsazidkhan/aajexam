/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f7fff0',
          100: '#edffdb',
          200: '#d9ffb8',
          300: '#bcff85',
          400: '#94f54d',
          500: '#58cc02', // Duolingo Green
          600: '#46a302',
          700: '#357a02',
          800: '#2a6102',
          900: '#235002',
        },
        secondary: {
          50: '#f0faff',
          100: '#e0f5ff',
          200: '#baeaff',
          300: '#7cd9ff',
          400: '#35c5ff',
          500: '#1cb0f6', // Duolingo Blue
          600: '#0097e0',
          700: '#007eb3',
          800: '#006a94',
          900: '#00587a',
        },
        accent: {
          orange: '#ffb020',
          red: '#ff4b4b',
          purple: '#ce82ff',
          yellow: '#ffdc00',
        },
        slate: {
          950: '#0F1720', // Even darker for specific surfaces
          900: '#131f24', // Duolingo Dark Background (matches --bg-page in dark mode)
          800: '#1c2d35', // Duolingo Dark Card (matches --bg-surface in dark mode)
          700: '#344955', // (matches --border-primary in dark mode)
          600: '#455a64',
          500: '#64748b',
          400: '#94a3b8',
        },
        // Semantic Theme Tokens
        background: {
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          'surface-secondary': 'var(--bg-surface-secondary)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
      },
      backgroundImage: {
        'aajexam-light': 'linear-gradient(to bottom, #f7f7f7, #ffffff)',
        'aajexam-dark': 'linear-gradient(to bottom, #131f24, #1c2d35)',
      },
      boxShadow: {
        'duo': '0 4px 0 0 rgba(0, 0, 0, 0.1)',
        'duo-primary': '0 4px 0 0 #46a302',
        'duo-secondary': '0 4px 0 0 #0097e0',
        'duo-accent': '0 4px 0 0 #e69e1c',
        'duo-red': '0 4px 0 0 #d94141',
        'duo-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'progress-fill': 'progress-fill 1s ease-out forwards',
        'bounce-soft': 'bounce-soft 0.5s ease-out',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Light gradients
    'from-green-100', 'via-blue-50', 'to-purple-100',
    'from-pink-100', 'via-yellow-50', 'to-red-100',
    'from-blue-100', 'via-indigo-50', 'to-cyan-100',
    'from-yellow-100', 'via-orange-50', 'to-pink-100',
    'from-purple-100', 'via-green-50', 'to-blue-100',
    'from-teal-100', 'via-lime-50', 'to-green-100',
    'from-red-100', 'via-pink-50', 'to-yellow-100',
    'from-indigo-100', 'via-blue-50', 'to-purple-100',
    'from-gray-100', 'via-gray-50', 'to-blue-100',
    // Dark gradients
    'dark:from-gray-900', 'dark:via-gray-800', 'dark:to-blue-900',
    'dark:from-purple-900', 'dark:via-blue-900', 'dark:to-green-900',
    'dark:from-blue-900', 'dark:via-indigo-900', 'dark:to-cyan-900',
    'dark:from-pink-900', 'dark:via-yellow-900', 'dark:to-red-900',
    'dark:from-green-900', 'dark:via-lime-900', 'dark:to-teal-900',
    'dark:from-red-900', 'dark:via-pink-900', 'dark:to-yellow-900',
    'dark:from-indigo-900', 'dark:via-blue-900', 'dark:to-purple-900',
    'dark:from-gray-800', 'dark:via-gray-900', 'dark:to-blue-900',
    // Gradient direction classes
    'bg-gradient-to-br',
    'bg-gradient-to-r',
    'bg-gradient-to-l',
    'bg-gradient-to-t',
    'bg-gradient-to-b',
    'bg-gradient-to-tr',
    'bg-gradient-to-tl',
    'bg-gradient-to-bl',
  ],
};
