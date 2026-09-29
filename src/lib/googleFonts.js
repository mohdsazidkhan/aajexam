// Curated list of Google Fonts that support the site's heavy use of bold/black
// (700-900) weights, so switching fonts doesn't break the design language.
export const DEFAULT_FONT = 'Lato';

export const GOOGLE_FONTS = [
  'Lato',
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Montserrat',
  'Nunito',
  'Nunito Sans',
  'Raleway',
  'Rubik',
  'Work Sans',
  'Manrope',
  'Mulish',
  'DM Sans',
  'Karla',
  'Quicksand',
  'Sora',
  'Urbanist',
  'Plus Jakarta Sans',
  'Outfit',
  'Space Grotesk',
  'Figtree',
  'Lexend',
  'Barlow',
  'Kanit',
  'Josefin Sans',
  'Oswald',
  'Archivo',
  'Titillium Web',
  'Cabin',
  'Heebo',
  'Hind',
  'IBM Plex Sans',
  'Jost',
  'Libre Franklin',
  'Maven Pro',
  'Overpass',
  'PT Sans',
  'Red Hat Display',
  'Rajdhani',
  'Saira',
  'Signika',
  'Ubuntu',
  'Varela Round',
  'Zilla Slab',
  'Exo 2',
  'Asap',
  'Catamaran',
  'Chivo',
  'Fira Sans',
];

const FONT_LINK_ID = 'dynamic-google-font';

function loadGoogleFont(fontName) {
  if (typeof document === 'undefined' || fontName === DEFAULT_FONT) return;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, '+')}:wght@400;500;600;700;800;900&display=swap`;
  let link = document.getElementById(FONT_LINK_ID);
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function applyFont(fontName) {
  if (typeof document === 'undefined') return;
  loadGoogleFont(fontName);
  document.documentElement.style.setProperty('--font-primary', `'${fontName}', var(--font-lato), sans-serif`);
}
