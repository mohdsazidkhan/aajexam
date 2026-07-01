'use client';
import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Pin, Eye, ChevronRight, TrendingUp, Sparkles, Bell, CreditCard, BarChart2, Key, Users, Clock, AlertTriangle, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

const NewsSkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="flex gap-2 px-1">{[1,2,3,4,5].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 border-b-8 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <div className="flex gap-2"><Sh className="h-7 w-20 rounded-xl" /><Sh className="h-7 w-16 rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Type config ───────────────────────────────────────────────────────────────
const typeConfig = {
  notification: { icon: Bell,         color: 'from-blue-500 to-blue-700',    chip: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50',       label: 'Notification' },
  admit_card:   { icon: CreditCard,   color: 'from-emerald-500 to-emerald-700', chip: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50', label: 'Admit Card' },
  result:       { icon: BarChart2,    color: 'from-orange-500 to-orange-700', chip: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800/50', label: 'Result' },
  answer_key:   { icon: Key,          color: 'from-purple-500 to-purple-700', chip: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800/50', label: 'Answer Key' },
  vacancy:      { icon: Users,        color: 'from-pink-500 to-pink-700',     chip: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 border-pink-100 dark:border-pink-800/50',     label: 'Vacancy' },
  date_change:  { icon: AlertTriangle, color: 'from-red-500 to-red-700',     chip: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50',           label: 'Date Change' },
};
const defaultType = { icon: Megaphone, color: 'from-slate-400 to-slate-600', chip: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600', label: 'Other' };

const typeFilters = [
  { id: 'all', label: 'All News', icon: Sparkles },
  ...Object.entries(typeConfig).map(([id, c]) => ({ id, label: c.label, icon: c.icon }))
];

const ExamNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 30 });
        if (type !== 'all') params.set('type', type);
        if (search.trim()) params.set('search', search.trim());
        const res = await API.request(`/api/exam-news?${params}`);
        if (res?.success) { setNews(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [type, page, search]);

  if (loading && news.length === 0) return <NewsSkeleton />;

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in bg-transparent font-outfit pb-10">
      <Seo title="Exam News & Job Alerts – Notifications, Admit Cards, Results | AajExam"
        description="Stay updated with the latest government exam notifications, admit cards, results, answer keys and vacancies."
        canonical="/exam-news"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Exam News', url: '/exam-news' }])} />

      {/* ── Hero ── */}
      <section className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-amber-600/20 dark:border-amber-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-500 dark:from-slate-900 dark:via-amber-900/40 dark:to-slate-900" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {news.length} News Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Exam News Hub</h1>
          <div className="w-full max-w-lg mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search news..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
          </div>
        </div>
        <Megaphone className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Filters ── */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {typeFilters.map(f => (
              <button key={f.id} onClick={() => { setType(f.id); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 ${
                  type === f.id
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {news.map((item, idx) => {
            const cfg = typeConfig[item.type] || defaultType;
            const Icon = cfg.icon;
            return (
              <motion.div key={item._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card hoverable onClick={() => router.push(`/exam-news/${item.slug}`)}
                  className="group p-5 flex flex-col gap-4 border-border-primary hover:border-amber-500 transition-all rounded-[1.5rem] bg-background-surface shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0 shadow-md relative`}>
                        <Icon className="w-6 h-6 text-white" />
                        {item.isPinned && <Pin className="w-3 h-3 text-red-400 absolute -top-1 -right-1" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-content-primary tracking-tight line-clamp-2 leading-tight">{item.title}</h3>
                        {item.exam?.name && <p className="text-[10px] font-bold text-content-muted uppercase mt-0.5">{item.exam.name}</p>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {item.importantDates?.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      <Calendar className="w-3 h-3" />
                      {item.importantDates[0].label}: {new Date(item.importantDates[0].date).toLocaleDateString('en-IN')}
                    </div>
                  )}

                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border ${cfg.chip}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                    {item.isPinned && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 dark:text-red-400 uppercase bg-red-50 dark:bg-red-900/30 px-2.5 py-1.5 rounded-xl border border-red-100 dark:border-red-800/50">
                        <Pin className="w-3 h-3" /> Pinned
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {news.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <Megaphone className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">No news found</h3>
              <button onClick={() => { setType('all'); setSearch(''); setPage(1); }}
                className="px-6 py-2.5 bg-amber-500 text-white rounded-full font-black text-xs uppercase">View All</button>
            </div>
          )}
        </div>

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

export default ExamNewsPage;
