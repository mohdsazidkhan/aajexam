'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Search,
  HelpCircle,
  Zap,
  MessageSquare,
  TrendingUp,
  Map,
  Target,
  Activity,
  ArrowRight,
  ShieldCheck,
  History,
  CircleCheck,
  CircleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import UnifiedFooter from '../UnifiedFooter';
import PublicQuestionsList from '../PublicQuestionsList';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loading from '../Loading';

const PublicUserQuestions = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const observerTarget = useRef(null);
  const isInitialMount = useRef(true);

  const load = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setLoading(true);
    try {
      const searchParam = searchTerm.trim() || '';
      const res = await API.getPublicUserQuestions({ page: currentPage, limit, search: searchParam });
      if (res?.success) {
        const list = res.data || [];
        setItems(list);
        setTotal(res.pagination?.total || 0);
        setPage(currentPage);
        setHasMore(list.length === limit && list.length < (res.pagination?.total || 0));
      }
    } catch (e) {
      console.error('Failed to load questions', e);
    }
    finally { setLoading(false); }
  }, [page, limit, searchTerm]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const searchParam = searchTerm.trim() || '';
      const res = await API.getPublicUserQuestions({ page: nextPage, limit, search: searchParam });
      if (res?.success) {
        const newItems = res.data || [];
        setItems(prev => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(newItems.length === limit && (items.length + newItems.length) < (res.pagination?.total || 0));
      }
    } catch (e) {
      console.error('Failed to load more questions', e);
    }
    finally { setLoadingMore(false); }
  }, [page, limit, searchTerm, loadingMore, hasMore, items.length]);

  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    setPage(1);
    setHasMore(true);
    setIsSearchActive(true);
    load(true);
  }, [load]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(1);
    setHasMore(true);
    setIsSearchActive(false);
  }, []);

  useEffect(() => {
    load();
    isInitialMount.current = false;
  }, [load]);

  useEffect(() => {
    if (!isInitialMount.current && searchTerm === '' && !isSearchActive) {
      setPage(1);
      setHasMore(true);
      load(true);
    }
  }, [searchTerm, isSearchActive, load]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      }, { threshold: 0.1 }
    );
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [hasMore, loading, loadingMore, loadMore]);

  const answer = async (q, idx) => {
    try {
      if (typeof q.selectedOptionIndex === 'number') return;
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: idx, isAnswered: true } : it));
      const res = await API.answerUserQuestion(q._id, idx);
      if (res?.success) toast.success('Correct answer!');
      else toast.error('Wrong answer.');
    } catch (e) {
      toast.error('Answer failed to submit. Please try again.');
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: undefined, isAnswered: false } : it));
    }
  };

  const like = async (q) => {
    try {
      const res = await API.likeUserQuestion(q._id);
      if (res?.data?.firstTime) {
        setItems(prev => prev.map(it => it._id === q._id ? { ...it, likesCount: (it.likesCount || 0) + 1 } : it));
      }
    } catch (e) { }
  };

  const share = async (q) => {
    try {
      await API.shareUserQuestion(q._id);
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, sharesCount: (it.sharesCount || 0) + 1 } : it));
      if (navigator.share) {
        navigator.share({ title: 'AajExam Questions', text: q.questionText, url: window.location.href }).catch(() => { });
      }
    } catch (e) { }
  };

  const view = async (q) => {
    try {
      const res = await API.incrementUserQuestionView(q._id);
      if (res?.data?.firstTime) {
        setItems(prev => prev.map(it => it._id === q._id ? { ...it, viewsCount: (it.viewsCount || 0) + 1 } : it));
      }
    } catch (e) { }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">

      <div className="container mx-auto px-2 lg:px-6 py-4 space-y-6 lg:space-y-12">

        {/* --- Header Section --- */}
        <section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-primary-500/10">
            <MessageSquare className="w-10 h-10" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Student <span className="text-primary-700 dark:text-primary-500">Feed</span></h1>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] max-w-2xl mx-auto">A feed of questions shared by students in the community.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:gap-6 max-w-4xl mx-auto pt-6">
            {[
              { label: 'Total Questions', val: total.toLocaleString(), icon: History, color: 'primary' },
              { label: 'Active Students', val: '1.2K+', icon: Target, color: 'secondary' },
              { label: 'Uptime', val: '100%', icon: Activity, color: 'secondary' }
            ].map((s, i) => (
              <Card key={i} className="p-6 flex items-center gap-6 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-800/80 backdrop-blur-sm">
                <div className={`p-4 bg-${s.color}-500/10 text-${s.color}-500 rounded-2xl shadow-sm border-2 border-${s.color}-500/10`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-xl font-black font-outfit uppercase">{s.val}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* --- Search Section --- */}
        <section className="sticky top-4 z-40 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md py-4 border-b border-slate-100 dark:border-slate-800 rounded-3xl">
          <Card className="max-w-3xl mx-auto p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-none shadow-2xl rounded-full">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-700 dark:text-primary-500 transition-colors" />
                <input
                  type="text"
                  className="w-full bg-transparent border-none focus:ring-0 py-4 pl-14 pr-6 text-sm font-bold placeholder:text-slate-300 outline-none"
                  placeholder="Search for questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isSearchActive ? (
                <Button variant="ghost" onClick={handleClearSearch} className="rounded-full px-6 text-[10px] font-black uppercase font-outfit">CLEAR</Button>
              ) : (
                <Button variant="secondary" size="lg" className="rounded-full px-10 py-4 text-xs font-black shadow-duo-secondary font-outfit" type="submit">SEARCH</Button>
              )}
            </form>
          </Card>
        </section>

        {/* --- Main Feed --- */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-24 flex justify-center"><Loading size="lg" /></div>
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center space-y-8">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-slate-200 dark:border-slate-700">
                <Zap className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black font-outfit uppercase tracking-tight">No Questions Found</h3>
                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Found no questions matching your search for "{searchTerm}"</p>
              </div>
              <Button variant="ghost" onClick={handleClearSearch} className="text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-8 py-3">Reset Search</Button>
            </motion.div>
          ) : (
            <div className="space-y-12">
              <PublicQuestionsList
                items={items}
                onAnswer={answer}
                onLike={like}
                onShare={share}
                onView={view}
                startIndex={0}
              />

              {/* --- Loading More Indicator --- */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-12">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 px-8 py-4 rounded-[2rem] shadow-sm">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Loading more questions...</span>
                  </div>
                </div>
              )}

              {/* --- End of Feed --- */}
              {!hasMore && (
                <div className="text-center py-12 space-y-4">
                  <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-lg font-black font-outfit uppercase tracking-tight">End of Questions</h4>
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">You've reached the end of the feed.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

      </div>

      <UnifiedFooter />
    </div>
  );
};

export default PublicUserQuestions;


