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
      // rounded-lg / xl / 2xl / 3xl all resolve to the card radius, so cards, buttons, inputs and icon tiles match.
      // Change --radius in src/styles/index.css to restyle them together; rounded-full / rounded-md stay as they are.
      borderRadius: {
        lg: 'var(--radius)',
        xl: 'var(--radius)',
        '2xl': 'var(--radius)',
        '3xl': 'var(--radius)',
        md: 'var(--radius-sm)', // icon tiles: half the card radius
        full: 'var(--radius-sm)', // no circles or pills anywhere: former rounded-full elements are rounded squares
      },
      colors: {
        // Values come from CSS custom properties so the user-selected theme
        // color (ThemeColorMenuButton) can override them at runtime; defaults
        // live in src/styles/index.css. Plain var() colors cannot take an opacity
        // modifier in Tailwind (bg-primary-500/10, dark:bg-primary-900/30 would
        // silently not be generated), so build them with color-mix().
        primary: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [
            k,
            ({ opacityValue }) =>
              opacityValue === undefined || String(opacityValue).includes("var(")
                ? `var(--color-primary-${k})`
                : `color-mix(in srgb, var(--color-primary-${k}) calc(${opacityValue} * 100%), transparent)`,
          ])
        ),
        'on-primary': 'var(--on-primary)',
        slate: {
          950: '#000000', // Dark section / card surface: pure black (matches --bg-surface in dark mode)
          900: '#000000', // Same as 950
          800: '#111113', // Raised/secondary dark surface (matches --bg-surface-secondary)
          700: '#52525b', // Dark borders (matches --border-primary in dark mode)
          600: '#71717a',
          // Light mode text on white / #f1f1f1 / tinted chips needs >= 4.5:1, so 400 and 500 darken in light mode
          // and keep the original slate values in dark mode (channels defined in src/styles/index.css).
          500: 'rgb(var(--slate-500) / <alpha-value>)',
          400: 'rgb(var(--slate-400) / <alpha-value>)',
        },
        gray: {
          500: 'rgb(var(--gray-500) / <alpha-value>)',
          400: 'rgb(var(--gray-400) / <alpha-value>)',
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
        'aajexam-dark': 'linear-gradient(to bottom, #000000, #111113)',
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
        'fade-in': 'fadeIn 0.5s ease-out',
        'hero-pulse': 'heroPulse 2.2s ease-in-out infinite',
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
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        heroPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 transparent' },
          '50%': { boxShadow: '0 0 0 4px color-mix(in srgb, var(--color-primary-600) 28%, transparent)' },
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
