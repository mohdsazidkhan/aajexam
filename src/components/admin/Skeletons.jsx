import React from 'react';

// Basic shimmer block (mirrors PrivateSkeletons.jsx's local `Sh`)
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg xl:rounded-xl ${className}`} />
);

// Generic admin table page: filter/search bar + data table.
// Used for the bulk of admin list pages (students, referrals, quizzes, blogs, pyq, etc.)
export const AdminTableSkeleton = ({ rows = 8, columns = 6, showHeader = true, showFilters = true }) => (
  <div className="space-y-6 font-outfit w-full">
    {/* Header */}
    {showHeader && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Sh className="h-7 w-56 rounded-lg xl:rounded-xl" />
        <Sh className="h-10 w-36 rounded-2xl" />
      </div>
    )}

    {/* Filter bar */}
    {showFilters && (
      <div className="flex flex-col xl:flex-row gap-3">
        <Sh className="h-12 flex-1 rounded-2xl" />
        <Sh className="h-12 w-full xl:w-40 rounded-2xl" />
        <Sh className="h-12 w-full xl:w-40 rounded-2xl" />
      </div>
    )}

    {/* Table */}
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="flex gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Sh key={i} className="h-2.5 flex-1 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Sh key={c} className={`h-4 flex-1 rounded-lg ${c === 0 ? 'max-w-[2rem]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Main admin dashboard (/admin/dashboard): mirrors DashboardPage — 5 headline
// KPI cards, sectioned metric-card grids, then the Quick Links panel.
export const AdminMainDashboardSkeleton = ({ sectionCards = [8, 5, 9] }) => (
  <div className="w-full font-outfit">
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 xl:gap-5 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 shadow-sm p-3 xl:p-6 rounded-lg xl:rounded-[2.5rem]">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Sh className="h-2.5 w-24 rounded-full" />
              <Sh className="h-8 xl:h-10 w-20 rounded-lg" />
              <Sh className="h-2.5 w-28 rounded-full mt-6" />
            </div>
            <Sh className="w-10 h-10 xl:w-20 xl:h-20 rounded-lg xl:rounded-2xl" />
          </div>
        </div>
      ))}
    </div>

    {sectionCards.map((count, s) => (
      <div key={s} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Sh className="h-2.5 w-40 rounded-full" />
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 shadow-sm rounded-lg xl:rounded-[2rem] p-3 xl:p-5">
              <div className="flex items-center justify-between mb-3">
                <Sh className="w-10 h-10 xl:w-14 xl:h-14 rounded-2xl" />
                <Sh className="h-6 w-12 rounded-lg" />
              </div>
              <Sh className="h-2 w-28 rounded-full mb-2" />
              <Sh className="h-4 w-32 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    ))}

    <div className="bg-white dark:bg-slate-900/40 rounded-lg xl:rounded-[3rem] p-3 xl:p-4 shadow-sm">
      <div className="flex items-center gap-3 xl:gap-6 mb-4 px-3 xl:px-6 py-2 xl:py-4">
        <Sh className="w-14 h-14 rounded-2xl" />
        <div className="space-y-2">
          <Sh className="h-2.5 w-24 rounded-full" />
          <Sh className="h-8 w-48 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Sh key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

// Admin dashboard/analytics page: stat cards + chart area.
export const AdminDashboardSkeleton = () => (
  <div className="space-y-6 xl:space-y-8 font-outfit w-full">
    <Sh className="h-7 w-64 rounded-lg xl:rounded-xl" />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <Sh className="w-10 h-10 rounded-lg xl:rounded-xl" />
          <Sh className="h-6 w-20 rounded-lg" />
          <Sh className="h-2.5 w-24 rounded-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-6 space-y-2 xl:space-y-4">
        <Sh className="h-5 w-40 rounded-lg" />
        <Sh className="h-64 w-full rounded-lg xl:rounded-xl" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-6 space-y-2 xl:space-y-4">
        <Sh className="h-5 w-32 rounded-lg" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Sh className="w-8 h-8 rounded-full shrink-0" />
            <Sh className="h-3 flex-1 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Admin create/edit form page.
export const AdminFormSkeleton = ({ fields = 5 }) => (
  <div className="max-w-3xl mx-auto space-y-6 font-outfit w-full">
    <Sh className="h-7 w-56 rounded-lg xl:rounded-xl" />
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 xl:p-10 space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Sh className="h-3 w-28 rounded-md" />
          <Sh className="h-12 w-full rounded-2xl" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Sh className="h-12 w-32 rounded-full" />
        <Sh className="h-12 w-32 rounded-full" />
      </div>
    </div>
  </div>
);

// Admin detail page (user details, referral detail, etc.): profile header + stat rows.
export const AdminDetailSkeleton = () => (
  <div className="space-y-6 font-outfit w-full">
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 xl:p-10 flex flex-col sm:flex-row items-center gap-6">
      <Sh className="w-20 h-20 rounded-full shrink-0" />
      <div className="flex-1 space-y-3 w-full">
        <Sh className="h-6 w-56 rounded-lg" />
        <Sh className="h-3 w-40 rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <Sh className="h-6 w-16 rounded-lg" />
          <Sh className="h-2.5 w-20 rounded-full" />
        </div>
      ))}
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 space-y-2 xl:space-y-4">
      {[1, 2, 3].map(i => (
        <Sh key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  </div>
);
