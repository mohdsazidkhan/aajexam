'use client';
import PageHero from '@/components/common/ui/PageHero';
import React, { useState, useEffect } from 'react';
import { MessageCircleQuestion, Landmark, Briefcase, Sparkles, Search, ChevronRight, Eye, TrendingUp, ListFilter } from 'lucide-react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion } from 'framer-motion';
import API from '../lib/api';
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

const InterviewQuestionsSkeleton = () => (
  <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
    <div className="h-40 xl:h-52 w-full rounded-[2.5rem] animate-pulse bg-primary-600/25 dark:bg-primary-500/25 border-b-2 border-primary-600/30 mt-4 xl:mt-8" />
    <div className="flex gap-2 px-1">{[1, 2].map(i => <Sh key={i} className="h-10 w-32 rounded-full" />)}</div>
    <div className="flex gap-2 px-1">{[1, 2, 3, 4].map(i => <Sh key={i} className="h-9 w-24 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <div className="flex gap-2"><Sh className="h-7 w-20 rounded-lg xl:rounded-xl" /></div>
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
const CategoryCard = ({ category, index, typeLabel }) => {
  return (
    <Link href={`/${category.slug}-interview-questions`} className="block">
    <Card padded={false} hoverable
      className="overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] cursor-pointer">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-5 bg-background-surface">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-xl sm:rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs sm:text-base font-black tabular-nums">
            {index + 1}
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
    </Link>
  );
};

const InterviewQuestionsPage = ({ initialCategories = [] } = {}) => {
  const { translate } = useTranslate();
  const [type, setType] = useState('all');
  const [language, setLanguage] = useState('en');
  const [categories, setCategories] = useState(initialCategories);
  const [loadingCategories, setLoadingCategories] = useState(initialCategories.length === 0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [qPage, setQPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
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
        const params = new URLSearchParams({ search: search.trim(), page: qPage, limit: pageSize });
        if (type !== 'all') params.set('type', type);
        const res = await API.request(`/api/interview-questions?${params}`);
        if (res?.success) { setQuestions(res.data || []); setQTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoadingQuestions(false); }
    };
    fetchMatchingQuestions();
  }, [search, type, qPage, pageSize]);

  const filteredCategories = search.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : categories;

  if (loadingCategories && categories.length === 0) return <InterviewQuestionsSkeleton />;

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo title="Interview Questions – Govt & Private Job Interview Prep | AajExam"
        description="Common personal-interview questions and expert tips for government job interviews (Banking, SSC, Railway, Police) and private job interviews (HR round, IT, Sales)."
        canonical="/interview-questions"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Interview Questions', url: '/interview-questions' }])} />

      {/* ── Hero ── */}
      <PageHero
        icon={MessageCircleQuestion}
        eyebrow={translate('Interview Questions')}
        title={translate('Interview Questions')}
        subtitle={translate('{count} Questions Available', { count: totalQuestions })}
        center={
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={translate('Search categories or questions...')} value={search} onChange={e => { setSearch(e.target.value); setQPage(1); }}
                className="w-full bg-white dark:bg-black rounded-lg xl:rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-300 dark:border-slate-600" />
            </div>
          </div>
        }
        actions={
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
        {Object.entries(typeConfig).map(([id, c]) => (
          <button key={id} onClick={() => setType(id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-black uppercase text-[11px] whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
              type === id
                ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 border-primary-500'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
            <c.icon className="w-4 h-4 shrink-0" /> {c.label}
          </button>
        ))}
          </div>
        }
      />


      {/* ── Matching questions (server search, shown only while searching) ── */}
      {search.trim() && (
        <section className="space-y-2 xl:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Search className="w-4 h-4 text-primary-600 shrink-0" />
            <h2 className="text-xs font-black uppercase tracking-wide text-content-primary">{translate('Matching Questions')}</h2>
          </div>

          {loadingQuestions && questions.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-content-muted">{translate('Searching…')}</div>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-content-muted">{translate('No questions match your search.')}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
                {questions.map((q, idx) => {
                  return (
                    <motion.div key={q._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                      <Card hoverable onClick={() => router.push(`/interview-questions/${q.slug}`)}
                        className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                              {(qPage - 1) * pageSize + idx + 1}
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

              <div className="pt-6"><Pagination currentPage={qPage} totalPages={qTotalPages} onPageChange={setQPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setQPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
            </>
          )}
        </section>
      )}

      {/* ── Browse by category: accordion cards ── */}
      <section className="space-y-2 xl:space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <ListFilter className="w-4 h-4 text-primary-600 shrink-0" />
            <h2 className="text-xs font-black uppercase tracking-wide text-content-primary truncate">{translate('Browse by Category')}</h2>
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
              {search ? translate('No categories match your search.') : translate('No categories yet.')}
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-black text-xs uppercase">{translate('Clear Search')}</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-4 items-start">
            {filteredCategories.map((c, idx) => (
              <CategoryCard key={c._id} category={c} index={idx}
                typeLabel={type === 'all' ? (typeConfig[c.type]?.label || null) : null} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default InterviewQuestionsPage;

export async function getServerSideProps({ res }) {
  try {
    const dbConnect = (await import('../lib/db')).default;
    const InterviewCategory = (await import('../models/InterviewCategory')).default;
    await dbConnect();
    const categories = await InterviewCategory.find({ isActive: true })
      .select('name slug type order')
      .sort({ order: 1, name: 1 })
      .lean();
    if (res) res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return { props: { initialCategories: JSON.parse(JSON.stringify(categories)) } };
  } catch (e) {
    console.error('interview questions hub ssr error', e);
    return { props: { initialCategories: [] } };
  }
}
