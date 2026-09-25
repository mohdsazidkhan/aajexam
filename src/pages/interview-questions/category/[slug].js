'use client';
import React, { useState, useEffect } from 'react';
import { Landmark, Briefcase, Eye, ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Seo from '../../../components/Seo';
import { generateBreadcrumbSchema } from '../../../utils/schema';
import { DetailSkeleton } from '../../../components/skeletons/PrivateSkeletons';

const typeConfig = {
  government: { icon: Landmark, label: 'Govt. Jobs' },
  private: { icon: Briefcase, label: 'Private Jobs' },
};

const CategoryDetailPage = () => {
  const [category, setCategory] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [language, setLanguage] = useState('en');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const fetchCategory = async () => {
      try {
        setLoadingCategory(true);
        const res = await API.request(`/api/interview-categories/${slug}`);
        if (cancelled) return;
        if (res?.success) setCategory(res.data);
        else router.push('/interview-questions');
      } catch (e) {
        if (!cancelled) router.push('/interview-questions');
      } finally {
        if (!cancelled) setLoadingCategory(false);
      }
    };
    fetchCategory();

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!category?._id) return;
    let cancelled = false;

    const fetchQuestions = async (pageNum, append) => {
      try {
        setLoadingItems(true);
        const params = new URLSearchParams({ category: category._id, page: pageNum, limit: 20 });
        const res = await API.request(`/api/interview-questions?${params}`);
        if (cancelled || !res?.success) return;
        setItems(prev => (append ? [...prev, ...(res.data || [])] : (res.data || [])));
        setItemsTotalPages(res.pagination?.totalPages || 1);
        setItemsPage(pageNum);
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    };
    fetchQuestions(1, false);

    return () => { cancelled = true; };
  }, [category?._id]);

  const loadMore = async () => {
    if (!category?._id) return;
    try {
      setLoadingItems(true);
      const params = new URLSearchParams({ category: category._id, page: itemsPage + 1, limit: 20 });
      const res = await API.request(`/api/interview-questions?${params}`);
      if (res?.success) {
        setItems(prev => [...prev, ...(res.data || [])]);
        setItemsTotalPages(res.pagination?.totalPages || 1);
        setItemsPage(itemsPage + 1);
      }
    } finally {
      setLoadingItems(false);
    }
  };

  if (loadingCategory) return (
    <div className="min-h-screen pb-8 lg:pb-16 font-outfit">
      <div className="py-8"><DetailSkeleton /></div>
    </div>
  );
  if (!category) return null;

  const cfg = typeConfig[category.type] || typeConfig.government;
  const Icon = cfg.icon;
  const pageTitle = `${category.name} Interview Questions`;
  const canonical = `/${category.slug}-interview-questions`;

  return (
    <div className="min-h-screen pb-24 font-outfit">
      <Seo
        title={`${pageTitle} | AajExam`}
        description={`${pageTitle} with sample answers and expert tips for ${category.type === 'government' ? 'government' : 'private sector'} job interviews on AajExam.`}
        canonical={canonical}
        keywords={[pageTitle, category.name, 'interview questions', 'aajexam interview prep']}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Interview Questions', url: '/interview-questions' },
          { name: category.name, url: canonical }
        ])}
      />

      <div className="py-0 lg:py-6 space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => router.push('/interview-questions')} className="text-sm font-bold text-primary-600 flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Interview Questions
          </button>
          <div className="flex rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
            {[{ id: 'en', label: 'EN' }, { id: 'hi', label: 'HI' }].map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)}
                className={`px-4 py-2 font-black uppercase text-xs transition-all ${
                  language === l.id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm">
            <Icon className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white">{pageTitle}</h1>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-content-muted">
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {loadingItems && items.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-content-muted">Loading questions…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-content-muted">No questions yet.</div>
          ) : (
            items.map((q, idx) => (
              <Card key={q._id} hoverable padded={false} onClick={() => router.push(`/interview-questions/${q.slug}`)}
                className="group flex items-center gap-3 p-3 sm:p-4 border-2 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer rounded-[1.25rem]">
                <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className={`text-xs sm:text-sm font-bold text-content-primary line-clamp-2 flex-1 ${language === 'hi' && q.questionHi ? 'leading-relaxed' : 'leading-tight'}`}>
                  {(language === 'hi' && q.questionHi) || q.question}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase">
                    <Eye className="w-3 h-3" /> {q.views || 0}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            ))
          )}

          {itemsPage < itemsTotalPages && (
            <button onClick={loadMore} disabled={loadingItems}
              className="w-full py-3 text-center text-xs font-black uppercase text-primary-600 hover:underline disabled:opacity-50">
              {loadingItems ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
