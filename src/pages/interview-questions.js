'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircleQuestion, Landmark, Briefcase, Search, ChevronRight, Eye, Sparkles, TrendingUp } from 'lucide-react';
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

const InterviewQuestionsSkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem] mt-4 lg:mt-8" />
    <div className="flex gap-2 px-1">{[1, 2].map(i => <Sh key={i} className="h-10 w-32 rounded-full" />)}</div>
    <div className="flex gap-2 px-1">{[1, 2, 3, 4].map(i => <Sh key={i} className="h-9 w-24 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <div className="flex gap-2"><Sh className="h-7 w-20 rounded-lg lg:rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

const typeConfig = {
  government: { icon: Landmark, label: 'Government Jobs' },
  private: { icon: Briefcase, label: 'Private Jobs' },
};

const InterviewQuestionsPage = () => {
  const [type, setType] = useState('government');
  const [language, setLanguage] = useState('en');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Reset category + page whenever the Government/Private toggle changes
  useEffect(() => {
    setCategory('all');
    setPage(1);
  }, [type]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.request(`/api/interview-categories?type=${type}`);
        if (res?.success) setCategories(res.data || []);
      } catch (e) { }
    };
    fetchCategories();
  }, [type]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 30, type });
        if (category !== 'all') params.set('category', category);
        if (search) params.set('search', search);
        const res = await API.request(`/api/interview-questions?${params}`);
        if (res?.success) { setQuestions(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchQuestions();
  }, [type, category, page, search]);

  if (loading && questions.length === 0 && categories.length === 0) return <InterviewQuestionsSkeleton />;

  return (
    <div className="space-y-3 lg:space-y-6 animate-fade-in bg-transparent font-outfit pb-4 lg:pb-8">
      <Seo title="Interview Questions – Govt & Private Job Interview Prep | AajExam"
        description="Common personal-interview questions and expert tips for government job interviews (Banking, SSC, Railway, Police) and private job interviews (HR round, IT, Sales)."
        canonical="/interview-questions"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Interview Questions', url: '/interview-questions' }])} />

      {/* ── Hero ── */}
      <section className="relative rounded-[2.5rem] overflow-hidden shadow-sm border-b-2 border-primary-600/20 dark:border-primary-900/30 px-0 py-4 lg:py-8">
        <div className="absolute inset-0 bg-primary-600 dark:bg-slate-900" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {questions.length} Questions Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Interview Questions</h1>
          <div className="w-full max-w-lg px-2 lg:px-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search interview questions..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-50 dark:bg-black rounded-lg lg:rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border-none" />
            </div>
          </div>
        </div>
        <MessageCircleQuestion className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Government / Private toggle + language switch ── */}
      <div className="flex gap-2 px-1">
        <div className="flex-1 flex gap-2">
          {Object.entries(typeConfig).map(([id, c]) => (
            <button key={id} onClick={() => setType(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full font-black uppercase text-xs transition-all border-b-2 active:translate-y-0.5 ${
                type === id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
              <c.icon className="w-4 h-4" /> {c.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
          {[{ id: 'en', label: 'EN' }, { id: 'hi', label: 'हिं' }].map(l => (
            <button key={l.id} onClick={() => { setLanguage(l.id); setPage(1); }}
              className={`px-4 py-3 font-black uppercase text-xs transition-all ${
                language === l.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category filters + grid ── */}
      <section className="space-y-2 lg:space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-0 lg:py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setCategory('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                category === 'all'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
              <Sparkles className="w-3.5 h-3.5" /> All
            </button>
            {categories.map(c => (
              <button key={c._id} onClick={() => setCategory(c._id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  category === c._id
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {questions.map((q, idx) => {
            const cfg = typeConfig[q.category?.type] || typeConfig.government;
            const Icon = cfg.icon;
            return (
              <motion.div key={q._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card hoverable onClick={() => router.push(`/interview-questions/${q.slug}`)}
                  className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-6 h-6 text-white dark:text-black" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-black text-content-primary tracking-tight line-clamp-2 ${language === 'hi' && q.questionHi ? 'leading-relaxed' : 'leading-tight'}`}>{(language === 'hi' && q.questionHi) || q.question}</h3>
                        {q.category?.name && (
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-[10px] font-bold text-content-muted uppercase">{q.category.name}</p>
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase shrink-0">
                              <Eye className="w-3 h-3" />
                              {q.views || 0}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {questions.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 lg:space-y-4">
              <MessageCircleQuestion className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">No questions found</h3>
              <button onClick={() => { setCategory('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">View All</button>
            </div>
          )}
        </div>

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

export default InterviewQuestionsPage;
