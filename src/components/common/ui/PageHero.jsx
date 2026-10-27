import React from 'react';
import { m as motion } from 'framer-motion';

/**
 * PageHero - the shared header used across student pages: flat bordered surface, outlined
 * icon tile, optional strip of stats and a right-hand actions slot.
 *
 * props:
 *   icon     lucide icon component for the gold tile
 *   eyebrow  small uppercase line above the title (already translated)
 *   title    page title (already translated)
 *   subtitle optional one-liner under the title (already translated)
 *   badge    optional small gold pill next to the title (already translated)
 *   actions  optional node rendered on the right (buttons)
 *   center   optional node (e.g. a search box) rendered between the title and the actions on desktop
 *   stats    optional [{ label, value }] rendered as compact cells in the top row, before the actions
 */
const PageHero = ({ icon: Icon, eyebrow, title, subtitle, badge, actions, center, stats, children, className = '' }) => (
  <motion.header
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`z-auto relative overflow-hidden bg-background-surface text-content-primary border border-border-primary ${className}`}
    style={{ borderRadius: 20 }}
  >

    <div className="relative p-4 xl:p-6 space-y-4">
      <div className={`flex flex-col gap-4 xl:items-center ${center ? 'xl:grid xl:grid-cols-[1fr_minmax(0,22rem)_1fr]' : 'xl:flex-row xl:justify-between'}`}>
        <div className="flex items-center gap-3 xl:gap-4 min-w-0">
          {Icon && (
            <div className="shrink-0 w-12 h-12 xl:w-14 xl:h-14 flex items-center justify-center border border-border-primary text-primary-600" style={{ borderRadius: 14 }}>
              <Icon className="w-6 h-6 xl:w-7 xl:h-7" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-600 truncate">AajExam · {eyebrow}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl xl:text-3xl font-extrabold font-outfit tracking-tight leading-tight">{title}</h1>
              {badge && (
                <span className="px-2.5 py-0.5 text-xs font-bold border border-border-primary text-primary-600" style={{ borderRadius: 999 }}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="mt-1 text-sm font-medium text-content-secondary">{subtitle}</p>}
          </div>
        </div>
        {center && <div className="w-full min-w-0">{center}</div>}
        {(actions || stats?.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end min-w-0 max-w-full xl:shrink-0">
            {stats?.map((st) => (
              <div key={st.label} className="border border-border-primary px-3 py-1.5 min-w-[88px]" style={{ borderRadius: 10 }}>
                <p className="text-lg font-extrabold font-outfit leading-none text-content-primary whitespace-nowrap">{st.value}</p>
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-content-secondary whitespace-nowrap">{st.label}</p>
              </div>
            ))}
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  </motion.header>
);

export default PageHero;
