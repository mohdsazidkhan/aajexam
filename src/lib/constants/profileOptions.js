// Option lists for the optional "About you" fields on the Settings profile form. One source of truth
// for the form (pages/settings.js) and the server-side whitelist (api/auth/update-profile): a value
// that is not listed here is never stored. `label` is the English text the UI passes to translate().

export const QUALIFICATIONS = [
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'iti', label: 'ITI' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Post Graduate' },
  { value: 'phd', label: 'Doctorate (PhD)' },
  { value: 'other', label: 'Other' },
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// "How did you hear about us?" Brand names are shown as they are; the plain words are translated.
export const HEARD_FROM = [
  { value: 'x', label: 'X', brand: true },
  { value: 'facebook', label: 'Facebook', brand: true },
  { value: 'whatsapp', label: 'WhatsApp', brand: true },
  { value: 'telegram', label: 'Telegram', brand: true },
  { value: 'youtube', label: 'YouTube', brand: true },
  { value: 'instagram', label: 'Instagram', brand: true },
  { value: 'friend', label: 'Friend' },
  { value: 'google_search', label: 'Google Search' },
  { value: 'chatgpt', label: 'ChatGPT', brand: true },
  { value: 'gemini', label: 'Google Gemini', brand: true },
  { value: 'perplexity', label: 'Perplexity', brand: true },
  { value: 'bing', label: 'Bing Search' },
  { value: 'yahoo', label: 'Yahoo Search' },
  { value: 'grok', label: 'Grok', brand: true },
  { value: 'meta_ai', label: 'Meta AI', brand: true },
  { value: 'deepseek', label: 'DeepSeek', brand: true },
  { value: 'other', label: 'Any Other' },
];

export const QUALIFICATION_VALUES = QUALIFICATIONS.map((o) => o.value);
export const GENDER_VALUES = GENDERS.map((o) => o.value);
export const HEARD_FROM_VALUES = HEARD_FROM.map((o) => o.value);

// Date of birth accepted range: aged 10 to 100.
export const MIN_AGE_YEARS = 10;
export const MAX_AGE_YEARS = 100;
