import React from 'react';

// Basic shimmer block
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

// ─── Shared Layout Wrapper ───
// Many private pages use MobileAppWrapper or container layouts.
// These skeletons assume they are injected into the container where the content usually is.

export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4 font-outfit w-full">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 p-4 lg:p-5 flex gap-4">
        <Sh className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <Sh className="h-4 w-3/4 max-w-sm rounded-lg" />
          <div className="flex gap-2">
            <Sh className="h-3 w-16 rounded-md" />
            <Sh className="h-3 w-20 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const GridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 font-outfit">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-4">
        <Sh className="w-full aspect-[4/3] rounded-xl" />
        <div className="space-y-3">
          <Sh className="h-4 w-full rounded-lg" />
          <Sh className="h-4 w-2/3 rounded-lg" />
        </div>
        <div className="flex justify-between items-center mt-auto pt-2">
          <Sh className="h-8 w-20 rounded-full" />
          <Sh className="h-8 w-8 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 lg:space-y-8 font-outfit w-full">
    {/* Top Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-4 lg:p-6 text-center space-y-3">
          <Sh className="w-10 h-10 rounded-full mx-auto" />
          <Sh className="h-6 w-16 mx-auto rounded-lg" />
          <Sh className="h-2.5 w-20 mx-auto rounded-full" />
        </div>
      ))}
    </div>
    
    {/* Main Content Area */}
    <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Sh className="h-6 w-48 rounded-lg" />
        <Sh className="h-8 w-24 rounded-full" />
      </div>
      <Sh className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Sh className="h-32 rounded-xl" />
        <Sh className="h-32 rounded-xl" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6 lg:space-y-8 font-outfit w-full">
    {/* Header / Banner */}
    <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 lg:p-10 flex flex-col items-center gap-4 text-center overflow-hidden">
      <Sh className="absolute inset-0 w-full h-32 lg:h-48 rounded-t-[2rem]" />
      <div className="relative z-10 mt-16 lg:mt-24 space-y-4 flex flex-col items-center">
        <Sh className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-slate-800" />
        <Sh className="h-6 w-48 rounded-lg" />
        <Sh className="h-3 w-32 rounded-full" />
        <div className="flex gap-2">
          <Sh className="h-8 w-24 rounded-full" />
          <Sh className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {[1, 2, 3].map(i => <Sh key={i} className="h-10 w-28 rounded-full shrink-0" />)}
    </div>

    {/* Content */}
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-4">
          <Sh className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Sh className="h-4 w-1/3 rounded-lg" />
            <Sh className="h-3 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SubscriptionSkeleton = () => (
  <div className="space-y-6 lg:space-y-10 font-outfit w-full">
    <div className="text-center space-y-4 max-w-2xl mx-auto">
      <Sh className="h-8 w-64 mx-auto rounded-xl" />
      <Sh className="h-4 w-full rounded-lg" />
      <Sh className="h-4 w-3/4 mx-auto rounded-lg" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-8 space-y-6">
          <Sh className="h-6 w-32 rounded-lg" />
          <div className="space-y-2">
            <Sh className="h-10 w-40 rounded-xl" />
            <Sh className="h-3 w-24 rounded-md" />
          </div>
          <Sh className="h-12 w-full rounded-full" />
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            {[1,2,3,4,5].map(j => (
              <div key={j} className="flex gap-3 items-center">
                <Sh className="w-5 h-5 rounded-full shrink-0" />
                <Sh className="h-3 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 lg:space-y-8 font-outfit w-full">
    {/* Header / Banner */}
    <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 lg:p-10 text-center">
      <div className="space-y-4 max-w-3xl mx-auto flex flex-col items-center">
        <Sh className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl" />
        <Sh className="h-8 lg:h-10 w-full rounded-xl" />
        <Sh className="h-8 lg:h-10 w-3/4 rounded-xl" />
        <div className="flex gap-4 justify-center mt-4">
          <Sh className="h-8 w-24 rounded-full" />
          <Sh className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 p-6 lg:p-10 space-y-6">
      <Sh className="w-full aspect-video rounded-[1.5rem]" />
      <div className="space-y-4 pt-4">
        <Sh className="h-5 w-full rounded-lg" />
        <Sh className="h-5 w-full rounded-lg" />
        <Sh className="h-5 w-11/12 rounded-lg" />
        <Sh className="h-5 w-full rounded-lg" />
        <Sh className="h-5 w-10/12 rounded-lg" />
      </div>
      <div className="space-y-4 pt-8">
        <Sh className="h-8 w-1/3 rounded-lg" />
        <Sh className="h-5 w-full rounded-lg" />
        <Sh className="h-5 w-9/12 rounded-lg" />
      </div>
    </div>
  </div>
);
