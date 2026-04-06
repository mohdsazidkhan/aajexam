'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
   Trophy,
   Medal,
   Crown,
   Calendar,
   Users,
   IndianRupee,
   LayoutGrid,
   List as ListIcon,
   Table as TableIcon,
   ChevronRight,
   Sparkles,
   Search,
   RotateCcw,
   Star,
   CircleCheck,
   Zap,
   TrendingUp,
   Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from "react-datepicker";
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";
import "../datepicker-custom.css";

import API from '../../lib/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loading from '../Loading';
import UnifiedFooter from '../UnifiedFooter';
import { toast } from 'react-hot-toast';

const MonthlyWinners = () => {
   const [monthlyWinners, setMonthlyWinners] = useState([]);
   const [activeType, setActiveType] = useState('monthly'); // 'daily', 'weekly', 'monthly'
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'table'
   const [selectedDate, setSelectedDate] = useState(() => dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
   const [selectedWeek, setSelectedWeek] = useState(() => {
      const d = dayjs().subtract(1, 'week');
      const oneJan = dayjs(d).startOf('year');
      const numberOfDays = d.diff(oneJan, 'day');
      const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
      return `${d.format('YYYY')}-W${weekNum}`;
   });
   const [selectedMonth, setSelectedMonth] = useState(() => dayjs().subtract(1, 'month').format('YYYY-MM'));

   const fetchWinners = useCallback(async () => {
      try {
         setLoading(true);
         const filters = {};
         if (activeType === 'daily' && selectedDate) filters.date = selectedDate;
         if (activeType === 'weekly' && selectedWeek) filters.week = selectedWeek;
         if (activeType === 'monthly' && selectedMonth) filters.date = selectedMonth;

         const response = await API.getRecentMonthlyWinners(12, null, activeType, filters);

         if (response && response.success) {
            let transformed = [];
            if (activeType === 'monthly') {
               transformed = (response.data || []).map(monthData => ({
                  ...monthData,
                  winners: (monthData.winners || []).map((u, idx) => ({
                     ...u,
                     rank: u.rank || idx + 1,
                     userId: {
                        _id: u.studentId || u.userId || u._id || idx,
                        name: u.studentName || u.name || u.userName || 'Unknown',
                        profilePicture: u.profilePicture,
                        email: u.studentEmail || u.email
                     }
                  }))
               }));
            } else {
               transformed = [{
                  winners: (response.data || []).map((u, idx) => ({
                     ...u,
                     rank: u.rank || idx + 1,
                     userId: {
                        _id: u.studentId || u.userId || u._id || idx,
                        name: u.studentName || u.name || u.userName || 'Unknown',
                        profilePicture: u.profilePicture,
                        email: u.studentEmail || u.email
                     }
                  })),
                  totalPrizePool: response.totalPrizePool || 0,
                  monthYear: activeType.toUpperCase() + (activeType === 'daily' ? ` (${selectedDate})` : ` (${selectedWeek})`),
                  totalWinners: response.data?.length || 0,
                  resetDate: activeType === 'daily' ? selectedDate : new Date()
               }];
            }
            setMonthlyWinners(transformed);
         } else { setMonthlyWinners([]); }
      } catch (error) {
         console.error('Error:', error);
         setMonthlyWinners([]);
      } finally { setLoading(false); }
   }, [selectedDate, selectedWeek, selectedMonth, activeType]);

   useEffect(() => { fetchWinners(); }, [fetchWinners]);

   const stats = [
      { label: 'Total Periods', val: monthlyWinners.length, icon: Calendar, color: 'primary' },
      { label: 'Total Winners', val: monthlyWinners.reduce((t, m) => t + (m.totalWinners || 0), 0), icon: Users, color: 'secondary' },
      { label: 'Total Prize Money', val: `₹${monthlyWinners.reduce((t, m) => t + (m.totalPrizePool || 0), 0).toLocaleString()}`, icon: IndianRupee, color: 'blue' }
   ];

   return (
      <div className="min-h-screen bg-background-page animate-fade-in selection:bg-primary-500 selection:text-white">

         <div className="container mx-auto px-2 lg:px-6 py-4 space-y-12 mt-0">

            {/* --- Header & Period Selector --- */}
            <section className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 py-0 lg:py-6">
               <div className="space-y-4 text-center lg:text-left">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Top <span className="text-primary-600">Students</span></h1>
                  <p className="text-sm font-bold text-content-secondary dark:text-slate-500 uppercase tracking-[0.3em]">These students studied the hardest and won this period</p>
               </div>

               <div className="flex p-2 bg-background-surface-secondary rounded-3xl gap-2 h-fit">
                  {[
                     { id: 'daily', label: 'Daily', color: 'secondary' },
                     { id: 'weekly', label: 'Weekly', color: 'blue' },
                     { id: 'monthly', label: 'Monthly', color: 'primary' }
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveType(tab.id)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeType === tab.id ? `bg-${tab.color}-500 text-white shadow-lg scale-105` : 'text-content-secondary hover:text-slate-900'}`}
                     >
                        {tab.label}
                     </button>
                  ))}
               </div>
            </section>

            {/* --- Filter & View Controls --- */}
            <Card className="p-6 border-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm border border-border-primary">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

                  <div className="lg:col-span-8 flex flex-wrap items-center gap-6">
                     {/* Period Picker */}
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-content-secondary uppercase tracking-widest px-1">Study Period</label>
                        <div className="flex items-center gap-4">
                           {activeType === 'daily' && (
                              <div className="relative">
                                 <DatePicker
                                    selected={new Date(selectedDate)}
                                    onChange={(date) => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
                                    className="bg-white dark:bg-slate-900 border-2 border-border-primary rounded-2xl px-6 py-3.5 text-sm font-black uppercase text-slate-700 dark:text-white outline-none focus:border-primary-500 transition-all w-48"
                                 />
                                 <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                              </div>
                           )}
                           {activeType === 'monthly' && (
                              <div className="relative">
                                 <DatePicker
                                    selected={dayjs(selectedMonth).toDate()}
                                    onChange={(date) => setSelectedMonth(dayjs(date).format('YYYY-MM'))}
                                    showMonthYearPicker
                                    className="bg-white dark:bg-slate-900 border-2 border-border-primary rounded-2xl px-6 py-3.5 text-sm font-black uppercase text-slate-700 dark:text-white outline-none focus:border-primary-500 transition-all w-48"
                                 />
                                 <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                              </div>
                           )}
                           {activeType === 'weekly' && (
                              <div className="flex gap-2">
                                 {[1, 2, 3, 4].map(w => (
                                    <button
                                       key={w}
                                       onClick={() => setSelectedWeek(`${dayjs(selectedMonth).format('YYYY')}-W${w}`)}
                                       className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xs font-black transition-all ${selectedWeek.includes(`-W${w}`) ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900 text-content-secondary'}`}
                                    >
                                       W{w}
                                    </button>
                                 ))}
                              </div>
                           )}
                           <Button variant="ghost" onClick={fetchWinners} className="w-12 h-12 p-0 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900"><RotateCcw className="w-5 h-5 text-content-secondary" /></Button>
                        </div>
                     </div>

                     {/* Stats Segment */}
                     <div className="hidden xl:flex items-center gap-8 pl-8 border-l-2 border-border-primary">
                        {stats.map((s, i) => (
                           <div key={i} className="space-y-1">
                              <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">{s.label}</p>
                              <p className={`text-lg font-black text-content-primary`}>{s.val}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* View Switches */}
                  <div className="lg:col-span-4 flex justify-end gap-2">
                     {[
                        { id: 'grid', icon: LayoutGrid },
                        { id: 'list', icon: ListIcon },
                        { id: 'table', icon: TableIcon }
                     ].map(v => (
                        <button
                           key={v.id}
                           onClick={() => setViewMode(v.id)}
                           className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${viewMode === v.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900 text-content-secondary hover:text-slate-600'}`}
                        >
                           <v.icon className="w-5 h-5" />
                        </button>
                     ))}
                  </div>
               </div>
            </Card>

            {/* --- Main Content --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-32 flex justify-center"><Loading size="lg" /></div>
               ) : monthlyWinners.length === 0 ? (
                  <Card className="py-24 text-center space-y-6 bg-transparent border-dashed border-2 border-slate-200 dark:border-slate-800">
                     <Trophy className="w-20 h-20 text-slate-200 mx-auto" />
                     <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">No Winners Found</h3>
                        <p className="text-xs font-bold text-content-secondary uppercase tracking-widest">No winners have been recorded for this time period yet.</p>
                     </div>
                  </Card>
               ) : (
                  <motion.div key={activeType + viewMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 lg:space-y-12">

                     {/* --- The Podium (Top 3 Visual) --- */}
                     {monthlyWinners[0]?.winners?.length > 0 && (
                        <section className="relative pt-20 pb-10">
                           <div className="flex flex-col lg:flex-row items-end justify-center gap-4 lg:gap-0 max-w-4xl mx-auto px-4">
                              {/* Rank 2 */}
                              <div className="w-full lg:w-1/3 order-2 lg:order-1">
                                 {monthlyWinners[0].winners[1] && (
                                    <div className="space-y-4 flex flex-col items-center">
                                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="relative group">
                                          <div className="w-24 h-24 rounded-full border-4 border-slate-300 dark:border-slate-600 overflow-hidden shadow-xl bg-slate-200">
                                             <img src={monthlyWinners[0].winners[1].profilePicture || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                                          </div>
                                          <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-lg border-4 border-white dark:border-slate-800">
                                             <Medal className="w-5 h-5" />
                                          </div>
                                       </motion.div>
                                       <div className="text-center">
                                          <p className="text-lg font-black font-outfit uppercase truncate max-w-[150px]">{monthlyWinners[0].winners[1].userId.name}</p>
                                          <p className="text-xl font-black text-content-secondary">₹{monthlyWinners[0].winners[1].rewardAmount.toLocaleString()}</p>
                                       </div>
                                       <div className="w-full h-32 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 rounded-t-3xl border-t-4 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                          <span className="text-5xl font-black font-outfit text-slate-300 dark:text-slate-600">2</span>
                                       </div>
                                    </div>
                                 )}
                              </div>

                              {/* Rank 1 */}
                              <div className="w-full lg:w-1/3 order-1 lg:order-2 z-10">
                                 <div className="space-y-4 flex flex-col items-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                                       <div className="w-20 lg:w-32 h-20 lg:h-32 rounded-full border-8 border-primary-500 overflow-hidden shadow-duo-primary bg-primary-100 animate-pulse-subtle">
                                          <img src={monthlyWinners[0].winners[0].profilePicture || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-slate-800">
                                          <Crown className="w-6 h-6" />
                                       </div>
                                       <Sparkles className="absolute -left-8 -top-8 w-12 h-12 text-primary-600 animate-bounce" />
                                    </motion.div>
                                    <div className="text-center">
                                       <p className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-primary-600">{monthlyWinners[0].winners[0].userId.name}</p>
                                       <p className="text-4xl font-black text-content-primary">₹{monthlyWinners[0].winners[0].rewardAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="w-full h-48 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-3xl shadow-2xl flex items-center justify-center border-t-8 border-primary-600">
                                       <span className="text-7xl font-black font-outfit text-white/50">1</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Rank 3 */}
                              <div className="w-full lg:w-1/3 order-3 lg:order-3">
                                 {monthlyWinners[0].winners[2] && (
                                    <div className="space-y-4 flex flex-col items-center">
                                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="relative">
                                          <div className="w-24 h-24 rounded-full border-4 border-primary-700/50 overflow-hidden shadow-xl bg-primary-900/10">
                                             <img src={monthlyWinners[0].winners[2].profilePicture || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                                          </div>
                                          <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-800">
                                             <Medal className="w-5 h-5" />
                                          </div>
                                       </motion.div>
                                       <div className="text-center">
                                          <p className="text-lg font-black font-outfit uppercase truncate max-w-[150px]">{monthlyWinners[0].winners[2].userId.name}</p>
                                          <p className="text-xl font-black text-content-secondary">₹{monthlyWinners[0].winners[2].rewardAmount.toLocaleString()}</p>
                                       </div>
                                       <div className="w-full h-24 bg-gradient-to-t from-primary-800/10 to-transparent dark:from-primary-900/20 rounded-t-3xl border-t-4 border-primary-700/30 flex items-center justify-center">
                                          <span className="text-5xl font-black font-outfit text-primary-800/20">3</span>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </section>
                     )}

                     {/* --- Grid / List Content --- */}
                     {viewMode !== 'table' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                           {monthlyWinners[0].winners.slice(3).map((w, idx) => (
                              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                                 <Card className={`p-6 group flex items-center gap-6 border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all ${viewMode === 'list' ? 'lg:col-span-1 lg:col-span-2' : ''}`}>
                                    <div className="relative">
                                       <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                          <img src={w.profilePicture || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                                          #{w.rank}
                                       </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                       <h4 className="text-lg font-black font-outfit uppercase tracking-tight group-hover:text-primary-600 transition-colors">{(w.userId.name || 'Student').split(' ')[0]}</h4>
                                       <div className="flex items-center gap-4">
                                          <span className="flex items-center gap-1 text-[10px] font-black text-content-secondary uppercase tracking-widest"><CircleCheck className="w-3 h-3" /> {w.accuracy}%</span>
                                          <span className="flex items-center gap-1 text-[10px] font-black text-content-secondary uppercase tracking-widest"><Zap className="w-3 h-3" /> {w.highScoreWins} Wins</span>
                                       </div>
                                    </div>

                                    <div className="text-right">
                                       <p className="text-xl lg:text-2xl font-black text-green-500">₹{w.rewardAmount.toLocaleString()}</p>
                                       <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">REWARD</p>
                                    </div>
                                 </Card>
                              </motion.div>
                           ))}
                        </div>
                     ) : (
                        /* --- Table View --- */
                        <Card className="overflow-hidden border-none shadow-xl">
                           <div className="overflow-x-auto">
                              <table className="w-full">
                                 <thead>
                                    <tr className="bg-slate-900 text-white">
                                       <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em]">Student Name</th>
                                       <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em]">Rank</th>
                                       <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em]">Performance</th>
                                       <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em]">Earned Reward</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y-2 divide-border-primary bg-white dark:bg-slate-900/50">
                                    {monthlyWinners[0].winners.map((w, idx) => (
                                       <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                          <td className="px-8 py-6">
                                             <div className="flex items-center gap-4">
                                                <img src={w.profilePicture || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-xl" />
                                                <div>
                                                   <p className="font-black font-outfit uppercase truncate max-w-[200px]">{w.userId.name}</p>
                                                   <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest leading-none mt-1">{w.userId.email}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-center">
                                             <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${w.rank === 1 ? 'bg-primary-500 text-white shadow-duo-primary' : w.rank < 4 ? 'bg-primary-500 text-white shadow-duo-secondary' : 'bg-slate-100 dark:bg-slate-800 text-content-secondary'}`}>
                                                Rank #{w.rank}
                                             </span>
                                          </td>
                                          <td className="px-8 py-6 text-center">
                                             <div className="flex flex-col items-center gap-1">
                                                <p className="text-sm font-black text-content-primary leading-none">{w.accuracy}% ACC</p>
                                                <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">{w.highScoreWins} WINS</p>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-right">
                                             <p className="text-xl lg:text-2xl font-black text-green-500">₹{w.rewardAmount.toLocaleString()}</p>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </Card>
                     )}

                  </motion.div>
               )}
            </AnimatePresence>

            {/* --- Footer Guide --- */}
            <section className="pt-5">
               <Card variant="dark" depth={false} className="p-6 lg:p-12 text-center bg-slate-950 border-none text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-8 flex flex-col items-center p-4">
                     <h2 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Your Name <span className="text-primary-600">Next?</span></h2>
                     <p className="text-md lg:text-lg font-bold opacity-60 max-w-2xl mx-auto uppercase tracking-wide leading-relaxed">Continuous preparation leads to the top. <br />Start practicing today and reach your goal.</p>
                     <Button onClick={() => router.push('/')} variant="primary" size="lg" className="px-12 py-6 text-sm font-black shadow-duo-primary">START PRACTICING NOW</Button>
                  </div>
                  <Sparkles className="absolute top-10 left-10 w-24 h-24 text-white/5" />
               </Card>
            </section>

         </div>

         <UnifiedFooter />
      </div>
   );
};

export default MonthlyWinners;


