'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import {
  Search,
  X,
  Zap,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Compass,
  Target,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import PublicQuestionsList from '../../components/PublicQuestionsList';
import Loading from '../../components/Loading';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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
  const isLoadingRef = useRef(false);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const load = useCallback(async (resetPage = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    const currentPage = resetPage ? 1 : page;
    setLoading(true);
    try {
      const searchParam = searchTermRef.current.trim() || '';
      const res = await API.getPublicUserQuestions({ page: currentPage, limit, search: searchParam });
      if (res?.success) {
        const list = res.data || [];
        setItems(list);
        setTotal(res.pagination?.total || 0);
        setPage(currentPage);
        setHasMore(list.length === limit && list.length < (res.pagination?.total || 0));
      }
    } catch (e) {
      toast.error('Global stream link failure');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [limit, page]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const searchParam = searchTermRef.current.trim() || '';
      const res = await API.getPublicUserQuestions({ page: nextPage, limit, search: searchParam });
      if (res?.success) {
        const newItems = res.data || [];
        setItems(prev => {
          const updated = [...prev, ...newItems];
          setPage(nextPage);
          setHasMore(newItems.length === limit && updated.length < (res.pagination?.total || 0));
          return updated;
        });
      }
    } catch (e) {
      console.error('Buffer sync failed');
    } finally {
      setLoadingMore(false);
    }
  }, [page, limit, loadingMore, hasMore]);

  const handleSearch = useCallback(() => {
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
    searchTermRef.current = '';
    load(true);
  }, [load]);

  useEffect(() => {
    if (isInitialMount.current) {
      load(true);
      isInitialMount.current = false;
    }
  }, [load]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  const answer = async (q, idx) => {
    try {
      if (typeof q.selectedOptionIndex === 'number') return;
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: idx, isAnswered: true } : it));
      await API.answerUserQuestion(q._id, idx);
      toast.success('Answer recorded!');
    } catch (e) {
      toast.error('Failed to record answer.');
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
        navigator.share({ title: 'Global Question', text: q.questionText, url: window.location.href }).catch(() => { });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Profile link copied to clipboard');
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
    <MobileAppWrapper title="Community Feed">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">

        <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-12">

          {/* --- Stream Hero --- */}
          <header className="relative flex flex-col items-center text-center space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Sparkles className="w-10 h-10" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight">Community <span className="text-primary-500">Feed</span></h1>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Explore and solve questions shared by the community</p>
            </div>
          </header>

          {/* --- Search & Discovery Hub --- */}
          <section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (isSearchActive ? handleClearSearch() : handleSearch())}
                placeholder="SEARCH BY TOPIC, SUBJECT OR KEYWORD..."
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 pl-16 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-500 transition-all"
              />
            </div>
            <div className="flex gap-4">
              <Button
                variant={isSearchActive ? 'ghost' : 'secondary'}
                onClick={isSearchActive ? handleClearSearch : handleSearch}
                className="px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-secondary"
              >
                {isSearchActive ? 'CLEAR ALL' : 'SEARCH'}
              </Button>
            </div>
          </section>

          {/* --- Stream Content --- */}
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="py-24 flex justify-center"><Loading size="lg" /></div>
              ) : items.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center space-y-8">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto">
                    <Layers className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black font-outfit uppercase">No Results</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">No questions detected in the current range. Try broad-spectrum searching.</p>
                  </div>
                  <Button variant="secondary" onClick={handleClearSearch} className="px-12 py-5 rounded-3xl">RETURN TO MAIN FEED</Button>
                </motion.div>
              ) : (
                <PublicQuestionsList
                  items={items}
                  onAnswer={answer}
                  onLike={like}
                  onShare={share}
                  onView={view}
                  startIndex={0}
                />
              )}
            </AnimatePresence>

            {/* Infinite Scroll Management */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" />
                  <div className="w-4 h-4 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <div className="w-4 h-4 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.4s]" />
                </div>
              )}
              {!hasMore && items.length > 0 && (
                <div className="text-center space-y-2 opacity-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">End of Feed</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Feed fully synchronized</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PublicUserQuestions;

