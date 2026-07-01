'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Layers, Search, Sparkles, BrainCircuit,
  TrendingUp, ChevronRight, HelpCircle, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../lib/api';
import Card from '../ui/Card';
import Seo from '../Seo';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

const TopicListSkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="flex gap-2 px-1">
      {[1,2,3].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 border-b-8 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Sh className="h-4 w-3/4 rounded-lg" />
              <Sh className="h-2.5 w-1/2 rounded-full" />
            </div>
          </div>
          <Sh className="h-2.5 w-28 rounded-full" />
          <div className="flex gap-2">
            <Sh className="h-7 w-16 rounded-xl" />
            <Sh className="h-7 w-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const TopicListPage = () => {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    API.getAllTopics().then(res => {
      if (res.success) setTopics(res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filters = [
    { id: 'all', label: 'All Topics', icon: Sparkles },
    { id: 'quiz', label: 'Has Quizzes', icon: BrainCircuit },
    { id: 'question', label: 'Has Questions', icon: HelpCircle },
  ];

  const filtered = useMemo(() => {
    let list = topics;
    if (activeFilter === 'quiz') list = list.filter(t => (t.quizCount || 0) > 0);
    if (activeFilter === 'question') list = list.filter(t => (t.questionCount || 0) > 0);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.subject?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [topics, activeFilter, search]);

  if (loading) return <TopicListSkeleton />;

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in bg-transparent font-outfit pb-10">
      <Seo
        title="Topics – Granular MCQ Practice for Government Exams | AajExam"
        description="Practise topic-wise MCQs for SSC, UPSC, Banking and Railway exams."
        canonical="/topics"
      />

      {/* ── Hero ── */}
      <section className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-cyan-600/20 dark:border-cyan-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-cyan-500 dark:from-slate-900 dark:via-cyan-900/40 dark:to-slate-900" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {topics.length} Topics Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Topics Hub</h1>
          <div className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search topics..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-500/30 border-none" />
            </div>
          </div>
        </div>
        <Layers className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Filters ── */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 ${
                  activeFilter === f.id
                    ? 'bg-cyan-500 text-white border-cyan-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {filtered.map((topic, idx) => (
            <motion.div key={topic._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card hoverable onClick={() => router.push(`/topics/${topic.slug}`)}
                className="group p-5 flex flex-col gap-4 border-border-primary hover:border-cyan-500 transition-all rounded-[1.5rem] bg-background-surface shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{topic.name}</h3>
                      {topic.subject?.name && <p className="text-[10px] font-bold text-content-muted uppercase">{topic.subject.name}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-slate-500 dark:text-slate-400">
                  {topic.exams?.length > 0 && topic.exams.slice(0,2).map(e => (
                    <span key={e._id || e} className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{e.name || e}</span>
                  ))}
                </div>

                {/* Stat chips */}
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                    <BrainCircuit className="w-3 h-3" />
                    {topic.quizCount || 0} Quizzes
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-50 dark:bg-cyan-900/30 px-2.5 py-1.5 rounded-xl border border-cyan-100 dark:border-cyan-800/50">
                    <HelpCircle className="w-3 h-3" />
                    {topic.questionCount || 0} Qs
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <Layers className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">No topics found</h3>
              <button onClick={() => { setActiveFilter('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-cyan-500 text-white rounded-full font-black text-xs uppercase">View All</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TopicListPage;
