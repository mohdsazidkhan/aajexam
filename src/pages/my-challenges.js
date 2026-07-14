'use client';

import React, { useState, useEffect } from 'react';
import {
   Swords, Search, Clock, Trophy, Target, ChevronRight, Copy, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import API from '../lib/api';
import { ListSkeleton } from '../components/skeletons/PrivateSkeletons';
import Card from '../components/ui/Card';
import SubscriptionGuard from '../components/SubscriptionGuard';

const MyChallengesPage = () => {
   const [challenges, setChallenges] = useState([]);
   const [loading, setLoading] = useState(true);
   const [copiedId, setCopiedId] = useState(null);
   const router = useRouter();

   const fetchChallenges = async () => {
      try {
         setLoading(true);
         const res = await API.request('/api/challenge/my-challenges');
         if (res?.success) {
            setChallenges(res.data || []);
         }
      } catch (e) {
         toast.error("Could not load your challenges");
      } finally { setLoading(false); }
   };

   useEffect(() => { fetchChallenges(); }, []);

   const handleCopy = (code) => {
      const link = `${window.location.origin}/challenge/${code}`;
      navigator.clipboard.writeText(link);
      setCopiedId(code);
      toast.success('Challenge link copied!');
      setTimeout(() => setCopiedId(null), 2000);
   };

   if (loading && challenges.length === 0) return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-outfit selection:bg-indigo-500 selection:text-white">
         <div className="container mx-auto px-4 py-8"><ListSkeleton rows={6} /></div>
      </div>
   );

   return (
      <div className="min-h-screen pb-24">
         <Head><title>My Challenges - AajExam</title></Head>

         <div className="container mx-auto py-4 lg:py-8 space-y-6 px-4">
            <SubscriptionGuard message="Upgrade to PRO to view and track your multiplayer challenges.">
               {/* Header */}
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center lg:text-left">
                     <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">My Challenges</h1>
                     <p className="text-sm font-bold text-slate-400">Track the challenges you've sent to friends</p>
                  </div>
               </div>

               {/* Results */}
               {challenges.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                     <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                        <Swords className="w-10 h-10 text-slate-300" />
                     </div>
                     <h3 className="text-xl font-black text-slate-400">No challenges created yet</h3>
                     <p className="text-sm text-slate-500">Take a quiz and challenge your friends to beat your score!</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {challenges.map((challenge, idx) => {
                        const quiz = challenge.quiz || {};
                        const hostScore = challenge.hostAttempt?.score || 0;
                        const hostPercentage = challenge.hostAttempt?.percentage || 0;
                        const challengersCount = challenge.challengers?.length || 0;

                        return (
                           <motion.div key={challenge._id || idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-0 overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800">
                                 {/* Challenge Header */}
                                 <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-800/30">
                                    <div className="flex justify-between items-start mb-4">
                                       <div>
                                          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1">
                                             <Swords className="w-3 h-3" /> Challenge Code: {challenge.code}
                                          </div>
                                          <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{quiz.title || 'Unknown Quiz'}</h3>
                                          <p className="text-xs font-semibold text-slate-500">{new Date(challenge.createdAt).toLocaleDateString()} • {quiz.subject?.name || quiz.subject}</p>
                                       </div>
                                       
                                       <button 
                                          onClick={() => handleCopy(challenge.code)}
                                          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm"
                                          title="Copy Invite Link"
                                       >
                                          {copiedId === challenge.code ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                       </button>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl">
                                       <div className="flex-1">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase">Your Score</div>
                                          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{Math.round(hostPercentage)}%</div>
                                       </div>
                                       <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                       <div className="flex-1 text-right">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase">Challengers</div>
                                          <div className="text-lg font-black text-slate-700 dark:text-slate-300">{challengersCount}</div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Leaderboard Section */}
                                 <div className="p-5 bg-white dark:bg-slate-900">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                       <Trophy className="w-3.5 h-3.5" /> Opponent Scores
                                    </h4>
                                    
                                    {challengersCount === 0 ? (
                                       <div className="text-center py-4 text-sm font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                          No one has played this yet.
                                       </div>
                                    ) : (
                                       <div className="space-y-2">
                                          {challenge.challengers.slice(0, 3).map((ch, i) => (
                                             <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                                                (ch.attempt?.percentage || 0) > hostPercentage 
                                                   ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
                                                   : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                                             }`}>
                                                <div className="flex items-center gap-2">
                                                   <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                      {ch.user?.name ? ch.user.name.charAt(0).toUpperCase() : '?'}
                                                   </div>
                                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ch.user?.name || 'Unknown'}</span>
                                                </div>
                                                <div className={`text-sm font-black ${(ch.attempt?.percentage || 0) > hostPercentage ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                   {Math.round(ch.attempt?.percentage || 0)}%
                                                </div>
                                             </div>
                                          ))}
                                          {challengersCount > 3 && (
                                             <div className="text-center pt-2">
                                                <span className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer">+ {challengersCount - 3} more opponents</span>
                                             </div>
                                          )}
                                       </div>
                                    )}
                                 </div>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}
            </SubscriptionGuard>
         </div>
      </div>
   );
};

export default MyChallengesPage;
