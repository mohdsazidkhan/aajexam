'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Calendar, Tag, Eye, ChevronRight, Search, X, TrendingUp, Sparkles, Globe, Flame, Trophy, Sword, Leaf } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl ${className}`} />
);

const CASkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="flex gap-2 px-1">{[1,2,3,4].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <Sh className="h-3 w-full rounded-lg" />
          <div className="flex gap-2"><Sh className="h-7 w-16 rounded-lg lg:rounded-xl" /><Sh className="h-7 w-16 rounded-lg lg:rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Category icon / color map ─────────────────────────────────────────────────
const catConfig = {
  national: { icon: Globe, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
  international: { icon: Globe, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
  economy:       { icon: TrendingUp, color: 'bg-primary-700', chip: 'text-primary-700 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50' },
  sports: { icon: Trophy, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
  science: { icon: Sparkles, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
  defence: { icon: Sword, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
  environment:   { icon: Leaf,     color: 'bg-primary-700',  chip: 'text-primary-700 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50' },
  awards: { icon: Trophy, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
  appointments: { icon: Sparkles, color:'bg-primary-700', chip:'text-black dark:text-white dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-slate-200 dark:border-slate-800'},
};
const defaultCat = { icon: Newspaper, color: 'bg-slate-400', chip: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' };

const categories = ['all', 'national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment'];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const CurrentAffairsPage = () => {
  const [affairs, setAffairs] = useState([]);
  const [todayAffairs, setTodayAffairs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 30, month: selectedMonth, year: selectedYear });
        if (category !== 'all') params.set('category', category);
        if (search.trim()) params.set('search', search.trim());
        const [listRes, todayRes] = await Promise.all([
          API.request(`/api/current-affairs?${params}`),
          API.request('/api/current-affairs/today')
        ]);
        if (listRes?.success) { setAffairs(listRes.data || []); setTotalPages(listRes.pagination?.totalPages || 1); }
        if (todayRes?.success) setTodayAffairs(todayRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [category, page, search, selectedMonth, selectedYear]);

  const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === CURRENT_YEAR;
  const hasFilters = search.trim() || !isCurrentMonth || category !== 'all';

  const filterPills = [
    { id: 'all', label: 'All', icon: Sparkles },
    ...categories.slice(1).map(c => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1), icon: (catConfig[c] || defaultCat).icon }))
  ];

  if (loading && affairs.length === 0) return <CASkeleton />;

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in bg-transparent font-outfit pb-10">
      <Seo title="Daily Current Affairs – Free GA & GK for Government Exams | AajExam"
        description="Daily current affairs for SSC, UPSC, Banking, Railway and State PSC exams."
        canonical="/current-affairs"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Current Affairs', url: '/current-affairs' }])} />

      {/* ── Hero ── */}
      <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-b-2 border-black/20 dark:border-white/20 px-0 py-4 lg:p-8">
        <div className="absolute inset-0 bg-white dark:bg-black" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-black/10 dark:bg-white/20 px-5 py-2 rounded-full text-black dark:text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-black/20 dark:border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {affairs.length} Updates Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-black dark:text-white tracking-tighter">Current Affairs</h1>
          {/* Search + Date */}
          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search current affairs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border-none" />
            </div>
            <div className="relative flex gap-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <select value={selectedMonth} onChange={e => { setSelectedMonth(Number(e.target.value)); setPage(1); }}
                className="bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white outline-none border-none appearance-none cursor-pointer">
                {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={e => { setSelectedYear(Number(e.target.value)); setPage(1); }}
                className="bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-900 dark:text-white outline-none border-none appearance-none cursor-pointer">
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button onClick={() => { setSearch(''); setSelectedMonth(now.getMonth() + 1); setSelectedYear(CURRENT_YEAR); setCategory('all'); setPage(1); }}
                className="flex items-center gap-1 px-4 py-2.5 bg-black/10 dark:bg-white/20 text-black dark:text-white rounded-lg lg:rounded-xl text-xs font-black uppercase border border-black/20 dark:border-white/30">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
        <Newspaper className="absolute -bottom-10 -right-10 w-80 h-80 text-black/10 dark:text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Filters ── */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filterPills.map(f => (
              <button key={f.id} onClick={() => { setCategory(f.id); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  category === f.id
                    ?'bg-primary-700 text-white border-primary-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Today highlight */}
        {todayAffairs?.total > 0 && !search && isCurrentMonth && category === 'all' && (
          <div className="bg-slate-100 dark:bg-slate-800 dark:bg-white/20 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 dark:border-white/30">
            <h2 className="text-sm font-black text-black dark:text-white mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Today — {todayAffairs.total} Updates
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(todayAffairs.grouped || {}).map(([cat, items]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize hover:bg-slate-100 transition-colors">
                  {cat}: {items.length}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {affairs.map((affair, idx) => {
            const cfg = catConfig[affair.category] || defaultCat;
            const Icon = cfg.icon;
            return (
              <motion.div key={affair._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card hoverable onClick={() => router.push(`/current-affairs/${affair.slug}`)}
                  className="group p-5 flex flex-col gap-4 border-border-primary hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${cfg.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-content-primary tracking-tight line-clamp-2 leading-tight">{affair.title}</h3>
                        <p className="text-[10px] font-bold text-content-muted uppercase mt-0.5">
                          {new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {affair.keyPoints?.[0] && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{affair.keyPoints[0]}</p>
                  )}

                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg lg:rounded-xl border ${cfg.chip}`}>
                      <Tag className="w-3 h-3" />
                      {affair.category}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-600">
                      <Eye className="w-3 h-3" />
                      {affair.views || 0}
                    </div>
                    {affair.questions?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 dark:bg-white/30 px-2.5 py-1.5 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                        <Tag className="w-3 h-3" />
                        {affair.questions.length} Qs
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {affairs.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <Newspaper className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">No current affairs found</h3>
              <button onClick={() => { setSearch(''); setSelectedDate(null); setCategory('all'); }}
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

export default CurrentAffairsPage;
