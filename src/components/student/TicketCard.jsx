import React from 'react';

// Themed section card: green ticket header strip + body. Radii are inline on purpose —
// styles/index.css forces every [class*="rounded"] to a flat 8px with !important.
const TicketCard = ({ icon: Icon, title, subtitle, right, children, className = '' }) => (
  <section className={`overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md ${className}`} style={{ borderRadius: 16 }}>
    <div className="relative flex items-center justify-between gap-3 px-4 xl:px-6 py-3 bg-gradient-to-r from-slate-100 via-slate-50 to-white text-slate-900 border-b border-slate-200 dark:border-transparent dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
      <div className="relative flex items-center gap-3 min-w-0">
        <span className="shrink-0 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow" style={{ borderRadius: 10 }}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm xl:text-base font-black uppercase tracking-[0.14em] truncate">{title}</h2>
          {subtitle && <p className="text-[10px] xl:text-xs font-bold text-primary-800/70 dark:text-white/70 truncate">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="relative shrink-0">{right}</div>}
    </div>
    <div className="p-4 xl:p-6">{children}</div>
  </section>
);

export default TicketCard;
