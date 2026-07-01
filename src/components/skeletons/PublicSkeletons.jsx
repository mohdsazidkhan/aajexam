'use client';

/**
 * PublicSkeletons.jsx
 * Central skeleton library for all public-facing pages.
 * Each skeleton mirrors the real layout of its corresponding page.
 */

// ─── Base shimmer block ───────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

// ─── Reusable row skeleton (icon + 2 text lines + badges) ────────────────────
const RowSkeleton = ({ badgeCount = 2 }) => (
  <div className="flex items-center gap-3 p-3 lg:p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
    <Sh className="w-10 h-10 lg:w-12 lg:h-12 shrink-0 rounded-xl" />
    <div className="flex-1 space-y-2 min-w-0">
      <Sh className="h-3.5 w-3/4 rounded-lg" />
      <Sh className="h-2.5 w-1/2 rounded-lg" />
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {Array.from({ length: badgeCount }).map((_, i) => (
        <Sh key={i} className="h-6 w-12 rounded-lg" />
      ))}
    </div>
    <Sh className="w-4 h-4 rounded-full shrink-0" />
  </div>
);

// ─── List page header (title + count + search bar) ───────────────────────────
const ListHeaderSkeleton = () => (
  <div className="space-y-4 mb-6">
    <div className="flex items-center justify-between">
      <Sh className="h-7 w-28 rounded-xl" />
      <Sh className="h-4 w-16 rounded-full" />
    </div>
    <Sh className="h-10 w-full rounded-xl" />
  </div>
);

// ─── Hero banner skeleton (gradient card) ────────────────────────────────────
const HeroBannerSkeleton = () => (
  <div className="rounded-2xl p-6 bg-slate-100 dark:bg-slate-800/60 space-y-3 mb-5">
    <Sh className="h-4 w-24 rounded-full" />
    <Sh className="h-8 w-48 rounded-xl" />
    <Sh className="h-3 w-64 rounded-lg" />
    <div className="flex gap-2 mt-2">
      <Sh className="h-7 w-20 rounded-lg" />
      <Sh className="h-7 w-24 rounded-lg" />
    </div>
  </div>
);

// ─── Card grid skeleton (for blog / quiz cards) ───────────────────────────────
const GridCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
    <Sh className="h-44 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Sh className="h-3 w-20 rounded-full" />
      <Sh className="h-5 w-4/5 rounded-lg" />
      <Sh className="h-3 w-full rounded-lg" />
      <Sh className="h-3 w-3/4 rounded-lg" />
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-3">
          <Sh className="h-3 w-12 rounded-lg" />
          <Sh className="h-3 w-12 rounded-lg" />
          <Sh className="h-3 w-12 rounded-lg" />
        </div>
        <Sh className="h-3 w-14 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Exam card skeleton (for govt-exams grid) ─────────────────────────────────
const ExamCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
    <div className="flex items-start gap-3">
      <Sh className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Sh className="h-4 w-3/4 rounded-lg" />
        <Sh className="h-3 w-1/2 rounded-full" />
      </div>
    </div>
    <div className="flex gap-2">
      <Sh className="h-6 w-16 rounded-lg" />
      <Sh className="h-6 w-16 rounded-lg" />
      <Sh className="h-6 w-16 rounded-lg" />
    </div>
  </div>
);

// ─── Quiz detail/preview skeleton ─────────────────────────────────────────────
const QuizPreviewSkeleton = () => (
  <div className="max-w-4xl mx-auto py-5 lg:py-12 px-4 pb-24 space-y-6 animate-pulse">
    {/* Breadcrumb */}
    <div className="flex gap-2">
      <Sh className="h-4 w-12 rounded-full" />
      <Sh className="h-4 w-4 rounded-full" />
      <Sh className="h-4 w-16 rounded-full" />
    </div>
    {/* Hero card */}
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-10 border border-slate-200 dark:border-slate-700 space-y-5">
      <div className="flex items-start gap-4">
        <Sh className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Sh className="h-6 w-3/4 rounded-xl" />
          <Sh className="h-4 w-1/2 rounded-lg" />
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4].map(i => <Sh key={i} className="h-6 w-20 rounded-lg" />)}
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {[1,2,3].map(i => (
          <div key={i} className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-4 space-y-2">
            <Sh className="h-3 w-12 rounded-full" />
            <Sh className="h-6 w-8 rounded-lg" />
          </div>
        ))}
      </div>
      {/* CTA button */}
      <Sh className="h-12 w-full rounded-2xl" />
    </div>
    {/* Leaderboard */}
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
      <Sh className="h-5 w-32 rounded-xl" />
      {[1,2,3].map(i => <RowSkeleton key={i} badgeCount={1} />)}
    </div>
  </div>
);

