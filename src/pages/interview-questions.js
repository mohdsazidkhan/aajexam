'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircleQuestion, Landmark, Briefcase, Sparkles, Search, ChevronRight, Eye, TrendingUp, ListFilter } from 'lucide-react';
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
  all: { icon: Sparkles, label: 'All' },
  government: { icon: Landmark, label: 'Govt. Jobs' },
  private: { icon: Briefcase, label: 'Private Jobs' },
};

// ─── Category Card ──────────────────────────────────────────────────────────
// Clicking a card navigates straight to that category's own detail page
// (/interview-questions/category/[slug]) instead of expanding inline.
const CategoryCard = ({ category, index, TypeIcon, typeLabel }) => {
  const router = useRouter();
  return (
    <Card padded={false} hoverable onClick={() => router.push(`/${category.slug}-interview-questions`)}
      className="overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] cursor-pointer">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-5 bg-background-surface">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm">
            <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-black" />
          </div>
          <div className="min-w-0 text-left">
            <h3 className="text-xs sm:text-sm font-black text-content-primary truncate">{category.name}</h3>
            {typeLabel && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-content-muted">
                {typeLabel}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-content-muted shrink-0" />
      </div>
    </Card>
  );
};

const InterviewQuestionsPage = () => {
  const [type, setType] = useState('all');
  const [language, setLanguage] = useState('en');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => { setQPage(1); }, [type]);

  // Categories for the selected type ('all' fetches across both).
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const qs = type === 'all' ? '' : `?type=${type}`;
        const res = await API.request(`/api/interview-categories${qs}`);
        if (res?.success) setCategories(res.data || []);
      } catch (e) { } finally { setLoadingCategories(false); }
    };
    fetchCategories();
  }, [type]);

  // Lightweight count for the hero badge only — doesn't drive the list below.
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const params = new URLSearchParams({ limit: 1 });
        if (type !== 'all') params.set('type', type);
        const res = await API.request(`/api/interview-questions?${params}`);
        if (res?.success) setTotalQuestions(res.pagination?.total || 0);
      } catch (e) { }
    };
    fetchTotal();
  }, [type]);

  // Search covers both: the category list (by name, client-side) and the
  // actual question text (server-side, since questions aren't all loaded).
  useEffect(() => {
    if (!search.trim()) { setQuestions([]); setQTotalPages(1); return; }
    const fetchMatchingQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const params = new URLSearchParams({ search: search.trim(), page: qPage, limit: 30 });
        if (type !== 'all') params.set('type', type);
        const res = await API.request(`/api/interview-questions?${params}`);
        if (res?.success) { setQuestions(res.data || []); setQTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoadingQuestions(false); }
    };
    fetchMatchingQuestions();
  }, [search, type, qPage]);

  const filteredCategories = search.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : categories;

  if (loadingCategories && categories.length === 0) return <InterviewQuestionsSkeleton />;

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
            <TrendingUp className="w-3.5 h-3.5" /> {totalQuestions} Questions Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Interview Questions</h1>
          <div className="w-full max-w-lg px-2 lg:px-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search categories or questions..." value={search} onChange={e => { setSearch(e.target.value); setQPage(1); }}
                className="w-full bg-slate-50 dark:bg-black rounded-lg lg:rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border-none" />
            </div>
          </div>
        </div>
        <MessageCircleQuestion className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── All / Government / Private toggle ── */}
      <div className="flex gap-2 px-1 overflow-x-auto no-scrollbar sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-0 lg:py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
        {Object.entries(typeConfig).map(([id, c]) => (
          <button key={id} onClick={() => setType(id)}
            className={`min-w-[110px] flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 rounded-full font-black uppercase text-[11px] sm:text-xs whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
              type === id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
            <c.icon className="w-4 h-4 shrink-0" /> {c.label}
          </button>
        ))}
      </div>

      {/* ── Matching questions (server search, shown only while searching) ── */}
      {search.trim() && (
        <section className="space-y-2 lg:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Search className="w-4 h-4 text-primary-600 shrink-0" />
            <h2 className="text-xs font-black uppercase tracking-wide text-content-primary">Matching Questions</h2>
          </div>

          {loadingQuestions && questions.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-content-muted">Searching…</div>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-content-muted">No questions match your search.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {questions.map((q, idx) => {
                  const cfg = typeConfig[q.category?.type] || typeConfig.government;
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={q._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                      <Card hoverable onClick={() => router.push(`/interview-questions/${q.slug}`)}
                        className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shrink-0">
                              {(qPage - 1) * 30 + idx + 1}
                            </span>
                            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm">
                              <Icon className="w-6 h-6 text-white dark:text-black" />
                            </div>
                            <div>
                              <h3 className={`text-sm font-black text-content-primary tracking-tight line-clamp-2 ${language === 'hi' && q.questionHi ? 'leading-relaxed' : 'leading-tight'}`}>
                                {(language === 'hi' && q.questionHi) || q.question}
                              </h3>
                              {q.category?.name && (
                                <p className="text-[12px] font-bold text-content-muted uppercase mt-0.5">{q.category.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase shrink-0">
                              <Eye className="w-3 h-3" />
                              {q.views || 0}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {qTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-2">
                  <button disabled={qPage === 1} onClick={() => setQPage(qPage - 1)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm font-black disabled:opacity-30">Prev</button>
                  <span className="text-sm font-black text-slate-500">Page {qPage} of {qTotalPages}</span>
                  <button disabled={qPage === qTotalPages} onClick={() => setQPage(qPage + 1)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm font-black disabled:opacity-30">Next</button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Browse by category: accordion cards ── */}
      <section className="space-y-2 lg:space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <ListFilter className="w-4 h-4 text-primary-600 shrink-0" />
            <h2 className="text-xs font-black uppercase tracking-wide text-content-primary truncate">Browse by Category</h2>
          </div>
          <div className="flex rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
            {[{ id: 'en', label: 'EN' }, { id: 'hi', label: 'HI' }].map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)}
                className={`px-3 py-1.5 font-black uppercase text-[10px] transition-all ${
                  language === l.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <MessageCircleQuestion className="w-16 h-16 text-slate-200 mx-auto" />
            <p className="text-sm font-bold text-content-muted">
              {search ? 'No categories match your search.' : 'No categories yet.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">Clear Search</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 items-start">
            {filteredCategories.map((c, idx) => (
              <CategoryCard key={c._id} category={c} index={idx}
                TypeIcon={(typeConfig[c.type] || typeConfig.government).icon}
                typeLabel={type === 'all' ? (typeConfig[c.type]?.label || null) : null} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default InterviewQuestionsPage;
