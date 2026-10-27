'use client';

import { CardGridSkeleton } from '../../common/skeletons/PageSkeletons';
import React, { useCallback, useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from '@/components/common/AppLink';
import API from '../../../lib/api';
import MobileAppWrapper from '../../common/MobileAppWrapper';
import PageHero from '../../common/ui/PageHero';
import {
  Bookmark, ArrowLeft, Heart, Eye, HelpCircle, BookOpen, Zap, Newspaper, BarChart3, Flame
} from 'lucide-react';
import useTranslate from '../../../hooks/useTranslate';

const TYPE_ICONS = { question: HelpCircle, fact: BookOpen, tip: Zap, current_affairs: Newspaper, poll: BarChart3 };
const TYPE_COLORS = {
  question: 'bg-background-surface-secondary text-content-primary',
  fact: 'bg-background-surface-secondary text-content-primary',
  tip: 'bg-background-surface-secondary text-content-primary',
  current_affairs: 'bg-background-surface-secondary text-content-primary',
  poll: 'text-primary-600',
};

const ReelsSaved = () => {
  const { translate } = useTranslate();
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
      toast.error(translate('Failed to load saved reels'));
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
      <div className="min-h-screen bg-background-page">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <PageHero
            icon={Bookmark}
            eyebrow="Saved Reels"
            title="Saved Reels"
            actions={
              <Link href="/reels" aria-label="Back" className="w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-background-surface ring-1 ring-primary-200 dark:bg-white/10 dark:hover:bg-white/20 dark:ring-white/20 text-primary-600 dark:text-white transition-colors" style={{ borderRadius: 999 }}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            }
          />
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {loading ? <CardGridSkeleton count={6} variant="media" /> : reels.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 text-on-primary bg-primary-600" style={{ borderRadius: 24 }}>
                <Bookmark className="w-10 h-10" />
              </div>
              <p className="text-xl font-bold text-content-primary tracking-tight">{translate('No saved reels yet')}</p>
              <p className="text-sm text-content-muted mt-2 max-w-[200px] mx-auto">{translate('Bookmark interesting reels to revisit them anytime')}</p>
              <Link href="/reels" style={{ borderRadius: 14 }} className="inline-block mt-8 px-8 py-3 text-on-primary text-sm font-bold uppercase tracking-[0.08em] hover:brightness-105 transition-all active:scale-95 bg-primary-600">
                {translate('Browse Reels')}
              </Link>
            </div>
          ) : (
            <div className="space-y-2 xl:space-y-4">
              {reels.map((reel, i) => {
                const Icon = TYPE_ICONS[reel.type];
                return (
                  <motion.div
                    key={reel._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-5 hover:-translate-y-0.5 transition-all group active:scale-[0.98]"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary-600" />
                    <div className="flex items-start gap-4">
                      <div style={{ borderRadius: 14 }} className="w-12 h-12 flex items-center justify-center shrink-0 text-on-primary bg-primary-600">
                        {Icon && <Icon className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.08em] ${TYPE_COLORS[reel.type]}`}>
                            {reel.type === 'current_affairs' ? 'CA' : reel.type}
                          </span>
                          {reel.subject && reel.subject !== 'General' && (
                            <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{reel.subject}</span>
                          )}
                          {reel.difficulty && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${reel.difficulty === 'easy' ? 'border-primary-200 text-primary-600 dark:border-primary-900/30 dark:text-primary-600'
                              : reel.difficulty === 'hard' ? 'border-border-primary text-content-primary'
                                : 'border-border-primary text-content-primary'}`}>
                              {reel.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-bold text-content-primary line-clamp-2 leading-snug">{getPreviewText(reel)}</p>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-primary dark:border-slate-800/50 text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
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
                  style={{ borderRadius: 12 }} className="w-full py-3 text-sm font-bold uppercase tracking-wide text-primary-600 bg-background-surface border border-border-primary hover:border-primary-500 transition-all"
                >
                  {translate('Load more')}
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
