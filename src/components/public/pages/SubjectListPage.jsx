'use client';
import PageHero from '@/components/common/ui/PageHero';
import { useEffect, useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  BookMarked, Search, Sparkles, BookOpen, Globe2,
  TrendingUp, ChevronRight, BrainCircuit, Layers
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

const SubjectListSkeleton = () => (
  <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
    <div className="h-40 xl:h-52 w-full rounded-3xl animate-pulse border-b-2 border-primary-600/30 mt-4 xl:mt-8" />
    <div className="flex gap-2 px-1">
      {[1,2,3].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-background-surface rounded-2xl border border-border-primary p-5 space-y-2 xl:space-y-4">
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
const SubjectListPage = ({ initialSubjects = [] } = {}) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(initialSubjects.length === 0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const targetVersion = useTargetExamsVersion();

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [total, setTotal] = useState(initialSubjects.length);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Search, filter and pagination all run on the server.
  useEffect(() => {
    let alive = true;
    API.getAllSubjects({ page, limit: pageSize, search: debouncedSearch || undefined, has: activeFilter !== 'all' ? activeFilter : undefined }).then(res => {
      if (!alive || !res.success) return;
      setSubjects(res.data || []);
      setTotal(res.pagination?.total ?? (res.data || []).length);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [targetVersion, page, pageSize, debouncedSearch, activeFilter]);

  const filters = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'quiz', label: 'Has Quizzes', icon: BrainCircuit },
    { id: 'topic', label: 'Has Topics', icon: Layers },
  ];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = subjects.slice(0, pageSize);
  useEffect(() => { setPage(1); }, [activeFilter, debouncedSearch, targetVersion]);

  if (loading) return <SubjectListSkeleton />;

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo
        title="Subjects – Reasoning, Maths, English, GA & GK Practice | AajExam"
        description="Browse subject-wise practice on AajExam for SSC, UPSC, Banking and Railway exams."
        canonical="/subjects"
      />

      {/* ── Hero ── */}
      <PageHero
        icon={BookMarked}
        eyebrow={translate('Subjects')}
        title={translate('Subjects')}
        subtitle={translate('{count} Subjects Available', { count: total })}
        center={
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
              <input type="text" placeholder={translate('Search subjects...')} value={search} onChange={e => setSearch(e.target.value)} autoFocus
                className="w-full bg-background-surface rounded-lg xl:rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-content-primary placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-border-primary dark:border-slate-600" />
            </div>
          </div>
        }
        actions={
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold uppercase text-[11px] whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  activeFilter === f.id
                    ? 'text-on-primary border-primary-500 bg-primary-600'
                    : 'bg-background-surface text-content-secondary border-border-primary'
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
          {pageItems.map((sub, idx) => (
            <motion.div key={sub._id || sub.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Link href={`/subjects/${sub.slug}`} className="block">
<Card as="section" hoverable
                className="group flex flex-col gap-4 border-border-primary hover:border-black dark:hover:border-white transition-all rounded-2xl bg-background-surface">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 text-on-primary text-xs xl:text-base font-bold tabular-nums">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </div>
                    <section>
                      <h2 className="text-base font-bold text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{translateData(sub.name)}</h2>
                      {sub.description && <p className="text-[10px] font-bold text-content-muted line-clamp-1">{sub.description}</p>}
                    </section>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Globe2 className="w-3 h-3 text-content-muted" />
                      <span className="text-xs font-bold text-content-secondary">{translate('Subject')}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>

                {/* Stat chips */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold text-primary-600 uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-primary-100 dark:border-primary-800/50 ${sub.quizCount === undefined ? 'hidden' : ''}`}>
                    <BrainCircuit className="w-3 h-3" />
                    {translate('{count} Quizzes', { count: sub.quizCount || 0 })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-primary uppercase bg-background-surface-secondary px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-border-primary">
                    <Layers className="w-3 h-3" />
                    {translate('{count} Topics', { count: sub.topicCount || 0 })}
                  </div>
                </div>
              </Card>
              </Link>
            </motion.div>
          ))}

          {pageItems.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 xl:space-y-4">
              <BookOpen className="w-20 h-20 text-slate-200 mx-auto" />
              <h2 className="text-xl font-bold text-content-muted">{translate('No subjects found')}</h2>
              <button onClick={() => { setActiveFilter('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-primary-600 text-on-primary rounded-full font-bold text-xs uppercase">{translate('View All')}</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} totalItems={total} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
      </section>
    </div>
  );
};

export default SubjectListPage;
