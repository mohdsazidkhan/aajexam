'use client';
import PageHero from '@/components/common/ui/PageHero';
import { useEffect, useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  BrainCircuit, Search, Sparkles, Zap, TrendingUp,
  Clock, HelpCircle, Star, ChevronRight, BarChart2
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import API from '../../../lib/api';
import useTargetExamsVersion from '../../../hooks/useTargetExamsVersion';
import Card from '../../common/ui/Card';
import Pagination from '../../common/Pagination';
import { ProBadge } from '../../common/ui';
import Seo from '../../common/Seo';
import useTranslate from '../../../hooks/useTranslate';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

const QuizListSkeleton = () => (
  <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
    <div className="h-40 xl:h-52 w-full rounded-[2.5rem] animate-pulse bg-primary-600/25 dark:bg-primary-500/25 border-b-2 border-primary-600/30" />
    <div className="flex gap-2 px-1">
      {[1,2,3].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-2 xl:space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Sh className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Sh className="h-4 w-32 rounded-lg" />
                <Sh className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <Sh className="h-2.5 w-24 rounded-full" />
          <div className="flex gap-2">
            <Sh className="h-7 w-16 rounded-lg xl:rounded-xl" />
            <Sh className="h-7 w-16 rounded-lg xl:rounded-xl" />
            <Sh className="h-7 w-16 rounded-lg xl:rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Difficulty color map ──────────────────────────────────────────────────────
const diffChip = (d) => {
  if (d === 'easy') return 'text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50';
  if (d === 'hard') return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 dark:border-white/50';
  return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 dark:border-white/50';
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const QuizListPage = ({ initialQuizzes = [] } = {}) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const targetVersion = useTargetExamsVersion();

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: pageSize };
    if (activeFilter !== 'all') params.difficulty = activeFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    API.getQuizzes(params).then(res => {
      if (res.success) {
        setQuizzes(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || res.data?.length || 0);
      }
    }).finally(() => setLoading(false));
  }, [page, pageSize, activeFilter, debouncedSearch, targetVersion]);

  // Difficulty is now filtered server-side (see effect above) — switching
  // tabs must restart from page 1, since the old page number may not exist
  // in the newly-filtered result set.
  useEffect(() => {
    setPage(1);
  }, [activeFilter, debouncedSearch]);

  const filters = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'easy', label: 'Easy', icon: Zap },
    { id: 'medium', label: 'Medium', icon: BarChart2 },
    { id: 'hard', label: 'Hard', icon: Star },
  ];

  // Search + difficulty filter + paging are applied by the API.
  const filtered = quizzes;

  if (loading && page === 1 && quizzes.length === 0) return <QuizListSkeleton />;

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo
        title="Free Quizzes – Topic-wise Government Exam Practice | AajExam"
        description="Practise 1000+ topic-wise free quizzes for SSC, UPSC, Banking and Railway exams."
        canonical="/quizzes"
      />

      {/* ── Hero ── */}
      <PageHero
        icon={BrainCircuit}
        eyebrow={translate('Quizzes')}
        title={translate('Quizzes')}
        subtitle={translate('{count} Quizzes Available', { count: totalCount })}
        center={
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={translate('Search quizzes...')} value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-black rounded-lg xl:rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-300 dark:border-slate-600" />
            </div>
          </div>
        }
        actions={
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black uppercase text-[11px] whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  activeFilter === f.id
                    ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] border-primary-500'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {translate(f.label)}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Filters ── */}
      <section className="space-y-2 xl:space-y-4">

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6 pt-2">
          {filtered.map((quiz, idx) => (
            <motion.div key={quiz._id || quiz.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Link href={`/quiz/${quiz.slug}`} className="block">
<Card hoverable
                className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-primary-700 transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                      {(page - 1) * pageSize + idx + 1}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{translateData(quiz.title)}</h2>
                      {quiz.subject?.name && <p className="text-[10px] font-bold text-content-muted uppercase">{translateData(quiz.subject.name)}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                {/* Topic / access badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {quiz.topic?.name && (
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{translateData(quiz.topic.name)}</span>
                  )}
                  {(quiz.accessLevel || '').toUpperCase() === 'PRO' && <ProBadge size="xs" />}
                </div>

                {/* Stat chips */}
                <div className={`flex items-center justify-between flex-wrap gap-2 pt-1 ${quiz.totalQuestions === undefined ? 'hidden' : ''}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                    <HelpCircle className="w-3 h-3" />
                    {quiz.totalQuestions || 0} Qs
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                    <Clock className="w-3 h-3" />
                    {translate('{count} min', { count: quiz.duration || 0 })}
                  </div>
                  {quiz.difficulty && (
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border ${diffChip(quiz.difficulty)}`}>
                      <BarChart2 className="w-3 h-3" />
                      {quiz.difficulty}
                    </div>
                  )}
                </div>
              </Card>
              </Link>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 xl:space-y-4">
              <BrainCircuit className="w-20 h-20 text-slate-200 mx-auto" />
              <h2 className="text-xl font-black text-slate-400 uppercase">{translate('No quizzes found')}</h2>
              <button onClick={() => { setActiveFilter('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">{translate('View All')}</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pt-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalCount} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
      </section>
    </div>
  );
};

export default QuizListPage;
