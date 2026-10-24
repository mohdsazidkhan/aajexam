'use client';
import PageHero from '@/components/common/ui/PageHero';
import { useEffect, useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  Layers, Search, Sparkles, BrainCircuit,
  TrendingUp, ChevronRight, HelpCircle, BookOpen
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import API from '../../../lib/api';
import useTargetExamsVersion from '../../../hooks/useTargetExamsVersion';
import Card from '../../common/ui/Card';
import Pagination from '../../common/Pagination';
import Seo from '../../common/Seo';
import useTranslate from '../../../hooks/useTranslate';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

const TopicListSkeleton = () => (
  <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
    <div className="h-40 xl:h-52 w-full rounded-[2.5rem] animate-pulse bg-primary-600/25 dark:bg-primary-500/25 border-b-2 border-primary-600/30 mt-4 xl:mt-8" />
    <div className="flex gap-2 px-1">
      {[1,2,3].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-2 xl:space-y-4">
          <div className="flex items-start gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Sh className="h-4 w-3/4 rounded-lg" />
              <Sh className="h-2.5 w-1/2 rounded-full" />
            </div>
          </div>
          <Sh className="h-2.5 w-28 rounded-full" />
          <div className="flex gap-2">
            <Sh className="h-7 w-16 rounded-lg xl:rounded-xl" />
            <Sh className="h-7 w-16 rounded-lg xl:rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const TopicListPage = ({ initialTopics = [] } = {}) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const [topics, setTopics] = useState(initialTopics);
  const [loading, setLoading] = useState(initialTopics.length === 0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const targetVersion = useTargetExamsVersion();

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [total, setTotal] = useState(initialTopics.length);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Search, filter and pagination all run on the server.
  useEffect(() => {
    let alive = true;
    API.getAllTopics({ page, limit: pageSize, search: debouncedSearch || undefined, has: activeFilter !== 'all' ? activeFilter : undefined }).then(res => {
      if (!alive || !res.success) return;
      setTopics(res.data || []);
      setTotal(res.pagination?.total ?? (res.data || []).length);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [targetVersion, page, pageSize, debouncedSearch, activeFilter]);

  const filters = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'quiz', label: 'Has Quizzes', icon: BrainCircuit },
    { id: 'question', label: 'Has Questions', icon: HelpCircle },
  ];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = topics.slice(0, pageSize);
  useEffect(() => { setPage(1); }, [activeFilter, debouncedSearch, targetVersion]);

  if (loading) return <TopicListSkeleton />;

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo
        title="Topics – Granular MCQ Practice for Government Exams | AajExam"
        description="Practise topic-wise MCQs for SSC, UPSC, Banking and Railway exams."
        canonical="/topics"
      />

      {/* ── Hero ── */}
      <PageHero
        icon={Layers}
        eyebrow={translate('Topics')}
        title={translate('Topics')}
        subtitle={translate('{count} Topics Available', { count: total })}
        center={
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={translate('Search topics...')} value={search} onChange={e => setSearch(e.target.value)} autoFocus
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
          {pageItems.map((topic, idx) => (
            <motion.div key={topic._id || topic.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Link href={`/topics/${topic.slug}`} className="block">
<Card hoverable
                className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{translateData(topic.name)}</h2>
                      {topic.subject?.name && <p className="text-[10px] font-bold text-content-muted uppercase">{translateData(topic.subject.name)}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-2">
                {/* Exam chips */}
                <div className="flex items-center gap-2 flex-wrap min-w-0 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {topic.exams?.length > 0 && topic.exams.slice(0,2).map(e => (
                    <span key={e._id || e} className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{e.name || e}</span>
                  ))}
                </div>

                {/* Stat chips */}
                <div className={`flex items-center gap-2 shrink-0 ml-auto ${topic.quizCount === undefined ? 'hidden' : ''}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-300 uppercase bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-primary-100 dark:border-primary-800/50">
                    <BrainCircuit className="w-3 h-3" />
                    {translate('{count} Quizzes', { count: topic.quizCount || 0 })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                    <HelpCircle className="w-3 h-3" />
                    {topic.questionCount || 0} Qs
                  </div>
                </div>
                </div>
              </Card>
              </Link>
            </motion.div>
          ))}

          {pageItems.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 xl:space-y-4">
              <Layers className="w-20 h-20 text-slate-200 mx-auto" />
              <h2 className="text-xl font-black text-slate-400 uppercase">{translate('No topics found')}</h2>
              <button onClick={() => { setActiveFilter('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">{translate('View All')}</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} totalItems={total} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
      </section>
    </div>
  );
};

export default TopicListPage;
