'use client';

/**
 * EN ⇄ हिं toggle used during quiz / practice-test attempts.
 * Only two languages by design — one tap flips the current question.
 */
const LanguageToggle = ({ language, onToggle, translating = false, className = '' }) => (
  <button
    type="button"
    onClick={onToggle}
    title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    className={className}
  >
    {translating && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
    <span>{language === 'en' ? 'EN' : 'हिं'}</span>
  </button>
);

export default LanguageToggle;
