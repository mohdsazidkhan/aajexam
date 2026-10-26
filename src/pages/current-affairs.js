'use client';
import PageHero from '@/components/common/ui/PageHero';
import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Calendar, Tag, Eye, ChevronRight, Search, X, TrendingUp, Sparkles, Globe, Flame, Trophy, Sword, Leaf } from 'lucide-react';
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

const CASkeleton = () => (
  <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
    <div className="h-40 xl:h-52 w-full rounded-[2.5rem] animate-pulse bg-primary-600/25 dark:bg-primary-500/25 border-b-2 border-primary-600/30 mt-4 xl:mt-8" />
    <div className="flex gap-2 px-1">{[1,2,3,4].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <Sh className="h-3 w-full rounded-lg" />
          <div className="flex gap-2"><Sh className="h-7 w-16 rounded-lg xl:rounded-xl" /><Sh className="h-7 w-16 rounded-lg xl:rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Category icon / color map ─────────────────────────────────────────────────
const catConfig = {
  national: { icon: Globe, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
  international: { icon: Globe, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
  economy:       { icon: TrendingUp, color: 'bg-primary-600', chip: 'text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50' },
  sports: { icon: Trophy, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
  science: { icon: Sparkles, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
  defence: { icon: Sword, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
  environment:   { icon: Leaf,     color: 'bg-primary-600',  chip: 'text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50' },
  awards: { icon: Trophy, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
  appointments: { icon: Sparkles, color:'bg-primary-600', chip:'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'},
};
const defaultCat = { icon: Newspaper, color: 'bg-slate-400', chip: 'text-slate-600 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' };

const categories = ['all', 'national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment'];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const CurrentAffairsPage = ({ initialItems = [], initialTotalPages = 1, initialTotal } = {}) => {
  const { translate } = useTranslate();
  const [affairs, setAffairs] = useState(initialItems);
  const [todayAffairs, setTodayAffairs] = useState(null);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  // updates matching the current month / category / search across all pages (not just this page)
  const [total, setTotal] = useState(initialTotal ?? initialItems.length);
  const router = useRouter();
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: pageSize, month: selectedMonth, year: selectedYear });
        if (category !== 'all') params.set('category', category);
        if (search.trim()) params.set('search', search.trim());
        const { examIds } = API.withTargetExams({});
        if (examIds) params.set('examIds', examIds);
        const [listRes, todayRes] = await Promise.all([
          API.request(`/api/current-affairs?${params}`),
          API.request(`/api/current-affairs/today${examIds ? `?examIds=${examIds}` : ''}`)
        ]);
        if (listRes?.success) { setAffairs(listRes.data || []); setTotalPages(listRes.pagination?.totalPages || 1); setTotal(listRes.pagination?.total ?? (listRes.data || []).length); }
        if (todayRes?.success) setTodayAffairs(todayRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [category, page, pageSize, search, selectedMonth, selectedYear, targetVersion]);

  const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === CURRENT_YEAR;
  const hasFilters = search.trim() || !isCurrentMonth || category !== 'all';

  const filterPills = [
    { id: 'all', label: 'All', icon: Sparkles },
    ...categories.slice(1).map(c => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1), icon: (catConfig[c] || defaultCat).icon }))
  ];

  if (loading && affairs.length === 0) return <CASkeleton />;

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo title="Daily Current Affairs – Free GA & GK for Government Exams | AajExam"
        description="Daily current affairs for SSC, UPSC, Banking, Railway and State PSC exams."
        canonical="/current-affairs"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Current Affairs', url: '/current-affairs' }])} />

      {/* ── Hero ── */}
      <PageHero
        icon={Newspaper}
        eyebrow={translate('Current Affairs')}
        title={translate('Current Affairs')}
        subtitle={translate('{count} Updates Available', { count: total })}
        actions={
<>
          {/* Search + Date */}
          <div className="w-full xl:w-auto flex flex-col xl:flex-row justify-between items-center gap-2">
            <div className="w-full xl:w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={translate('Search current affairs...')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} autoFocus
                className="w-full bg-white dark:bg-black rounded-lg xl:rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex gap-2 mt-2 xl:mt-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <select value={selectedMonth} onChange={e => { setSelectedMonth(Number(e.target.value)); setPage(1); }}
                className="bg-white dark:bg-black rounded-lg xl:rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-600 appearance-none cursor-pointer">
                {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={e => { setSelectedYear(Number(e.target.value)); setPage(1); }}
                className="bg-white dark:bg-black rounded-lg xl:rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-600 appearance-none cursor-pointer">
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button onClick={() => { setSearch(''); setSelectedMonth(now.getMonth() + 1); setSelectedYear(CURRENT_YEAR); setCategory('all'); setPage(1); }}
                className="flex items-center gap-1 px-4 py-2.5 bg-primary-600/10 text-primary-800 dark:bg-white/20 dark:text-white rounded-lg xl:rounded-xl text-xs font-black uppercase border border-primary-300 dark:border-white/30">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
</>
        }
      >
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            {filterPills.map(f => (
              <button key={f.id} onClick={() => { setCategory(f.id); setPage(1); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black uppercase text-[11px] whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  category === f.id
                    ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] border-primary-500'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {translate(f.label)}
              </button>
            ))}
        </div>
      </PageHero>

      {/* ── Filters ── */}
      <section className="space-y-2 xl:space-y-4">

        {/* Today highlight */}
        {todayAffairs?.total > 0 && !search && isCurrentMonth && category === 'all' && (
          <section className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 dark:border-white/30">
            <h2 className="text-sm font-black text-black dark:text-white mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4" /> {translate('Today — {count} Updates', { count: todayAffairs.total })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(todayAffairs.grouped || {}).map(([cat, items]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize hover:bg-slate-100 transition-colors">
                  {translate(cat.charAt(0).toUpperCase() + cat.slice(1))}: {items.length}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6 pt-2">
          {affairs.map((affair, idx) => {
            const cfg = catConfig[affair.category] || defaultCat;
            return (
              <motion.div key={affair._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Link href={`/current-affairs/${affair.slug}`} className="block">
                <Card as="section" hoverable
                  className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                        {(page - 1) * pageSize + idx + 1}
                      </div>
                      <section>
                        <h2 className="text-sm font-black text-content-primary tracking-tight line-clamp-2 leading-tight">{affair.title}</h2>
                        <p className="text-[10px] font-bold text-content-muted uppercase mt-0.5">
                          {new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </section>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {affair.keyPoints?.[0] && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{affair.keyPoints[0]}</p>
                  )}

                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border ${cfg.chip}`}>
                      <Tag className="w-3 h-3" />
                      {translate((affair.category || '').charAt(0).toUpperCase() + (affair.category || '').slice(1))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-200 uppercase bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-600">
                      <Eye className="w-3 h-3" />
                      {affair.views || 0}
                    </div>
                    {affair.questions?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                        <Tag className="w-3 h-3" />
                        {affair.questions.length} Qs
                      </div>
                    )}
                  </div>
                </Card>
                </Link>
              </motion.div>
            );
          })}

          {affairs.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 xl:space-y-4">
              <Newspaper className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">{translate('No current affairs found')}</h3>
              <button onClick={() => { setSearch(''); setSelectedMonth(now.getMonth() + 1); setSelectedYear(CURRENT_YEAR); setCategory('all'); }}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">{translate('View All')}</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pt-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
      </section>
    </div>
  );
};

export default CurrentAffairsPage;

export async function getServerSideProps({ res }) {
  try {
    const dbConnect = (await import('../lib/db')).default;
    const CurrentAffair = (await import('../models/CurrentAffair')).default;
    await dbConnect();
    const now = new Date();
    const select = 'title slug category date keyPoints tags views questions.length';
    // Same default view as the client: the current month, newest first.
    let query = {
      status: 'published',
      date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) },
    };
    if ((await CurrentAffair.countDocuments(query)) === 0) query = { status: 'published' };
    const [affairs, total] = await Promise.all([
      CurrentAffair.find(query).select(select).sort({ date: -1 }).limit(PUBLIC_DEFAULT_PAGE_SIZE).lean(),
      CurrentAffair.countDocuments(query),
    ]);
    if (res) res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return { props: { initialItems: JSON.parse(JSON.stringify(affairs)), initialTotalPages: Math.ceil(total / PUBLIC_DEFAULT_PAGE_SIZE) || 1, initialTotal: total } };
  } catch (e) {
    console.error('current affairs hub ssr error', e);
    return { props: { initialItems: [], initialTotalPages: 1, initialTotal: 0 } };
  }
}

