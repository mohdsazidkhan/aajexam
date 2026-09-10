import React from 'react';

// Basic shimmer block (mirrors PrivateSkeletons.jsx's local `Sh`)
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

// Generic admin table page: filter/search bar + data table.
// Used for the bulk of admin list pages (students, referrals, quizzes, blogs, pyq, etc.)
export const AdminTableSkeleton = ({ rows = 8, columns = 6 }) => (
  <div className="space-y-6 font-outfit w-full">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <Sh className="h-7 w-56 rounded-xl" />
      <Sh className="h-10 w-36 rounded-2xl" />
    </div>

    {/* Filter bar */}
    <div className="flex flex-col lg:flex-row gap-3">
      <Sh className="h-12 flex-1 rounded-2xl" />
      <Sh className="h-12 w-full lg:w-40 rounded-2xl" />
      <Sh className="h-12 w-full lg:w-40 rounded-2xl" />
    </div>

    {/* Table */}
    <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden">
      <div className="flex gap-4 px-6 py-5 border-b border-slate-100 dark:border-white/10">
        {Array.from({ length: columns }).map((_, i) => (
          <Sh key={i} className="h-2.5 flex-1 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 dark:border-white/5 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Sh key={c} className={`h-4 flex-1 rounded-lg ${c === 0 ? 'max-w-[2rem]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Admin dashboard/analytics page: stat cards + chart area.
export const AdminDashboardSkeleton = () => (
  <div className="space-y-6 lg:space-y-8 font-outfit w-full">
    <Sh className="h-7 w-64 rounded-xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-slate-100 dark:border-white/10 p-5 space-y-3">
          <Sh className="w-10 h-10 rounded-xl" />
          <Sh className="h-6 w-20 rounded-lg" />
          <Sh className="h-2.5 w-24 rounded-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-slate-100 dark:border-white/10 p-6 space-y-4">
        <Sh className="h-5 w-40 rounded-lg" />
        <Sh className="h-64 w-full rounded-xl" />
      </div>
      <div className="bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-slate-100 dark:border-white/10 p-6 space-y-4">
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
    <Sh className="h-7 w-56 rounded-xl" />
    <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 p-6 lg:p-10 space-y-5">
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
    <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 p-6 lg:p-10 flex flex-col sm:flex-row items-center gap-6">
      <Sh className="w-20 h-20 rounded-full shrink-0" />
      <div className="flex-1 space-y-3 w-full">
        <Sh className="h-6 w-56 rounded-lg" />
        <Sh className="h-3 w-40 rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-slate-100 dark:border-white/10 p-5 space-y-3">
          <Sh className="h-6 w-16 rounded-lg" />
          <Sh className="h-2.5 w-20 rounded-full" />
        </div>
      ))}
    </div>
    <div className="bg-white dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <Sh key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  </div>
);
