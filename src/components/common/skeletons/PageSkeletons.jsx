import React from 'react';

// Page-shaped loading skeletons. Each one mirrors the real page's layout (same grids, same
// column counts per breakpoint, same card chrome) so the page does not jump when data arrives.

const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg ${className}`} />
);

const CARD = 'bg-background-surface rounded-2xl border border-border-primary';
const CHIP = 'bg-background-surface rounded-xl border border-border-primary';

// ─── Building blocks ────────────────────────────────────────────────────────

export const TitleRowSkeleton = ({ action = false, icon = false }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      {icon && <Sh className="w-6 h-6 rounded-lg" />}
      <Sh className="h-6 xl:h-8 w-44 xl:w-60 rounded-lg" />
    </div>
    {action && <Sh className="h-9 xl:h-10 w-28 xl:w-36 rounded-xl" />}
  </div>
);

// Compact stat chips: icon + number + label on one line.
export const StatChipsSkeleton = ({ count = 4, cols = 'grid-cols-2 sm:grid-cols-4' }) => (
  <div className={`grid ${cols} gap-2`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${CHIP} flex items-center gap-2.5 p-2.5`}>
        <Sh className="w-9 h-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Sh className="h-4 w-10 rounded-md" />
          <Sh className="h-2 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const TabsRowSkeleton = ({ count = 5 }) => (
  <div className="flex gap-1.5 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <Sh key={i} className="h-8 w-24 rounded-full shrink-0" />
    ))}
  </div>
);

// Responsive card grid. variant picks the card's inner shape.
export const CardGridSkeleton = ({
  count = 6,
  cols = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  variant = 'text',
}) => (
  <div className={`grid ${cols} gap-3 xl:gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${CARD} p-3 xl:p-4 flex flex-col gap-3`}>
        {variant === 'media' && <Sh className="w-full h-28 rounded-xl" />}
        {variant === 'icon-title' ? (
          <div className="flex items-center gap-3">
            <Sh className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Sh className="h-4 w-3/4 rounded-md" />
              <Sh className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Sh className="h-4 w-4/5 rounded-md" />
            <Sh className="h-3 w-3/5 rounded-md" />
          </div>
        )}
        {variant === 'stats' && (
          <>
            <Sh className="h-1.5 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-primary">
              {[0, 1, 2].map((k) => <Sh key={k} className="h-8 rounded-md" />)}
            </div>
          </>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <Sh className="h-3 w-20 rounded-md" />
          <Sh className="h-7 w-24 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export const RowsSkeleton = ({ rows = 6 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`${CARD} p-3 flex items-center gap-3`}>
        <Sh className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Sh className="h-3.5 w-2/3 max-w-sm rounded-md" />
          <Sh className="h-2.5 w-1/3 max-w-[10rem] rounded-md" />
        </div>
        <Sh className="h-6 w-14 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);

// Horizontal-scroll on small screens, N-column grid on web (home sections).
const SectionGridSkeleton = ({ cols = 'xl:grid-cols-6', items = 6, itemHeight = 'h-32' }) => (
  <div className={`flex gap-3 overflow-hidden xl:grid ${cols}`}>
    {Array.from({ length: items }).map((_, i) => (
      <Sh key={i} className={`${itemHeight} min-w-[140px] xl:min-w-0 flex-1 rounded-2xl`} />
    ))}
  </div>
);

const SectionHeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <Sh className="w-9 h-9 rounded-xl" />
      <Sh className="h-5 w-28 rounded-md" />
    </div>
    <Sh className="h-7 w-20 rounded-full" />
  </div>
);

// ─── Student home / dashboard ───────────────────────────────────────────────

export const HomeDashboardSkeleton = () => (
  <div className="space-y-4 xl:space-y-6 font-outfit mt-4 xl:mt-6">
    {/* 9 stat chips: 2 / 3 / 9 columns */}
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-1.5 md:gap-2 xl:gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`${CHIP} flex items-center xl:flex-col gap-1.5 p-2 xl:p-2.5`}>
          <Sh className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1 xl:w-full">
            <Sh className="h-3.5 w-10 xl:mx-auto rounded-md" />
            <Sh className="h-2 w-14 xl:mx-auto rounded-full" />
          </div>
        </div>
      ))}
    </div>

    {/* 6 quick actions: 2 / 3 / 6 columns */}
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-1.5 xl:gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`${CHIP} flex items-center gap-2 p-1.5 xl:p-3`}>
          <Sh className="w-6 h-6 xl:w-9 xl:h-9 rounded-md xl:rounded-xl shrink-0" />
          <Sh className="h-3 w-16 rounded-md" />
        </div>
      ))}
    </div>

    {/* exams / quizzes / subjects / topics rows: 6-col grid on web */}
    {[0, 1, 2, 3].map((i) => (
      <div key={i}>
        <SectionHeaderSkeleton />
        <SectionGridSkeleton cols="xl:grid-cols-6" items={6} itemHeight="h-32" />
      </div>
    ))}

    {/* reels + blogs: 1 / 2 / 4 columns */}
    {[0, 1].map((i) => (
      <div key={i}>
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, k) => <Sh key={k} className="h-36 rounded-2xl" />)}
        </div>
      </div>
    ))}
  </div>
);

