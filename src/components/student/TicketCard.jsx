import React from 'react';

// Themed section card: green ticket header strip + body. Radii are inline on purpose —
// styles/index.css forces every [class*="rounded"] to a flat 8px with !important.
const TicketCard = ({ icon: Icon, title, subtitle, right, children, className = '' }) => (
  <section className={`overflow-hidden bg-background-surface border border-border-primary ${className}`} style={{ borderRadius: 16 }}>
    <section className="relative flex items-center justify-between gap-3 px-4 xl:px-6 py-3 text-content-primary border-b border-border-primary dark:border-transparent bg-background-surface">
      <div className="relative flex items-center gap-3 min-w-0">
        <span className="shrink-0 w-9 h-9 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 10 }}>
          <Icon className="w-4 h-4" />
        </span>
        <section className="min-w-0">
          <h2 className="text-sm xl:text-base font-bold uppercase tracking-[0.08em] tracking-[0.08em] leading-tight break-words sm:truncate">{title}</h2>
          {subtitle && <p className="text-[10px] xl:text-xs font-bold text-primary-800/70 dark:text-white/70 leading-tight break-words sm:truncate">{subtitle}</p>}
        </section>
      </div>
      {right && <div className="relative shrink-0">{right}</div>}
    </section>
    <div className="p-4 xl:p-6">{children}</div>
  </section>
);

export default TicketCard;
