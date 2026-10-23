'use client';
import PageHero from '@/components/common/ui/PageHero';
import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Pin, Eye, ChevronRight, TrendingUp, Sparkles, Bell, CreditCard, BarChart2, Key, Users, Clock, AlertTriangle, Search } from 'lucide-react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion } from 'framer-motion';
import API from '../lib/api';
import useTargetExamsVersion from '../hooks/useTargetExamsVersion';
import Card from '../components/common/ui/Card';
import Seo from '../components/common/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';
import useTranslate from '../hooks/useTranslate';
import Pagination from '../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../lib/constants/pagination';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

const NewsSkeleton = () => (
  <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
    <div className="h-40 xl:h-52 w-full rounded-[2.5rem] animate-pulse bg-primary-600/25 dark:bg-primary-500/25 border-b-2 border-primary-600/30 mt-4 xl:mt-8" />
    <div className="flex gap-2 px-1">{[1,2,3,4,5].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <div className="flex gap-2"><Sh className="h-7 w-20 rounded-lg xl:rounded-xl" /><Sh className="h-7 w-16 rounded-lg xl:rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Type config ───────────────────────────────────────────────────────────────
const typeConfig = {
  notification: { icon: Bell, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800', label:'Notification'},
  admit_card:   { icon: CreditCard,   color: 'bg-primary-600', chip: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50', label: 'Admit Card' },
  result: { icon: BarChart2, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800', label:'Result'},
  answer_key: { icon: Key, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800', label:'Answer Key'},
  vacancy: { icon: Users, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800', label:'Vacancy'},
  date_change: { icon: AlertTriangle, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800', label:'Date Change'},
};
const defaultType = { icon: Megaphone, color: 'bg-slate-400', chip: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600', label: 'Other' };

const typeFilters = [
  { id: 'all', label: 'All', icon: Sparkles },
  ...Object.entries(typeConfig).map(([id, c]) => ({ id, label: c.label, icon: c.icon }))
];

const ExamNewsPage = ({ initialItems = [], initialTotalPages = 1 } = {}) => {
  const { translate } = useTranslate();
  const [news, setNews] = useState(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const router = useRouter();
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: pageSize });
        if (type !== 'all') params.set('type', type);
        if (search.trim()) params.set('search', search.trim());
        const { examIds } = API.withTargetExams({});
        if (examIds) params.set('examIds', examIds);
        const res = await API.request(`/api/exam-news?${params}`);
        if (res?.success) { setNews(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [type, page, pageSize, search, targetVersion]);

  if (loading && news.length === 0) return <NewsSkeleton />;

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo title="Govt Exam News 2026: Job Alerts, Admit Cards, Results | AajExam"
        description="Latest government exam news 2026: SSC, UPSC, Railway, Banking and Police recruitment notifications, admit cards, results, answer keys and vacancies."
        canonical="/exam-news"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Exam News', url: '/exam-news' }])} />

      {/* ── Hero ── */}
      <PageHero
        icon={Megaphone}
        eyebrow={translate('Exam News')}
        title={translate('Exam News')}
        subtitle={translate('{count} News Available', { count: news.length })}
        center={
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={translate('Search news...')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} autoFocus
                className="w-full bg-white dark:bg-black rounded-lg xl:rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-300 dark:border-slate-600" />
            </div>
          </div>
        }
        actions={
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            {typeFilters.map(f => (
              <button key={f.id} onClick={() => { setType(f.id); setPage(1); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black uppercase text-[11px] whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  type === f.id
                    ?'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 border-primary-500'
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
          {news.map((item, idx) => {
            const cfg = typeConfig[item.type] || defaultType;
            const Icon = cfg.icon;
            return (
              <motion.div key={item._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Link href={`/exam-news/${item.slug}`} className="block">
                <Card hoverable
                  className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                        {(page - 1) * pageSize + idx + 1}
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-content-primary tracking-tight line-clamp-2 leading-tight">{item.title}</h2>
                        {item.exam?.name && <p className="text-[10px] font-bold text-content-muted uppercase mt-0.5">{item.exam.name}</p>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {item.importantDates?.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      <Calendar className="w-3 h-3" />
                      {item.importantDates[0].label}: {new Date(item.importantDates[0].date).toLocaleDateString('en-IN')}
                    </div>
                  )}

                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border ${cfg.chip}`}>
                      <Icon className="w-3 h-3" />
                      {translate(cfg.label)}
                    </div>
                    {item.isPinned && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                        <Pin className="w-3 h-3" /> Pinned
                      </div>
                    )}
                  </div>
                </Card>
                </Link>
              </motion.div>
            );
          })}

          {news.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 xl:space-y-4">
              <Megaphone className="w-20 h-20 text-slate-200 mx-auto" />
              <h2 className="text-xl font-black text-slate-400 uppercase">{translate('No news found')}</h2>
              <button onClick={() => { setType('all'); setSearch(''); setPage(1); }}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">{translate('View All')}</button>
            </div>
          )}
        </div>

        <div className="pt-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
      </section>
    </div>
  );
};

export default ExamNewsPage;

export async function getServerSideProps({ res }) {
  try {
    const dbConnect = (await import('../lib/db')).default;
    const ExamNews = (await import('../models/ExamNews')).default;
    await import('../models/Exam');
    await dbConnect();
    const query = { status: 'published' };
    const [news, total] = await Promise.all([
      ExamNews.find(query)
        .populate('exam', 'name code')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(PUBLIC_DEFAULT_PAGE_SIZE)
        .lean(),
      ExamNews.countDocuments(query),
    ]);
    if (res) res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return { props: { initialItems: JSON.parse(JSON.stringify(news)), initialTotalPages: Math.ceil(total / PUBLIC_DEFAULT_PAGE_SIZE) || 1 } };
  } catch (e) {
    console.error('exam news hub ssr error', e);
    return { props: { initialItems: [], initialTotalPages: 1 } };
  }
}

