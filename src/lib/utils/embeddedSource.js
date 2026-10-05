// Marker on Question / Topic rows that mirror the questions embedded in PracticeTest (PYQ + practice
// tests) into the `questions` collection so they share one id with translations, attempts and revision.
// Those rows are internal: inactive, never part of a quiz, and must not inflate catalogue/stat counts.
export const EMBEDDED_SOURCE = 'practice_embedded';
export const notEmbedded = { source: { $ne: EMBEDDED_SOURCE } };
