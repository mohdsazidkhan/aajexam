import React from 'react';
import { m as motion } from 'framer-motion';

/**
 * PageHero - the shared "ticket" header used across student pages (same visual language as
 * the Profile admit card): light tint in light mode, deep green in dark mode, gold icon tile,
 * optional scorecard strip of stats and a right-hand actions slot.
 *
 * Radii are inline on purpose: styles/index.css forces every [class*="rounded"] to a flat
 * 8px with !important, so shaped corners / circles can't use `rounded-*` classes.
 *
 * props:
 *   icon     lucide icon component for the gold tile
 *   eyebrow  small uppercase line above the title (already translated)
 *   title    page title (already translated)
 *   subtitle optional one-liner under the title (already translated)
 *   badge    optional small gold pill next to the title (already translated)
 *   actions  optional node rendered on the right (buttons)
 *   center   optional node (e.g. a search box) rendered between the title and the actions on desktop
 *   stats    optional [{ label, value, icon }] rendered as a scorecard strip
 */
const PageHero = ({ icon: Icon, eyebrow, title, subtitle, badge, actions, center, stats, children, className = '' }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 text-slate-900 shadow-xl ring-1 ring-primary-200 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 dark:text-white dark:ring-white/10 ${className}`}
    style={{ borderRadius: 16 }}
  >
    <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
    <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
    <div className="pointer-events-none absolute -bottom-28 right-24 w-80 h-80 bg-amber-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
    {Icon && <Icon className="pointer-events-none absolute right-5 top-4 w-28 h-28 xl:w-36 xl:h-36 text-primary-600/10 dark:text-white/5 rotate-12" />}

    <div className="relative p-4 xl:p-6 space-y-4">
      <div className={`flex flex-col gap-4 xl:items-center ${center ? 'xl:grid xl:grid-cols-[1fr_minmax(0,22rem)_1fr]' : 'xl:flex-row xl:justify-between'}`}>
        <div className="flex items-center gap-3 xl:gap-4 min-w-0">
          {Icon && (
            <div className="shrink-0 w-12 h-12 xl:w-14 xl:h-14 flex items-center justify-center bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-lg rotate-[-4deg]" style={{ borderRadius: 14 }}>
              <Icon className="w-6 h-6 xl:w-7 xl:h-7" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-[10px] xl:text-xs font-black uppercase tracking-[0.25em] text-slate-500 dark:text-white/60 truncate">AajExam · {eyebrow}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl xl:text-3xl font-black font-outfit uppercase tracking-tight leading-tight">{title}</h1>
              {badge && (
                <span className="px-2 py-0.5 text-[9px] xl:text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 shadow-[0_2px_12px_rgba(251,191,36,0.4)]" style={{ borderRadius: 999 }}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="mt-1 text-xs xl:text-sm font-semibold text-slate-600 dark:text-white/75">{subtitle}</p>}
          </div>
        </div>
        {center && <div className="w-full min-w-0">{center}</div>}
        {actions && <div className="flex flex-wrap items-center gap-2 xl:justify-end min-w-0 max-w-full xl:shrink-0">{actions}</div>}
      </div>

      {stats?.length > 0 && (
        <div className="grid gap-2 border-t border-dashed border-primary-300 dark:border-white/25 pt-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` }}>
          {stats.map((st) => (
            <div key={st.label} className="relative overflow-hidden bg-white/80 hover:bg-white ring-1 ring-primary-200 dark:bg-white/10 dark:hover:bg-white/15 dark:ring-white/20 px-3 py-2.5 transition-colors" style={{ borderRadius: 10 }}>
              {st.icon && <st.icon className="absolute -right-1.5 -bottom-1.5 w-9 h-9 text-primary-600/10 dark:text-white/10" />}
              <p className="relative text-lg xl:text-xl font-black font-outfit leading-none text-primary-700 dark:text-amber-200 truncate">{st.value}</p>
              <p className="relative mt-1 text-[9px] xl:text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75 leading-tight truncate">{st.label}</p>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  </motion.section>
);

export default PageHero;
