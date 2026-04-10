'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import API from '../../lib/api';
import Loading from '../Loading';
import MobileAppWrapper from '../MobileAppWrapper';
import {
  Bookmark, ArrowLeft, Heart, Eye, HelpCircle, BookOpen, Zap, Newspaper, BarChart3, Flame
} from 'lucide-react';

const TYPE_ICONS = { question: HelpCircle, fact: BookOpen, tip: Zap, current_affairs: Newspaper, poll: BarChart3 };
const TYPE_COLORS = {
  question: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fact: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  current_affairs: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  poll: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const ReelsSaved = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await API.getBookmarkedReels({ page, limit: 20 });
      if (res?.success) {
        if (page === 1) setReels(res.data);
        else setReels(prev => [...prev, ...res.data]);
        setHasMore(res.pagination?.hasMore || false);
      }
    } catch (err) {
      toast.error('Failed to load saved reels');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const getPreviewText = (reel) => {
    if (reel.type === 'question') return reel.questionText || reel.title;
    if (reel.type === 'poll') return reel.pollQuestion || reel.title;
    return reel.title || reel.content;
  };

  return (
    <MobileAppWrapper>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Link href="/reels" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-yellow-500" /> Saved Reels
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {loading ? <Loading /> : reels.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No saved reels yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-[200px] mx-auto">Bookmark interesting reels to revisit them anytime</p>
              <Link href="/reels" className="inline-block mt-8 px-8 py-3 rounded-2xl bg-primary-600 text-white text-sm font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-duo-primary active:scale-95">
                Browse Reels
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reels.map((reel, i) => {
                const Icon = TYPE_ICONS[reel.type];
                return (
                  <motion.div
                    key={reel._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${TYPE_COLORS[reel.type]}`}>
                        {Icon && <Icon className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${TYPE_COLORS[reel.type]}`}>
                            {reel.type === 'current_affairs' ? 'CA' : reel.type}
                          </span>
                          {reel.subject && reel.subject !== 'General' && (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{reel.subject}</span>
                          )}
                          {reel.difficulty && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${reel.difficulty === 'easy' ? 'border-green-200 text-green-600 dark:border-green-900/30 dark:text-green-400'
                              : reel.difficulty === 'hard' ? 'border-red-200 text-red-600 dark:border-red-900/30 dark:text-red-400'
                                : 'border-yellow-200 text-yellow-600 dark:border-yellow-900/30 dark:text-yellow-400'}`}>
                              {reel.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">{getPreviewText(reel)}</p>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {reel.viewsCount || 0}</span>
                          <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {reel.likesCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="w-full py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default ReelsSaved;
