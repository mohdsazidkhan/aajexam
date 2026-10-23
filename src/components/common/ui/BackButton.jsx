import React from 'react';

/**
 * BackButton - the one "Back" control used on detail pages. Render it inside a right-aligned
 * row (`flex justify-end`) so every page keeps it at the same spot. Children are the
 * caller's own (already translated) label, usually an arrow icon + text.
 * Radius is inline: styles/index.css forces every [class*="rounded"] to 8px !important.
 */
const BackButton = ({ onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-background-surface border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-black uppercase tracking-wider text-primary-700 dark:text-amber-300 hover:bg-primary-500/5 hover:-translate-y-0.5 transition-all ${className}`}
    style={{ borderRadius: 10 }}
  >
    {children}
  </button>
);

export default BackButton;
