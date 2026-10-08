// Single source of truth for the website UI languages (the Language tab in the settings drawer).
// Adding a language = one dictionary file in this folder (English source string -> text) + one entry below.
//   code      key saved in localStorage 'pageLanguage' and redux state.language.currentLanguage
//   native    name shown in its own script
//   locale    BCP-47 tag for Intl / toLocaleDateString
//   htmlLang  value for <html lang>
//   script    font group the language needs ('latin' needs no special font)
//   font      the language's one best Google font: picked when the language is chosen and listed as "Font - Language"
//             in the Font Family tab (the same font can serve several languages of one script)
//   speakers  approx. mother-tongue population (Census 2011), shown next to the name in the drawer
//   dir       'rtl' for right-to-left scripts (Urdu, Kashmiri); omitted = left-to-right
//   load      dynamic import, so only the chosen language's dictionary is downloaded
//   loadNames same for the names dictionary (exam / subject / topic titles from the database, see
//             nameEngine.js); optional, a language without it shows those names in English
// Quiz and test questions are NOT affected: they stay English/Hindi (separate system).
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', locale: 'en-IN', htmlLang: 'en', script: 'latin', font: 'Inter', speakers: '12.5 Cr', load: null },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', locale: 'hi-IN', htmlLang: 'hi', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '52.8 Cr', load: () => import('./hi'), loadNames: () => import('./hiNames') },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish', locale: 'en-IN', htmlLang: 'hi-Latn', script: 'latin', font: 'Inter', speakers: '18 Cr', load: () => import('./hinglish'), loadNames: () => import('./hinglishNames') },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', locale: 'bn-IN', htmlLang: 'bn', script: 'bengali', font: 'Noto Sans Bengali', speakers: '9.7 Cr', load: () => import('./bn'), loadNames: () => import('./bnNames') },
  { code: 'mr', label: 'Marathi', native: 'मराठी', locale: 'mr-IN', htmlLang: 'mr', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '8.3 Cr', load: () => import('./mr'), loadNames: () => import('./mrNames') },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', locale: 'te-IN', htmlLang: 'te', script: 'telugu', font: 'Noto Sans Telugu', speakers: '8 Cr', load: () => import('./te'), loadNames: () => import('./teNames') },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', locale: 'ta-IN', htmlLang: 'ta', script: 'tamil', font: 'Noto Sans Tamil', speakers: '7 Cr', load: () => import('./ta'), loadNames: () => import('./taNames') },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN', htmlLang: 'gu', script: 'gujarati', font: 'Noto Sans Gujarati', speakers: '5.5 Cr', load: () => import('./gu'), loadNames: () => import('./guNames') },
  { code: 'ur', label: 'Urdu', native: 'اردو', locale: 'ur-IN', htmlLang: 'ur', script: 'arabic', font: 'Noto Nastaliq Urdu', dir: 'rtl', speakers: '5 Cr', load: () => import('./ur'), loadNames: () => import('./urNames') },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN', htmlLang: 'kn', script: 'kannada', font: 'Noto Sans Kannada', speakers: '4.4 Cr', load: () => import('./kn'), loadNames: () => import('./knNames') },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', locale: 'or-IN', htmlLang: 'or', script: 'odia', font: 'Noto Sans Oriya', speakers: '3.8 Cr', load: () => import('./or'), loadNames: () => import('./orNames') },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', locale: 'ml-IN', htmlLang: 'ml', script: 'malayalam', font: 'Noto Sans Malayalam', speakers: '3.5 Cr', load: () => import('./ml'), loadNames: () => import('./mlNames') },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', locale: 'pa-IN', htmlLang: 'pa', script: 'gurmukhi', font: 'Noto Sans Gurmukhi', speakers: '3.3 Cr', load: () => import('./pa'), loadNames: () => import('./paNames') },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', locale: 'as-IN', htmlLang: 'as', script: 'bengali', font: 'Noto Sans Bengali', speakers: '1.5 Cr', load: () => import('./as'), loadNames: () => import('./asNames') },
  { code: 'mai', label: 'Maithili', native: 'मैथिली', locale: 'hi-IN', htmlLang: 'mai', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '1.4 Cr', load: () => import('./mai'), loadNames: () => import('./maiNames') },
  { code: 'sat', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', locale: 'sat-IN', htmlLang: 'sat', script: 'olchiki', font: 'Noto Sans Ol Chiki', speakers: '74 Lakh', load: () => import('./sat'), loadNames: () => import('./satNames') },
  { code: 'ks', label: 'Kashmiri', native: 'کٲشُر', locale: 'ks-IN', htmlLang: 'ks', script: 'arabic', dir: 'rtl', font: 'Noto Sans Arabic', speakers: '68 Lakh', load: () => import('./ks'), loadNames: () => import('./ksNames') },
  { code: 'ne', label: 'Nepali', native: 'नेपाली', locale: 'ne-IN', htmlLang: 'ne', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '29 Lakh', load: () => import('./ne'), loadNames: () => import('./neNames') },
  { code: 'sd', label: 'Sindhi', native: 'सिन्धी', locale: 'sd-IN', htmlLang: 'sd', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '28 Lakh', load: () => import('./sd'), loadNames: () => import('./sdNames') },
  { code: 'doi', label: 'Dogri', native: 'डोगरी', locale: 'doi-IN', htmlLang: 'doi', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '26 Lakh', load: () => import('./doi'), loadNames: () => import('./doiNames') },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी', locale: 'kok-IN', htmlLang: 'kok', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '23 Lakh', load: () => import('./kok'), loadNames: () => import('./kokNames') },
  { code: 'mni', label: 'Manipuri', native: 'ꯃꯩꯇꯩꯂꯣꯟ', locale: 'mni-IN', htmlLang: 'mni', script: 'meeteimayek', font: 'Noto Sans Meetei Mayek', speakers: '18 Lakh', load: () => import('./mni'), loadNames: () => import('./mniNames') },
  { code: 'brx', label: 'Bodo', native: 'बर’', locale: 'brx-IN', htmlLang: 'brx', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '15 Lakh', load: () => import('./brx'), loadNames: () => import('./brxNames') },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', locale: 'sa-IN', htmlLang: 'sa', script: 'devanagari', font: 'Noto Sans Devanagari', speakers: '25 Hazar', load: () => import('./sa'), loadNames: () => import('./saNames') },
];

export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

export const isSupportedLanguage = (code) => LANGUAGES.some((l) => l.code === code);

// Dictionaries already downloaded, by language code. Read synchronously by translateText() / getNames().
const dictionaries = {};
const nameSets = {};

export const getDictionary = (code) => dictionaries[code] || null;
export const getNames = (code) => nameSets[code] || null;

// Downloads (once) the dictionary and names dictionary of a language. Resolves for English / unknown codes too.
export const loadDictionary = async (code) => {
  const lang = getLanguage(code);
  const jobs = [];
  if (lang.load && !dictionaries[lang.code]) {
    jobs.push(lang.load().then((mod) => { dictionaries[lang.code] = mod.default; }));
  }
  if (lang.loadNames && !nameSets[lang.code]) {
    jobs.push(lang.loadNames().then((mod) => { nameSets[lang.code] = mod.default; }));
  }
  try {
    await Promise.all(jobs);
  } catch {
    // network failure: stay on English, the next language switch retries
  }
};