// ─── Blog detail skeleton ──────────────────────────────────────────────────────
const BlogDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-6 lg:py-12 pb-24 space-y-6 animate-pulse">
    <Sh className="h-4 w-20 rounded-full" />
    {/* Hero image */}
    <Sh className="h-64 lg:h-96 w-full rounded-3xl" />
    <div className="space-y-4">
      <Sh className="h-3 w-24 rounded-full" />
      <Sh className="h-8 w-5/6 rounded-xl" />
      <Sh className="h-8 w-3/4 rounded-xl" />
      {/* Meta row */}
      <div className="flex gap-4">
        <Sh className="h-3 w-16 rounded-full" />
        <Sh className="h-3 w-16 rounded-full" />
        <Sh className="h-3 w-16 rounded-full" />
      </div>
    </div>
    {/* Body paragraphs */}
    {[1,2,3,4,5].map(i => (
      <div key={i} className="space-y-2">
        <Sh className="h-3 w-full rounded-lg" />
        <Sh className="h-3 w-full rounded-lg" />
        <Sh className="h-3 w-4/5 rounded-lg" />
      </div>
    ))}
  </div>
);

// ─── Subject/Topic detail skeleton ────────────────────────────────────────────
const DetailPageSkeleton = ({ color = 'from-indigo-500 to-violet-600' }) => (
  <div className="min-h-screen pb-24 animate-pulse">
    <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
      {/* Back button */}
      <Sh className="h-4 w-16 rounded-full mb-4" />
      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 mb-5 space-y-3 opacity-40`}>
        <Sh className="h-8 w-8 rounded-xl bg-white/40" />
        <Sh className="h-7 w-48 rounded-xl bg-white/40" />
        <Sh className="h-3 w-64 rounded-lg bg-white/40" />
        <div className="flex gap-2">
          <Sh className="h-7 w-20 rounded-lg bg-white/40" />
          <Sh className="h-7 w-24 rounded-lg bg-white/40" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <Sh className="h-10 w-24 rounded-full" />
        <Sh className="h-10 w-32 rounded-full" />
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {[1,2,3,4,5,6].map(i => <RowSkeleton key={i} badgeCount={1} />)}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC PAGE SKELETONS (exported for use in each page)
// ═══════════════════════════════════════════════════════════════════════════════

/** Skeleton for /topics (TopicListPage) */
export const TopicListSkeleton = () => (
  <div className="min-h-screen pb-24 animate-pulse">
    <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
      <ListHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} badgeCount={2} />)}
      </div>
    </div>
  </div>
);

/** Skeleton for /subjects (SubjectListPage) */
export const SubjectListSkeleton = () => (
  <div className="min-h-screen pb-24 animate-pulse">
    <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
      <ListHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} badgeCount={2} />)}
      </div>
    </div>
  </div>
);

/** Skeleton for /quizzes (QuizListPage) */
export const QuizListSkeleton = () => (
  <div className="min-h-screen pb-24 animate-pulse">
    <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
      <ListHeaderSkeleton />
      <div className="flex flex-col gap-2 lg:gap-3">
        {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} badgeCount={2} />)}
      </div>
    </div>
  </div>
);

/** Skeleton for /govt-exams */
export const GovtExamsListSkeleton = () => (
  <div className="space-y-8 py-10 animate-pulse">
    {/* Hero */}
    <Sh className="h-36 w-full rounded-[2.5rem]" />
    {/* Filter pills */}
    <div className="flex gap-3">
      <Sh className="h-10 w-24 rounded-full" />
      <Sh className="h-10 w-28 rounded-full" />
      <Sh className="h-10 w-28 rounded-full" />
    </div>
    {/* Exam card grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => <ExamCardSkeleton key={i} />)}
    </div>
  </div>
);

/** Skeleton for /subjects/[id] */
export const SubjectDetailSkeleton = () => (
  <DetailPageSkeleton color="from-indigo-500 to-violet-600" />
);

/** Skeleton for /topics/[id] */
export const TopicDetailSkeleton = () => (
  <DetailPageSkeleton color="from-cyan-500 to-blue-600" />
);

/** Skeleton for /quiz/[id] (QuizPreviewPage) */
export const QuizPreviewPageSkeleton = QuizPreviewSkeleton;

/** Skeleton for /blog (BlogsPage list) */
export const BlogListSkeleton = () => (
  <div className="animate-pulse space-y-6 py-6">
    {/* Filters */}
    <div className="flex gap-3">
      <Sh className="h-9 w-32 rounded-xl" />
      <Sh className="h-9 flex-1 rounded-xl" />
    </div>
    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => <GridCardSkeleton key={i} />)}
    </div>
    {/* Pagination */}
    <div className="flex justify-center gap-2 pt-4">
      <Sh className="h-9 w-20 rounded-xl" />
      <Sh className="h-9 w-9 rounded-xl" />
      <Sh className="h-9 w-20 rounded-xl" />
    </div>
  </div>
);

/** Skeleton for /blog/[slug] (BlogDetailPage) */
export const BlogDetailPageSkeleton = BlogDetailSkeleton;

/** Skeleton for the dynamic loading fallback in Next.js pages (inline JSX) */
export const PageLoadingFallback = () => (
  <div className="min-h-screen flex flex-col gap-4 p-4 animate-pulse">
    <Sh className="h-8 w-48 rounded-xl mt-6" />
    <Sh className="h-10 w-full rounded-xl" />
    <div className="space-y-3 mt-2">
      {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} badgeCount={2} />)}
    </div>
  </div>
);
