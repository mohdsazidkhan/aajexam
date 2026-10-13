import { Inter, Lato } from 'next/font/google';

// Default site font (DEFAULT_FONT in googleFonts.js). Self-hosted and preloaded by next/font, so the
// first paint already uses it: no render-blocking Google Fonts stylesheet and no font swap after hydration.
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: true,
});

// Fallback only (see --font-primary in styles/index.css): not preloaded, fetched only if ever needed.
export const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'optional',
  adjustFontFallback: true,
  preload: false,
});
