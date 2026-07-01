'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Calendar, Tag, Eye, ChevronRight, Search, X, TrendingUp, Sparkles, Globe, Flame, Trophy, Sword, Leaf } from 'lucide-react';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/datepicker-custom.css';
import { motion } from 'framer-motion';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

const CASkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="flex gap-2 px-1">{[1,2,3,4].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 border-b-8 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <Sh className="h-3 w-full rounded-lg" />
          <div className="flex gap-2"><Sh className="h-7 w-16 rounded-xl" /><Sh className="h-7 w-16 rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Category icon / color map ─────────────────────────────────────────────────
const catConfig = {
  national:      { icon: Globe,    color: 'from-blue-500 to-blue-700',    chip: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50' },
  international: { icon: Globe,    color: 'from-violet-500 to-violet-700', chip: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border-violet-100 dark:border-violet-800/50' },
  economy:       { icon: TrendingUp, color: 'from-emerald-500 to-emerald-700', chip: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50' },
  sports:        { icon: Trophy,   color: 'from-orange-500 to-orange-700', chip: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800/50' },
  science:       { icon: Sparkles, color: 'from-cyan-500 to-cyan-700',    chip: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-100 dark:border-cyan-800/50' },
  defence:       { icon: Sword,    color: 'from-red-500 to-red-700',      chip: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50' },
  environment:   { icon: Leaf,     color: 'from-green-500 to-green-700',  chip: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50' },
  awards:        { icon: Trophy,   color: 'from-amber-500 to-amber-700',  chip: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/50' },
  appointments:  { icon: Sparkles, color: 'from-pink-500 to-pink-700',    chip: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 border-pink-100 dark:border-pink-800/50' },
};
const defaultCat = { icon: Newspaper, color: 'from-slate-400 to-slate-600', chip: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' };

const categories = ['all', 'national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment'];

const CurrentAffairsPage = () => {
  const [affairs, setAffairs] = useState([]);
  const [todayAffairs, setTodayAffairs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 30 });
        if (category !== 'all') params.set('category', category);
        if (search.trim()) params.set('search', search.trim());
        if (selectedDate) { params.set('month', selectedDate.getMonth() + 1); params.set('year', selectedDate.getFullYear()); }
        const [listRes, todayRes] = await Promise.all([
          API.request(`/api/current-affairs?${params}`),
          API.request('/api/current-affairs/today')
        ]);
        if (listRes?.success) { setAffairs(listRes.data || []); setTotalPages(listRes.pagination?.totalPages || 1); }
        if (todayRes?.success) setTodayAffairs(todayRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [category, page, search, selectedDate]);

  const hasFilters = search.trim() || selectedDate || category !== 'all';

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
      <section className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-rose-600/20 dark:border-rose-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-600 to-rose-500 dark:from-slate-900 dark:via-rose-900/40 dark:to-slate-900" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {affairs.length} Updates Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Current Affairs</h1>
          {/* Search + Date */}
          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search current affairs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border-none" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <DatePicker selected={selectedDate} onChange={d => { setSelectedDate(d); setPage(1); }}
                dateFormat="MMM yyyy" showMonthYearPicker placeholderText="Pick month..." isClearable={false}
                className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border-none" />
            </div>
            {hasFilters && (
              <button onClick={() => { setSearch(''); setSelectedDate(null); setCategory('all'); setPage(1); }}
                className="flex items-center gap-1 px-4 py-2.5 bg-white/20 text-white rounded-xl text-xs font-black uppercase border border-white/30">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
        <Newspaper className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Filters ── */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filterPills.map(f => (
              <button key={f.id} onClick={() => { setCategory(f.id); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 ${
                  category === f.id
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Today highlight */}
        {todayAffairs?.total > 0 && !search && !selectedDate && category === 'all' && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30">
            <h2 className="text-sm font-black text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Today — {todayAffairs.total} Updates
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(todayAffairs.grouped || {}).map(([cat, items]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize hover:bg-rose-100 transition-colors">
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
                  className="group p-5 flex flex-col gap-4 border-border-primary hover:border-rose-500 transition-all rounded-[1.5rem] bg-background-surface shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-content-primary tracking-tight line-clamp-2 leading-tight">{affair.title}</h3>
                        <p className="text-[10px] font-bold text-content-muted uppercase mt-0.5">
                          {new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {affair.keyPoints?.[0] && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{affair.keyPoints[0]}</p>
                  )}

                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border ${cfg.chip}`}>
                      <Tag className="w-3 h-3" />
                      {affair.category}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                      <Eye className="w-3 h-3" />
                      {affair.views || 0}
                    </div>
                    {affair.questions?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50">
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
                className="px-6 py-2.5 bg-rose-500 text-white rounded-full font-black text-xs uppercase">View All</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-6">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-4 rounded-xl text-sm font-black disabled:opacity-30">Prev</button>
            <span className="text-sm font-black text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-4 rounded-xl text-sm font-black disabled:opacity-30">Next</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default CurrentAffairsPage;
