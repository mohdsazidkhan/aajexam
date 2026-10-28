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
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-background-surface border border-border-primary text-xs font-bold uppercase tracking-[0.08em] text-primary-600 hover:-translate-y-0.5 transition-all ${className}`}
    style={{ borderRadius: 'var(--radius)' }}
  >
    {children}
  </button>
);

export default BackButton;
