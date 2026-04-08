'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { isMobile } from 'react-device-detect';
import {
   Trophy,
   Crown,
   Medal,
   ChevronRight,
   Search,
   Calendar,
   Target,
   Flame,
   Award,
   TrendingUp,
   Filter,
   User,
   Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import API from '../lib/api';
import config from '../lib/config/appConfig';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
import Skeleton from './Skeleton';

const TopPerformers = () => {
   const [activeTab, setActiveTab] = useState('monthly');
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'));
   const [selectedWeek, setSelectedWeek] = useState(() => {
      const d = dayjs();
      const oneJan = dayjs(d).startOf('year');
      const numberOfDays = d.diff(oneJan, 'day');
      const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
      return `${d.format('YYYY')}-W${weekNum}`;
   });
   const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format('YYYY-MM'));

   const router = useRouter();
   const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem("token");
   const userInfo = useMemo(() => {
      if (typeof window === 'undefined') return null;
      try {
         return JSON.parse(localStorage.getItem("userInfo") || 'null');
      } catch (e) {
         return null;
      }
   }, []);

   const fetchLeaders = useCallback(async () => {
      try {
         setLoading(true);
         const filters = {};
         if (activeTab === 'daily') filters.date = selectedDate;
         if (activeTab === 'weekly') filters.week = selectedWeek;
         if (activeTab === 'monthly') filters.date = selectedMonth;

         const res = await API.getPublicCompetitionLeaderboard(activeTab, 1, 20, {
            userId: userInfo?._id,
            ...filters
         });

         if (res.success) {
            setData({
               month: res.month || activeTab.toUpperCase(),
               top: res.leaderboard || res.data || [],
               currentUser: res.currentUser || res.data?.currentUser
            });
         }
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, [activeTab, selectedDate, selectedWeek, selectedMonth, userInfo?._id]);

   useEffect(() => { fetchLeaders(); }, [fetchLeaders]);

   if (loading) return (
      <div className="space-y-10 py-10">
         <div className="flex justify-center gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} width="120px" height="60px" borderRadius="1.5rem" />)}
         </div>
         <div className="flex justify-center items-end gap-6 h-64 px-10">
            <Skeleton width="100px" height="150px" borderRadius="2rem" />
            <Skeleton width="120px" height="200px" borderRadius="2rem" />
            <Skeleton width="100px" height="120px" borderRadius="2rem" />
         </div>
         <Skeleton height="400px" borderRadius="2rem" />
      </div>
   );

   const top3 = data?.top.slice(0, 3) || [];
   const others = data?.top.slice(3) || [];

   return (
      <div className="space-y-10 animate-fade-in">

         {/* --- Filter & Tab System --- */}
         <section className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200/50 dark:border-slate-700/30">
               {['daily', 'weekly', 'monthly'].map(tab => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`
                  px-4 lg:px-8 py-2.5 rounded-full font-black uppercase text-xs transition-all
                  ${activeTab === tab ? 'bg-primary-500 text-white shadow-duo-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'}
                `}
                  >
                     {tab}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-4">
               <Filter className="text-slate-600 dark:text-slate-400 w-5 h-5" />
               {activeTab === 'daily' && (
                  <div className="relative">
                     <DatePicker
                        selected={new Date(selectedDate)}
                        onChange={(date) => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date()}
                        className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-2.5 text-sm font-black uppercase tracking-tight focus:ring-2 focus:ring-primary-500 outline-none"
                     />
                  </div>
               )}
               {activeTab === 'weekly' && (
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <DatePicker
                           selected={dayjs(selectedWeek.split('-W')[0] + '-' + selectedMonth.split('-')[1]).toDate()}
                           onChange={(date) => {
                              setSelectedMonth(dayjs(date).format('YYYY-MM'));
                              const d = dayjs(date);
                              const oneJan = dayjs(d).startOf('year');
                              const numberOfDays = d.diff(oneJan, 'day');
                              const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                              setSelectedWeek(`${d.format('YYYY')}-W${weekNum}`);
                           }}
                           dateFormat="MMMM yyyy"
                           showMonthYearPicker
                           maxDate={new Date()}
                           className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-2.5 text-sm font-black uppercase tracking-tight focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                     </div>
                     <div className="flex gap-2">
                        {[1, 2, 3, 4].map(w => (
                           <button
                              key={w}
                              onClick={() => setSelectedWeek(`${dayjs(selectedMonth).format('YYYY')}-W${w}`)}
                              className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xs font-black transition-all ${selectedWeek.endsWith(`-W${w}`) ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                           >
                              W{w}
                           </button>
                        ))}
                     </div>
                  </div>
               )}
               {activeTab === 'monthly' && (
                  <div className="relative">
                     <DatePicker
                        selected={new Date(selectedMonth)}
                        onChange={(date) => setSelectedMonth(dayjs(date).format('YYYY-MM'))}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        maxDate={new Date()}
                        className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-2.5 text-sm font-black uppercase tracking-tight focus:ring-2 focus:ring-primary-500 outline-none"
                     />
                  </div>
               )}
            </div>
         </section>

         {/* --- The Winners Podium --- */}
         <section className="relative pt-12 pb-6 px-4">
            <div className="flex justify-center items-end gap-2 lg:gap-8 max-w-4xl mx-auto">

               {/* Rank 2 */}
               {top3[1] && (
                  <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex-1 max-w-[180px] text-center space-y-4">
                     <div className="relative mx-auto">
                        <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full border-4 border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 shadow-xl relative z-10 overflow-hidden">
                           <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl lg:text-3xl font-black text-slate-400 dark:text-slate-500 uppercase">
                              {top3[1].name?.charAt(0)}
                           </div>
                        </div>
                        <div className="absolute -top-6 -left-6 transform -rotate-12 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-black text-xs shadow-lg z-20 border border-slate-300/20">2ND</div>
                     </div>
                     <div className="space-y-1">
                        <p className="font-black text-sm uppercase line-clamp-1">{top3[1].name}</p>
                        <p className="text-xl font-black text-primary-700 dark:text-primary-500">{top3[1].stats?.totalScore || top3[1].totalScore || 0}</p>
                     </div>
                     <div className="h-24 lg:h-32 bg-slate-200 dark:bg-slate-700 rounded-t-[2rem] shadow-inner" />
                  </motion.div>
               )}

               {/* Rank 1 (The Winner) */}
               {top3[0] && (
                  <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} className="flex-1 max-w-[220px] text-center space-y-6 -mt-12">
                     <div className="relative mx-auto flex flex-col items-center">
                        <Crown className="w-12 h-12 text-yellow-500 fill-yellow-500 mb-2 animate-bounce" />
                        <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full border-8 border-yellow-400 p-1 bg-white dark:bg-slate-800 shadow-2xl relative z-10 overflow-hidden ring-4 ring-yellow-400/20">
                           <div className="w-full h-full rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-5xl font-black text-yellow-600 uppercase">
                              {top3[0].name?.charAt(0)}
                           </div>
                        </div>
                        <div className="absolute top-10 -right-4 bg-yellow-400 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-xl z-20 border border-yellow-500/20">WINNER</div>
                     </div>
                     <div className="space-y-1">
                        <p className="font-black text-lg lg:text-xl uppercase line-clamp-1">{top3[0].name}</p>
                        <p className="text-2xl lg:text-xl lg:text-3xl font-black text-primary-700 dark:text-primary-500 leading-none">{top3[0].stats?.totalScore || top3[0].totalScore || 0}</p>
                        <p className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">Total Score</p>

                     </div>
                     <div className="h-40 lg:h-56 bg-primary-500 rounded-t-[3rem] shadow-duo-primary flex flex-col items-center justify-center text-white">
                        <Award className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-4xl font-black">1</span>
                     </div>
                  </motion.div>
               )}

               {/* Rank 3 */}
               {top3[2] && (
                  <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 max-w-[180px] text-center space-y-4">
                     <div className="relative mx-auto">
                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border-4 border-amber-600/50 p-1 bg-white dark:bg-slate-800 shadow-xl relative z-10 overflow-hidden">
                           <div className="w-full h-full rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-xl lg:text-2xl font-black text-amber-600 uppercase">
                              {top3[2].name?.charAt(0)}
                           </div>
                        </div>
                        <div className="absolute -top-4 -right-4 transform rotate-12 bg-amber-600/50 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg z-20 border border-amber-600/20">3RD</div>
                     </div>
                     <div className="space-y-1">
                        <p className="font-black text-sm uppercase line-clamp-1">{top3[2].name}</p>
                        <p className="text-lg font-black text-primary-700 dark:text-primary-500">{top3[2].stats?.totalScore || top3[2].totalScore || 0}</p>
                     </div>
                     <div className="h-20 lg:h-24 bg-amber-100 dark:bg-amber-900/40 rounded-t-[2rem] shadow-inner" />
                  </motion.div>
               )}

            </div>
         </section>

         {/* --- User Rank Sticky Bar --- */}
         {data?.currentUser && (
            <Card className="bg-primary-500 dark:bg-primary-800 text-white border-none p-3 lg:p-6 shadow-duo-primary relative overflow-hidden group">
               <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-3xl">
                        {data.currentUser.rank || data.currentUser.position}
                     </div>
                     <div>
                        <h4 className="text-xl font-black font-outfit">Your Performance</h4>
                        <p className="text-xs font-bold text-white/70 tracking-widest leading-none">Global Ranking for {getCurrentMonthDisplay()}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 lg:gap-12">
                     <div className="text-center">
                        <p className="text-xl lg:text-2xl font-black font-outfit leading-none">{data.currentUser.stats?.highScoreWins ?? data.currentUser.stats?.totalScore ?? 0}</p>
                        <p className="text-[10px] font-black opacity-60">High Score Wins</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xl lg:text-2xl font-black font-outfit leading-none">{data.currentUser.stats?.accuracy ?? 0}%</p>
                        <p className="text-[10px] font-black opacity-60">Accuracy</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xl lg:text-2xl font-black font-outfit leading-none">{data.currentUser.stats?.totalQuizAttempts ?? 0}</p>
                        <p className="text-[10px] font-black opacity-60">Quizzes Played</p>
                     </div>
                  </div>
                  <Button variant="white" size="lg" className="!text-primary-800 dark:!text-primary-400 hover:bg-slate-50 transition-all font-black px-10">CLIMB HIGHER</Button>
               </div>
               <Flame className="absolute -right-6 -bottom-6 w-20 lg:w-32 h-20 lg:h-32 opacity-10 group-hover:scale-125 transition-transform" />
            </Card>
         )}

         {/* --- Ranking Table --- */}
         <section className="space-y-4">
            <h3 className="text-xl font-black font-outfit uppercase px-2">Top Performers Map</h3>
            <div className="space-y-4">
               {/* Desktop Table View */}
               <div className="hidden lg:block">
                  <Card className="p-0 overflow-hidden border-2">
                     <div className="overflow-x-auto">
                        <table className="w-full">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-black uppercase text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                              <tr>
                                 <th className="px-6 py-4 text-left">Rank</th>
                                 <th className="px-6 py-4 text-left">Player</th>
                                 <th className="px-6 py-4 text-center">Mastery</th>
                                 <th className="px-6 py-4 text-center">Quests</th>
                                 <th className="px-6 py-4 text-right">Score</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {others.map((player, idx) => (
                                 <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                                 >
                                    <td className="px-6 py-5">
                                       <span className="font-black text-slate-600 dark:text-slate-400 group-hover:text-primary-700 dark:text-primary-500 transition-colors">#{idx + 4}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                                             {player.name?.charAt(0)}
                                          </div>
                                          <div className="space-y-0.5">
                                             <p className="font-bold text-sm leading-tight line-clamp-1">{player.name}</p>
                                             <div className="text-xs font-black italic tracking-tighter text-indigo-500 tabular-nums">LVL {player.level?.currentLevel?.number ?? player.level?.currentLevel ?? 0} {player.level?.levelName ? `- ${player.level.levelName}` : ''}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-5">
                                       <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                          <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase">{player.stats?.accuracy || 0}% Accuracy</span>
                                          <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                             <ProgressBar progress={player.stats?.accuracy || 0} color="secondary" height="h-full" />
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                       <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black">{player.stats?.totalQuizAttempts || 0}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-slate-700 dark:text-slate-100 italic">
                                       {player.stats?.highScoreWins || player.stats?.totalScore || 0}
                                    </td>
                                 </motion.tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </div>

               {/* Mobile List View */}
               <div className="lg:hidden space-y-4 px-2">
                  {others.map((player, idx) => (
                     <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-slate-900/50 border-2 border-b-4 lg:border-b-8 border-slate-100 dark:border-slate-800 rounded-[1rem] lg:rounded-[2rem] p-2 lg:p-4 shadow-sm relative overflow-hidden group"
                     >
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                                 {player.name?.charAt(0)}
                              </div>
                              <div>
                                 <h4 className="font-bold text-base leading-tight line-clamp-1">{player.name}</h4>
                                 <h4 className="font-italic text-md leading-tight line-clamp-1">{`@${player?.username}`}</h4>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase">LVL {player.level?.currentLevel?.number ?? player.level?.currentLevel ?? 0} {player.level?.levelName ? `- ${player.level.levelName}` : ''}</span>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{'\u2022'} RANK #{idx + 4}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">High Score Wins</p>
                              <p className="text-base font-black">{player.stats?.highScoreWins || 0}</p>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Score</p>
                              <p className="text-base font-black text-primary-600">{player.stats?.totalScore || 0}</p>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">
                              <span>Accuracy</span>
                              <span>{player.stats?.accuracy || 0}%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                              <ProgressBar progress={player.stats?.accuracy || 0} color="secondary" height="h-full" />
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         {/* --- Call to Action --- */}
         <section className="text-center py-10 space-y-6 max-w-xl mx-auto">
            <div className="space-y-2">
               <h3 className="text-xl lg:text-3xl font-black font-outfit uppercase">Want a spot on the podium?</h3>
               <p className="text-slate-700 dark:text-gray-400 font-bold leading-relaxed">Complete daily quests and maintain a 90% accuracy streak to earn your place among the legends.</p>
            </div>
            <Button variant="primary" size="lg" className="mx-auto px-12 py-6 text-xl" onClick={() => router.push('/govt-exams')}>START QUEST NOW</Button>
         </section>

      </div>
   );

   function getCurrentMonthDisplay() {
      const monthValue = selectedMonth || data?.month;
      if (monthValue && monthValue.includes('-')) {
         const [year, month] = monthValue.split('-');
         const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
         return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
      return activeTab.toUpperCase();
   }
};

export default TopPerformers;

