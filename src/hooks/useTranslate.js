'use client';

import { createElement, Fragment, useCallback } from 'react';
import { useSelector } from 'react-redux';
import HI from '../lib/i18n/hi';
import HINGLISH from '../lib/i18n/hinglish';
import { translateName } from '../lib/i18n/hiNames';

// Looks up `text` (the English source string) in the Hindi dictionary.
// Anything without an entry falls back to the English text, so a missing
// translation can never break or blank a screen.
// Placeholders: translate('Welcome back, {name}', { name }) -> vars are
// substituted after the lookup, so the dictionary keys keep the {name} token.
export const translateText = (lang, text, vars) => {
  let out = text;
  if (typeof text === 'string') {
    if (lang === 'hi') out = HI[text] || text;
    else if (lang === 'hinglish') out = HINGLISH[text] || text;
  }
  if (vars && typeof out === 'string') {
    out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined ? m : vars[k]));
  }
  return out;
};

// For code that is not a React component (toasts in lib/, alerts in hooks/): same dictionary,
// language read from the value the Language tab saves in localStorage.
export const translateNow = (text, vars) => {
  let lang = 'en';
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pageLanguage');
      if (saved === 'hi' || saved === 'hinglish') lang = saved;
    }
  } catch {
    // storage blocked: stay on English
  }
  return translateText(lang, text, vars);
};

const useTranslate = () => {
  const lang = useSelector((state) => state.language?.currentLanguage ?? 'en');
  const translate = useCallback((text, vars) => translateText(lang, text, vars), [lang]);

  // Styled fragments inside a sentence. Mark them <0>..</0>, <1>..</1> in the
  // string and pass one render function per index, so the Hindi word order can
  // differ from English and the styling still lands on the right words:
  //   rich('Reset <0>Password</0>', [(c) => <span className="x">{c}</span>])
  const rich = useCallback(
    (text, tags = []) => {
      const src = translateText(lang, text);
      return src.split(/(<\d>.*?<\/\d>)/g).map((part, i) => {
        const m = part.match(/^<(\d)>(.*)<\/\1>$/);
        if (!m || !tags[m[1]]) return part;
        return createElement(Fragment, { key: i }, tags[m[1]](m[2]));
      });
    },
    [lang]
  );

  // Names that come from the database (exam, subject, topic, state, quiz and test titles).
  // Unknown words stay English, so it is safe to wrap any such value.
  const translateData = useCallback((text) => (lang === 'hi' ? translateName(text) : text), [lang]);

  // BCP-47 locale for Intl / toLocaleDateString so dates follow the chosen language.
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';

  return { translate, translateData, rich, lang, locale };
};

export default useTranslate;
