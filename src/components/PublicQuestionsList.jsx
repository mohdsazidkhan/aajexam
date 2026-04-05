'use client';

import React from 'react';
import { useRouter } from 'next/router';
import {
   Heart,
   Share2,
   Eye,
   CheckCircle2,
   AlertCircle,
   MessageSquare,
   User,
   Clock,
   Zap,
   ArrowRight,
   TrendingUp,
   Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Card from './ui/Card';
import Button from './ui/Button';

const PublicQuestionsList = ({ items = [], onAnswer, onLike, onShare, onView, startIndex = 0 }) => {
   const router = useRouter();

   const timeAgo = (dateStr) => {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
   };

   const getInitials = (name = '') => {
      const parts = String(name).trim().split(/\s+/);
      const first = parts[0]?.[0] || '';
      const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase() || 'A';
   };

   const handleUserClick = (username) => {
      if (username) {
         router.push(`/u/${username}`);
      }
   };

   if (!items || items.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-inner">
               <Zap className="w-12 h-12 text-slate-400 dark:text-slate-500 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
               <p className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">No Questions Found</p>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Could not find any questions in this area.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 font-outfit">
         <AnimatePresence>
            {items.map((row, idx) => {
               const user = row.userId || {};
               const serialNumber = startIndex + idx + 1;
               const answered = typeof row.selectedOptionIndex === 'number';

               return (
                  <motion.div
                     key={row._id}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: (idx % 10) * 0.05, type: 'spring', stiffness: 100 }}
                     className="h-full"
                  >
                     <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 h-full space-y-4 border-2 border-b-8 border-slate-100 dark:border-slate-700 hover:border-primary-500/20 transition-all relative overflow-hidden group">

                        {/* Decorative Elements */}
                        <div className="absolute -top-12 -right-12 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full pointer-events-none blur-3xl group-hover:bg-primary-500/10 transition-colors" />

                        {/* User Header */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4 cursor-pointer group/user" onClick={() => handleUserClick(user.username)}>
                              <div className="relative">
                                 <div className="w-10 lg:w-14 h-10 lg:h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-xl text-slate-600 dark:text-slate-400 overflow-hidden border-2 border-white dark:border-slate-800 shadow-duo-secondary group-hover/user:scale-110 transition-transform">
                                    {user.profilePicture ? (
                                       <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : getInitials(user.name)}
                                 </div>
                                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full shadow-sm" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover/user:text-primary-700 dark:text-primary-500 transition-colors leading-none mb-1">
                                    {user.name || 'Community Member'}
                                 </h4>
                                 <div className="flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-primary-700 dark:text-primary-500" />
                                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{user.monthlyProgress?.levelName || 'LEARNER'}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{timeAgo(row.createdAt)}</p>
                              <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-700">
                                 <p className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest">Q#{serialNumber}</p>
                              </div>
                           </div>
                        </div>

                        {/* Question Content */}
                        <div className="space-y-6">
                           <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
                              {row.questionText}
                           </h3>

                           <div className="grid grid-cols-1 gap-2 lg:gap-4">
                              {row.options.map((opt, oIdx) => {
                                 const isSelected = row.selectedOptionIndex === oIdx;
                                 const isCorrect = oIdx === row.correctAnswer;
                                 const isWrong = isSelected && !isCorrect;
                                 const showCorrect = answered && !isSelected && isCorrect;

                                 const optionColors = [
                                    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
                                    "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
                                    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
                                    "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30"
                                 ];

                                 let stateClasses = "border-slate-100 dark:border-slate-700 hover:border-primary-500/30 hover:bg-primary-50/10";
                                 let icon = (
                                    <div className={`w-8 h-8 rounded-xl font-black text-[10px] flex items-center justify-center transition-all group-hover/opt:scale-110 shadow-duo ${optionColors[oIdx % optionColors.length]}`}>
                                       {String.fromCharCode(65 + oIdx)}
                                    </div>
                                 );

                                 if (answered) {
                                    if (isCorrect) {
                                       stateClasses = "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-duo-secondary";
                                       icon = <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><CheckCircle2 className="w-4 h-4" /></div>;
                                    } else if (isWrong) {
                                       stateClasses = "bg-rose-50 dark:bg-rose-900/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-duo";
                                       icon = <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg"><AlertCircle className="w-4 h-4" /></div>;
                                    } else {
                                       stateClasses = "border-slate-50 dark:border-slate-800/50 opacity-40 grayscale";
                                       icon = (
                                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-[10px] flex items-center justify-center">
                                             {String.fromCharCode(65 + oIdx)}
                                          </div>
                                       );
                                    }
                                 }

                                 return (
                                    <motion.button
                                       key={oIdx}
                                       whileHover={!answered ? { scale: 1.02, x: 5 } : {}}
                                       whileTap={!answered ? { scale: 0.98 } : {}}
                                       onClick={() => !answered && onAnswer(row, oIdx)}
                                       disabled={answered}
                                       className={`w-full p-3 rounded-[1rem] border-2 border-b-6 font-black text-sm text-left flex items-center gap-5 transition-all group/opt ${stateClasses}`}
                                    >
                                       {icon}
                                       <span className="tracking-wide leading-tight flex-1">{opt}</span>
                                    </motion.button>
                                 );
                              })}
                           </div>
                        </div>

                        {/* Action Footer */}
                        <div className="flex items-center justify-between pt-2 border-t-2 border-slate-50 dark:border-slate-800/50 relative z-10">
                           <div className="flex gap-8">
                              <button onClick={() => onLike(row)} className="flex items-center gap-3 group/action">
                                 <div className={`p-2.5 rounded-xl transition-all group-hover/action:scale-110 ${row.likesCount > 0 ? 'bg-rose-500 text-white shadow-duo' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover/action:bg-rose-500/10 group-hover/action:text-rose-500'}`}>
                                    <Heart className={`w-4 h-4 ${row.likesCount > 0 ? 'fill-current' : ''}`} />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors group-hover/action:text-rose-600 dark:group-hover/action:text-rose-400">{row.likesCount || 0}</span>
                              </button>

                              <button onClick={() => onShare(row)} className="flex items-center gap-3 group/action">
                                 <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 dark:text-slate-500 group-hover/action:scale-110 group-hover/action:bg-blue-500/10 group-hover/action:text-blue-600 dark:group-hover/action:text-blue-400 transition-all">
                                    <Share2 className="w-4 h-4" />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors group-hover/action:text-blue-600 dark:group-hover/action:text-blue-400">{row.sharesCount || 0}</span>
                              </button>

                              <div className="hidden sm:flex items-center gap-3">
                                 <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-300">
                                    <MessageSquare className="w-4 h-4" />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{row.answersCount || 0}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 cursor-pointer group/eye" onClick={() => onView(row)}>
                              <Eye className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/eye:text-primary-700 dark:text-primary-500 transition-colors" />
                              <span className="text-[9px] font-black text-slate-500 group-hover/eye:text-slate-700 dark:text-slate-400 uppercase tracking-[0.2em] transition-colors">{row.viewsCount || 0} VIEWS</span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               );
            })}
         </AnimatePresence>
      </div>
   );
};

export default PublicQuestionsList;


