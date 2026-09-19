import React from 'react';
import Skeleton from './Skeleton';

// Mirrors SectionHeader + the horizontal card row used for every
// lazy-loaded section on the real home page (Govt Exams, Quizzes,
// Subjects, Topics, Reels, Blogs).
const SectionRowSkeleton = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <Skeleton width="36px" height="36px" borderRadius="0.75rem" />
        <Skeleton width="90px" height="20px" borderRadius="0.5rem" />
      </div>
      <Skeleton width="84px" height="28px" borderRadius="9999px" />
    </div>
    <div className="flex gap-3 overflow-hidden pb-1">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="flex-shrink-0" width="150px" height="130px" borderRadius="1rem" />
      ))}
    </div>
  </div>
);

const HomePageSkeleton = () => (
  <div className="space-y-5 md:space-y-6 lg:space-y-8 font-outfit">

    {/* ── Stats ── */}
    <section className="px-0 py-4 lg:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800 space-y-2">
            <Skeleton width="18px" height="18px" borderRadius="0.4rem" />
            <Skeleton width="40px" height="22px" borderRadius="0.4rem" />
            <Skeleton width="60px" height="9px" borderRadius="0.25rem" />
          </div>
        ))}
      </div>
    </section>

    {/* ── Quick Actions ── */}
    <section className="px-0 py-4 lg:p-8">
      <div className="grid grid-cols-3 gap-2.5 md:gap-3 lg:gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl lg:rounded-3xl p-4 lg:p-6 bg-slate-100 dark:bg-slate-800 flex flex-col items-center gap-2">
            <Skeleton width="48px" height="48px" borderRadius="1rem" />
            <Skeleton width="48px" height="9px" borderRadius="0.25rem" />
          </div>
        ))}
      </div>
    </section>

    {/* ── Govt Exams / Quizzes / Subjects / Topics / Reels / Blogs ── */}
    {[1, 2, 3, 4, 5, 6].map(i => (
      <section key={i} className="px-0 lg:px-4">
        <SectionRowSkeleton />
      </section>
    ))}
  </div>
);

export default HomePageSkeleton;
