// Translates names that come from the database (exam, subject, topic, state, quiz and
// test titles) with a per-language phrase dictionary (see hiNames.js, teNames.js, ...).
// Titles are composed ("<Exam> - <Subject> PYQ Quiz 12"), so instead of one entry per
// title the dictionary is a set of phrases: the longest known phrases are swapped, digits
// and anything unknown stay as they are. Matching is case-insensitive and whole-word,
// e.g. "Msme Finance" and "MSME Finance" both hit the same entry.
// Exam acronyms (SSC, RRB, IBPS...) stay in Latin, as they are written in regional media too.

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const compiled = new Map(); // language code -> { lookup, matcher, cache }

const build = (phrases) => {
  const lookup = new Map();
  Object.keys(phrases).forEach((k) => lookup.set(k.toLowerCase(), phrases[k]));
  // Longest phrase first so "Delhi Police Constable- SSC" wins over "Delhi". The leading
  // group stands in for a lookbehind (older Safari throws on lookbehind regexes).
  const keys = Array.from(lookup.keys()).sort((a, b) => b.length - a.length).map(escapeRe);
  const matcher = new RegExp('(^|[^A-Za-z])(' + keys.join('|') + ')(?![A-Za-z])', 'gi');
  return { lookup, matcher, cache: new Map() };
};

export const translateNameWith = (code, phrases, text) => {
  if (typeof text !== 'string' || !text || !phrases) return text;
  let entry = compiled.get(code);
  if (!entry) {
    entry = build(phrases);
    compiled.set(code, entry);
  }
  const hit = entry.cache.get(text);
  if (hit !== undefined) return hit;
  const out = text.replace(entry.matcher, (m, lead, phrase) => lead + (entry.lookup.get(phrase.toLowerCase()) || phrase));
  entry.cache.set(text, out);
  return out;
};
