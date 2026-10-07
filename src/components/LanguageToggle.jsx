'use client';

import useTranslate from '../hooks/useTranslate';

/**
 * EN ⇄ हिं toggle used during quiz / practice-test attempts.
 * Only two languages by design — one tap flips the current question.
 */
const LanguageToggle = ({ language, onToggle, translating = false, className = '' }) => {
  const { translate } = useTranslate();
  const label = language === 'en' ? translate('Switch to Hindi') : translate('Switch to English');
  return (
  <button
    type="button"
    onClick={onToggle}
    title={label}
    aria-label={label}
    className={className}
  >
    {translating && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"/>}
    <span>{language === 'en' ? 'EN' : 'हिं'}</span>
  </button>
  );
};

export default LanguageToggle;