// One home section while only that section loads.
export const HomeSectionSkeleton = () => (
  <SectionGridSkeleton cols="xl:grid-cols-6" items={6} itemHeight="h-32" />
);

// ─── Student pages ──────────────────────────────────────────────────────────

// Bookmarks / My Reels / My Q&A / Reels saved: title + 3-col cards.
export const CardsPageSkeleton = ({ action = false, count = 6, variant = 'media' }) => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <TitleRowSkeleton action={action} />
    <CardGridSkeleton count={count} variant={variant} />
  </div>
);

// Quiz History / Exam History: title + filter, 3-col stat cards.
export const HistoryPageSkeleton = ({ count = 6 }) => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <TitleRowSkeleton action />
    <CardGridSkeleton count={count} variant="stats" />
  </div>
);

// My Challenges: 3-col cards with a header block and opponent list.
export const ChallengesPageSkeleton = ({ count = 3 }) => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <TitleRowSkeleton />
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${CARD} overflow-hidden`}>
          <div className="p-4 bg-background-surface-secondary space-y-3">
            <Sh className="h-3 w-40 rounded-md" />
            <Sh className="h-5 w-3/4 rounded-md" />
            <Sh className="h-3 w-1/2 rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              <Sh className="h-14 rounded-xl" />
              <Sh className="h-14 rounded-xl" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <Sh className="h-3 w-32 rounded-md" />
            <Sh className="h-14 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const NotificationsPageSkeleton = ({ rows = 7 }) => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <TitleRowSkeleton action />
    <RowsSkeleton rows={rows} />
  </div>
);

// Payment history: title, 3 stat chips, rows.
export const PaymentsPageSkeleton = () => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <TitleRowSkeleton action />
    <StatChipsSkeleton count={3} cols="grid-cols-3" />
    <RowsSkeleton rows={5} />
  </div>
);

// Revision queue: title, 4 chips, tabs, one review card with 2-col options.
export const RevisionPageSkeleton = () => (
  <div className="space-y-2 xl:space-y-4 font-outfit">
    <TitleRowSkeleton icon />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[0, 1, 2, 3].map((i) => <Sh key={i} className="h-9 rounded-xl" />)}
    </div>
    <TabsRowSkeleton count={5} />
    <div className={`${CARD} p-3 xl:p-5 space-y-3`}>
      <div className="flex justify-between"><Sh className="h-3 w-24 rounded-md" /><Sh className="h-3 w-20 rounded-md" /></div>
      <Sh className="h-1 w-full rounded-full" />
      <Sh className="h-5 w-4/5 rounded-md" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 xl:gap-3">
        {[0, 1, 2, 3].map((i) => <Sh key={i} className="h-12 rounded-xl" />)}
      </div>
      <Sh className="h-11 w-full rounded-xl" />
    </div>
  </div>
);

// Settings: title + tabs on one row, full-width form in a 3-col grid.
export const SettingsPageSkeleton = () => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <div className="flex items-center justify-between gap-3">
      <Sh className="h-6 xl:h-8 w-32 rounded-lg" />
      <div className="flex gap-1">{[0, 1, 2].map((i) => <Sh key={i} className="h-9 w-20 rounded-lg" />)}</div>
    </div>
    <div className={`${CARD} p-3 xl:p-5 space-y-3 xl:space-y-4`}>
      <div className="flex items-center justify-between">
        <Sh className="h-6 w-36 rounded-md" />
        <Sh className="w-9 h-9 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Sh className="h-3 w-24 rounded-md" />
            <Sh className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Sh className="h-16 w-full rounded-xl" />
      <div className="flex justify-end"><Sh className="h-10 w-full xl:w-40 rounded-xl" /></div>
    </div>
  </div>
);

// My Analytics: hero strip, tabs, 8 tiles (2 / 4 cols), 3-col subject cards.
export const AnalyticsPageSkeleton = () => (
  <div className="space-y-2 xl:space-y-3 font-outfit">
    <div className="rounded-2xl animate-pulse bg-primary-500/15 dark:bg-primary-500/20 h-20 xl:h-24" />
    <TabsRowSkeleton count={6} />
    <StatChipsSkeleton count={8} cols="grid-cols-2 sm:grid-cols-4" />
    <Sh className="h-6 w-48 rounded-md" />
    <CardGridSkeleton count={3} cols="grid-cols-1 xl:grid-cols-3" />
  </div>
);

// Referral history: title + code card, 5 chips, payout card, breakdown, table.
export const ReferralPageSkeleton = () => (
  <div className="space-y-2 xl:space-y-3 font-outfit">
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
      <div className="flex items-center gap-3"><Sh className="w-10 h-10 rounded-xl" /><Sh className="h-7 w-56 rounded-lg" /></div>
      <Sh className="h-16 w-full xl:w-[300px] rounded-xl" />
    </div>
    <StatChipsSkeleton count={5} cols="grid-cols-2 xl:grid-cols-5" />
    <Sh className="h-16 w-full rounded-2xl" />
    <Sh className="h-6 w-40 rounded-md" />
    <RowsSkeleton rows={4} />
  </div>
);

// Leaderboard / All India Rank: 2-part hero, 5 chips, ranking rows.
export const RankPageSkeleton = () => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <div className={`${CARD} p-3 xl:p-6 grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-6 items-center`}>
      <div className="space-y-2 flex flex-col items-center xl:items-start">
        <Sh className="h-7 w-56 rounded-lg" />
        <Sh className="h-10 w-full max-w-sm rounded-xl" />
        <Sh className="h-3 w-48 rounded-md" />
      </div>
      <div className="flex items-end justify-center gap-3">
        <Sh className="w-14 sm:w-20 h-24 rounded-t-xl" />
        <Sh className="w-14 sm:w-20 h-32 rounded-t-xl" />
        <Sh className="w-14 sm:w-20 h-20 rounded-t-xl" />
      </div>
    </div>
    <div className="flex justify-between items-center">
      <Sh className="h-4 w-32 rounded-md" />
      <Sh className="h-9 w-24 rounded-xl" />
    </div>
    <StatChipsSkeleton count={5} cols="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />
    <RowsSkeleton rows={8} />
  </div>
);

// Subscription: plan banner + 4 plans + payment history panel.
export const SubscriptionPageSkeleton = () => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <div className="rounded-2xl animate-pulse bg-primary-500/15 dark:bg-primary-500/20 h-24" />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => <Sh key={i} className="h-72 rounded-2xl" />)}
    </div>
    <div className={`${CARD} overflow-hidden`}>
      <Sh className="h-14 w-full rounded-none" />
      <div className="p-2 xl:p-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <Sh key={i} className="h-16 rounded-xl" />)}
      </div>
    </div>
  </div>
);

// Profile: mirrors the "student admit card" hero (header strip, photo + details, account tiles,
// footer actions | stat tiles + rank stub), the segmented tab bar and the first tab's cards.
export const ProfilePageSkeleton = () => (
  <div className="container mx-auto space-y-2 xl:space-y-4 mt-4 font-outfit">
    <div className="overflow-hidden bg-background-surface ring-1 ring-primary-200 dark:ring-white/10" style={{ borderRadius: 'var(--radius)' }}>
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 px-4 xl:px-6 py-2 dark:bg-black/25 border-b border-primary-200 dark:border-white/15">
        <div className="flex items-center gap-2">
          <Sh className="h-4 w-4 rounded-full" />
          <Sh className="h-3 w-40 rounded-md" />
          <Sh className="h-4 w-16 rounded-full" />
        </div>
        <Sh className="h-5 w-12 rounded-md" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px]">
        {/* Ticket body */}
        <div className="p-4 xl:p-6 space-y-4">
          <div className="flex items-start gap-4 xl:gap-6">
            <Sh className="w-20 h-24 sm:w-24 sm:h-28 xl:w-28 xl:h-32 rounded-md shrink-0" />
            <div className="flex-1 min-w-0 space-y-2.5">
              <Sh className="h-3 w-24 rounded-md" />
              <Sh className="h-8 xl:h-10 w-2/3 max-w-xs rounded-lg" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-md">
                {[0, 1, 2, 3].map((i) => <Sh key={i} className="h-8 rounded-md" />)}
              </div>
            </div>
          </div>
          <Sh className="h-4 w-full max-w-2xl rounded-md" />

          {/* Account details */}
          <div className="space-y-2">
            <Sh className="h-3 w-32 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => <Sh key={i} className="h-12 rounded-lg" />)}
            </div>
          </div>

          {/* Footer: actions + barcode */}
          <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-dashed border-border-primary">
            <div className="flex flex-wrap items-center gap-2">
              <Sh className="h-9 w-32 rounded-xl" />
              <Sh className="h-9 w-28 rounded-xl" />
              {[0, 1, 2, 3].map((i) => <Sh key={i} className="h-9 w-9 rounded-md" />)}
            </div>
            <Sh className="hidden sm:block h-10 w-28 rounded-md" />
          </div>
        </div>

        {/* Stub: stat tiles + AIR */}
        <div className="p-4 xl:p-6 dark:bg-black/20 border-t border-dashed border-primary-300 dark:border-white/35 xl:border-t-0 xl:border-l space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-dashed border-primary-300 dark:border-white/35">
            {Array.from({ length: 6 }).map((_, i) => <Sh key={i} className="h-12 rounded-lg" />)}
          </div>
          <Sh className="h-3 w-32 rounded-md" />
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
            <Sh className="h-16 rounded-lg" />
            <Sh className="h-16 rounded-lg" />
          </div>
          <Sh className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>

    {/* Segmented tab bar */}
    <div className="flex gap-1 p-1 w-fit max-w-full bg-background-surface ring-1 ring-primary-200 dark:ring-white/10" style={{ borderRadius: 'var(--radius)' }}>
      {[0, 1, 2].map((i) => <Sh key={i} className="h-9 w-28 rounded-lg shrink-0" />)}
    </div>

    {/* First tab: exam + quiz performance cards, side by side on desktop */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
      {[0, 1].map((i) => (
        <div key={i} className={`${CARD} p-4 space-y-3`}>
          <div className="flex items-center gap-2">
            <Sh className="h-8 w-8 rounded-lg" />
            <Sh className="h-4 w-40 rounded-md" />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => <Sh key={j} className="h-16 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Calendar-style / tracker pages: title, chips, list of cards.
export const ListPageSkeleton = ({ chips = 4, rows = 6, action = false }) => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <TitleRowSkeleton action={action} icon />
    {chips > 0 && <StatChipsSkeleton count={chips} cols="grid-cols-2 xl:grid-cols-4" />}
    <RowsSkeleton rows={rows} />
  </div>
);

// ─── Public pages ───────────────────────────────────────────────────────────

// Mentors: title + search + button row, 2-col cards.
export const MentorsPageSkeleton = () => (
  <div className="space-y-3 xl:space-y-4 font-outfit">
    <div className="flex flex-wrap items-center gap-2 xl:gap-4">
      <Sh className="h-7 w-full xl:w-44 rounded-lg" />
      <Sh className="h-10 flex-1 rounded-xl" />
      <Sh className="h-10 w-32 rounded-xl" />
    </div>
    <CardGridSkeleton count={4} cols="grid-cols-1 sm:grid-cols-2" variant="icon-title" />
  </div>
);
