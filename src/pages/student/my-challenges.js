'use client';

import PageHero from '@/components/common/ui/PageHero';
import { ChallengesPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import {
   Swords, Search, Clock, Trophy, Target, ChevronRight, Copy, CheckCircle
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import useTranslate from '../../hooks/useTranslate';

const PAGE_SIZE = 20;

const MyChallengesPage = () => {
  const { translate, translateData } = useTranslate();
   const [challenges, setChallenges] = useState([]);
   const [loading, setLoading] = useState(true);
   const [loadingMore, setLoadingMore] = useState(false);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [copiedId, setCopiedId] = useState(null);
   const router = useRouter();

   const fetchChallenges = async (pageNum = 1, append = false) => {
      try {
         if (append) setLoadingMore(true); else setLoading(true);
         const res = await API.request(`/api/challenge/my-challenges?page=${pageNum}&limit=${PAGE_SIZE}`);
         if (res?.success) {
            setChallenges((prev) => append ? [...prev, ...(res.data || [])] : (res.data || []));
            setTotalPages(res.pagination?.totalPages || 1);
            setPage(pageNum);
         }
      } catch (e) {
         toast.error(translate('Could not load your challenges'));
      } finally {
         setLoading(false);
         setLoadingMore(false);
      }
   };

   const handleLoadMore = () => fetchChallenges(page + 1, true);

   // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
   useEffect(() => { fetchChallenges(1); }, []);

   const handleCopy = (code) => {
      const link = `${window.location.origin}/challenge/${code}`;
      navigator.clipboard.writeText(link);
      setCopiedId(code);
      toast.success(translate('Challenge link copied!'));
      setTimeout(() => setCopiedId(null), 2000);
   };

   if (loading && challenges.length === 0) return (
      <div className="min-h-screen bg-background-page pb-20 font-outfit selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
         <div className="py-2 xl:py-4"><ChallengesPageSkeleton count={3} /></div>
      </div>
   );

   return (
      <div className="min-h-screen pb-6 xl:pb-12">
         <Head>
            <title>My Challenges - AajExam</title>
            {/* Private dashboard — never index, even if the robots.txt rule changes. */}
            <meta name="robots" content="noindex,nofollow" />
         </Head>

         <div className="container mx-auto py-4 xl:py-4 xl:py-8 space-y-3 xl:space-y-6">
            <SubscriptionGuard message="Upgrade to PRO to view and track your multiplayer challenges.">
               <PageHero
                  icon={Swords}
                  eyebrow={translate('My Challenges')}
                  title={translate('My Challenges')}
                  actions={
                     <div className="ring-1 ring-slate-200 dark:ring-white/20 px-4 py-1.5 min-w-[96px]" style={{ borderRadius: 'var(--radius)' }}>
                        <p className="text-lg font-bold font-outfit leading-none text-primary-600">{challenges.length}</p>
                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 whitespace-nowrap">{translate('My Challenges')}</p>
                     </div>
                  }
               />

               {/* Results */}
               {challenges.length === 0 ? (
                  <div className="py-16 text-center space-y-2 xl:space-y-4">
                     <div className="w-20 h-20 bg-background-surface-secondary rounded-md flex items-center justify-center mx-auto border border-primary-600">
                        <Swords className="w-10 h-10 text-slate-300" />
                     </div>
                     <h2 className="text-xl font-bold text-content-muted">{translate('No challenges created yet')}</h2>
                     <p className="text-sm text-content-muted">{translate('Take a quiz and challenge your friends to beat your score!')}</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-4">
                     {challenges.map((challenge, idx) => {
                        const quiz = challenge.quiz || {};
                        const hostScore = challenge.hostAttempt?.score || 0;
                        const hostPercentage = challenge.hostAttempt?.percentage || 0;
                        const challengersCount = challenge.challengers?.length || 0;

                        return (
                           <motion.div key={challenge._id || idx} className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card as="section" className="p-0 h-full overflow-hidden group transition-all duration-300 border border-border-primary">
                                 {/* Challenge Header */}
                                 <section className="p-5 bg-background-surface-secondary border-b border-border-primary">
                                    <div className="flex justify-between items-start mb-4">
                                       <div>
                                          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-primary mb-1 flex items-center gap-1">
                                             <Swords className="w-3 h-3" /> {translate('Challenge Code: {code}', { code: challenge.code })}
                                          </div>
                                          <h2 className="text-lg font-bold text-content-primary line-clamp-1">{translateData(quiz.title) || translate('Unknown Quiz')}</h2>
                                          <p className="text-xs font-semibold text-content-muted">{new Date(challenge.createdAt).toLocaleDateString()} • {quiz.subject?.name || quiz.subject}</p>
                                       </div>
                                       
                                       <button 
                                          onClick={() => handleCopy(challenge.code)}
                                          className="p-2 bg-background-surface rounded-lg border border-border-primary text-content-secondary hover:text-content-primary dark:hover:text-white hover:border-slate-200 transition-colors"
                                          title={translate('Copy Invite Link')}
                                       >
                                          {copiedId === challenge.code ? <CheckCircle className="w-4 h-4 text-primary-600" /> : <Copy className="w-4 h-4" />}
                                       </button>
                                    </div>

                                    <div className="flex items-center gap-4 dark:bg-slate-900/60 p-3 rounded-lg xl:rounded-xl">
                                       <div className="flex-1">
                                          <div className="text-[10px] font-bold text-content-muted uppercase">{translate('Your Score')}</div>
                                          <div className="text-lg font-bold text-content-primary">{Math.round(hostPercentage)}%</div>
                                       </div>
                                       <div className="w-px h-8 bg-background-surface-secondary"></div>
                                       <div className="flex-1 text-right">
                                          <div className="text-[10px] font-bold text-content-muted uppercase">{translate('Challengers')}</div>
                                          <div className="text-lg font-bold text-content-secondary">{challengersCount}</div>
                                       </div>
                                    </div>
                                 </section>

                                 {/* Leaderboard Section */}
                                 <section className="p-5 bg-background-surface border border-border-primary">
                                    <h3 className="text-xs font-bold text-content-muted uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                                       <Trophy className="w-3.5 h-3.5" /> Opponent Scores
                                    </h3>
                                    
                                    {challengersCount === 0 ? (
                                       <div className="text-center py-4 text-sm font-medium text-content-muted bg-background-surface-secondary rounded-lg border border-dashed border-border-primary">
                                          {translate('No one has played this yet.')}
                                       </div>
                                    ) : (
                                       <div className="space-y-2">
                                          {challenge.challengers.slice(0, 3).map((ch, i) => (
                                             <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                                                (ch.attempt?.percentage || 0) > hostPercentage 
                                                   ? 'bg-background-surface-secondary border-border-primary' 
                                                   : 'border-primary-100 dark:border-primary-900/30'
                                             }`}>
                                                <div className="flex items-center gap-2">
                                                   <div className="w-6 h-6 bg-background-surface-secondary rounded-full flex items-center justify-center text-[10px] font-bold">
                                                      {ch.user?.name ? ch.user.name.charAt(0).toUpperCase() : '?'}
                                                   </div>
                                                   <span className="text-sm font-bold text-content-secondary">{ch.user?.name || translate('Unknown')}</span>
                                                </div>
                                                <div className={`text-sm font-bold ${(ch.attempt?.percentage || 0) > hostPercentage ? 'text-content-primary' : 'text-primary-600'}`}>
                                                   {Math.round(ch.attempt?.percentage || 0)}%
                                                </div>
                                             </div>
                                          ))}
                                          {challengersCount > 3 && (
                                             <div className="text-center pt-2">
                                                <span className="text-xs font-bold text-content-primary hover:underline cursor-pointer">{translate('+ {count} more opponents', { count: challengersCount - 3 })}</span>
                                             </div>
                                          )}
                                       </div>
                                    )}
                                 </section>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}

               {page < totalPages && (
                  <div className="flex justify-center pt-4">
                     <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-[0.08em] bg-background-surface-secondary text-content-secondary hover:bg-background-surface-secondary transition-all disabled:opacity-50"
                     >
                        {loadingMore ? translate('Loading…') : translate('Load More')}
                     </button>
                  </div>
               )}
            </SubscriptionGuard>
         </div>
      </div>
   );
};

export default MyChallengesPage;
