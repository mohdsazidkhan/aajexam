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
        sans: ['var(--font-lato)', 'Lato', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f7fff0',
          100: '#edffdb',
          200: '#d9ffb8',
          300: '#bcff85',
          400: '#94f54d',
          500: '#58cc02', // AajExam Green
          600: '#46a302',
          700: '#357a02',
          800: '#2a6102',
          900: '#235002',
          950: '#173601',
        },
        slate: {
          950: '#0F1720', // Even darker for specific surfaces
          900: '#131f24', // AajExam Dark Background (matches --bg-page in dark mode)
          800: '#1c2d35', // AajExam Dark Card (matches --bg-surface in dark mode)
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
        'duo-secondary': '0 4px 0 0 #000000',
        'duo-accent': '0 4px 0 0 #000000',
        'duo-red': '0 4px 0 0 #000000',
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
    // Brand gradients (green / black / white only)
    'from-primary-100', 'via-slate-50', 'to-primary-100',
    'from-slate-100', 'via-primary-50', 'to-slate-100',
    'dark:from-primary-900', 'dark:via-slate-800', 'dark:to-primary-900',
    'dark:from-slate-900', 'dark:via-primary-900', 'dark:to-slate-900',
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
