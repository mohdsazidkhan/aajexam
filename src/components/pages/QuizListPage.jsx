'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  BrainCircuit, Search, Sparkles, Zap, TrendingUp,
  Clock, HelpCircle, Star, ChevronRight, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../lib/api';
import Card from '../ui/Card';
import { ProBadge } from '../ui';
import Seo from '../Seo';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl ${className}`} />
);

const QuizListSkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="flex gap-2 px-1">
      {[1,2,3].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-4">
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
            <Sh className="h-7 w-16 rounded-lg lg:rounded-xl" />
            <Sh className="h-7 w-16 rounded-lg lg:rounded-xl" />
            <Sh className="h-7 w-16 rounded-lg lg:rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Difficulty color map ──────────────────────────────────────────────────────
const diffChip = (d) => {
  if (d === 'easy') return 'text-primary-700 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50';
  if (d === 'hard') return 'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800 dark:border-white/50';
  return 'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800 dark:border-white/50';
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const QuizListPage = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 30 };
    if (activeFilter !== 'all') params.difficulty = activeFilter;
    API.getQuizzes(params).then(res => {
      if (res.success) {
        setQuizzes(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || res.data?.length || 0);
      }
    }).finally(() => setLoading(false));
  }, [page, activeFilter]);

  // Difficulty is now filtered server-side (see effect above) — switching
  // tabs must restart from page 1, since the old page number may not exist
  // in the newly-filtered result set.
  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const filters = [
    { id: 'all', label: 'All Quizzes', icon: Sparkles },
    { id: 'easy', label: 'Easy', icon: Zap },
    { id: 'medium', label: 'Medium', icon: BarChart2 },
    { id: 'hard', label: 'Hard', icon: Star },
  ];

  const filtered = useMemo(() => {
    let list = quizzes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(qu =>
        qu.title?.toLowerCase().includes(q) ||
        qu.subject?.name?.toLowerCase().includes(q) ||
        qu.topic?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [quizzes, activeFilter, search]);

  if (loading && page === 1) return <QuizListSkeleton />;

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in bg-transparent font-outfit pb-10">
      <Seo
        title="Free Quizzes – Topic-wise Government Exam Practice | AajExam"
        description="Practise 1000+ topic-wise free quizzes for SSC, UPSC, Banking and Railway exams."
        canonical="/quizzes"
      />

      {/* ── Hero ── */}
      <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-b-2 border-primary-600/20 dark:border-primary-900/30 px-0 py-4 lg:p-8">
        <div className="absolute inset-0 bg-primary-700 dark:bg-slate-900" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {totalCount} Quizzes Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Quizzes Hub</h1>
          <div className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search quizzes..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border-none" />
            </div>
          </div>
        </div>
        <BrainCircuit className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Filters ── */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  activeFilter === f.id
                    ? 'bg-primary-700 text-white border-primary-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {filtered.map((quiz, idx) => (
            <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card hoverable onClick={() => router.push(`/quiz/${quiz.slug}`)}
                className="group p-5 flex flex-col gap-4 border-border-primary hover:border-primary-700 transition-all rounded-[1.5rem] bg-background-surface shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-700 flex items-center justify-center shrink-0 shadow-md">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{quiz.title}</h3>
                      {quiz.subject?.name && <p className="text-[10px] font-bold text-content-muted uppercase">{quiz.subject.name}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-700 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                {/* Topic / access badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {quiz.topic?.name && (
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{quiz.topic.name}</span>
                  )}
                  {(quiz.accessLevel || '').toUpperCase() === 'PRO' && <ProBadge size="xs" />}
                </div>

                {/* Stat chips */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 dark:bg-white/30 px-2.5 py-1.5 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                    <HelpCircle className="w-3 h-3" />
                    {quiz.totalQuestions || 0} Qs
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 dark:bg-white/30 px-2.5 py-1.5 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                    <Clock className="w-3 h-3" />
                    {quiz.duration || 0} min
                  </div>
                  {quiz.difficulty && (
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg lg:rounded-xl border ${diffChip(quiz.difficulty)}`}>
                      <BarChart2 className="w-3 h-3" />
                      {quiz.difficulty}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <BrainCircuit className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">No quizzes found</h3>
              <button onClick={() => { setActiveFilter('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-primary-700 text-white rounded-full font-black text-xs uppercase">View All</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-6">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm font-black disabled:opacity-30">Prev</button>
            <span className="text-sm font-black text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm font-black disabled:opacity-30">Next</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default QuizListPage;
