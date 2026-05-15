'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../../lib/api';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trash2,
  Filter,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trophy,
  Wallet,
  User,
  Zap,
  Star,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileText,
  CreditCard,
  Target
} from 'lucide-react';

const AdminNotificationsPage = () => {
  const { isMounted, router } = useSSR();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const typeToPath = {
    quiz: '/admin/govt-exams/tests',
    withdraw: '/admin/withdraw-requests',
    contact: '/admin/contacts',
    bank: '/admin/bank-details',
    subscription: '/admin/subscriptions',
    registration: '/admin/students',
    quiz_attempt: '/admin/analytics/dashboard',
    exam_attempt: '/admin/govt-exams/results',
    blog: '/admin/user-blogs',
    referral_registration: '/admin/referral-history',
    competition_reset: '/admin/competition-resets'
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'question': return <MessageSquare className="w-4 h-4" />;
      case 'quiz': return <Trophy className="w-4 h-4" />;
      case 'withdraw': return <Wallet className="w-4 h-4" />;
      case 'contact': return <HelpCircle className="w-4 h-4" />;
      case 'bank': return <CreditCard className="w-4 h-4" />;
      case 'subscription': return <Star className="w-4 h-4" />;
      case 'registration': return <User className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'referral_registration': return <Zap className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const fetchPage = useCallback(async (p = 1, perPage = limit) => {
    try {
      setLoading(true);
      const res = await API.getAdminNotifications(p, perPage, { unreadOnly: false });
      const data = res?.data || res?.notifications || [];
      setItems(Array.isArray(data) ? data : []);
      const pg = res?.pagination || { page: p, totalPages: 1, total: data.length };
      setPage(pg.page || p);
      setTotalPages(pg.totalPages || 1);
      setTotal(pg.total || data.length || 0);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!isMounted) return;
    fetchPage(1, limit);
  }, [isMounted, fetchPage, limit]);

  const handlePrev = () => page > 1 && fetchPage(page - 1);
  const handleNext = () => page < totalPages && fetchPage(page + 1);

  const handleLimitChange = (value) => {
    const per = parseInt(value);
    setLimit(per);
    fetchPage(1, per);
  };

  const handleClearAll = async () => {
    try {
      await API.clearAdminNotifications();
      fetchPage(1, limit);
    } catch (_) { }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return `${d.getDate()} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-rose-500/10 border-t-rose-500 rounded-full shadow-2xl"
            />
            <Bell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-rose-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading notifications...</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
        <div className="transition-all duration-500 p-4 lg:p-8">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  NOTIFI<span className="text-rose-500">CATIONS</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">View and manage system notifications and user activity alerts.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Limit</span>
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(e.target.value)}
                      className="px-3 lg:px-6 py-4 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl outline-none"
                    >
                      {[10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>{n} per page</option>
                      ))}
                    </select>
                 </div>
                 <button
                    onClick={handleClearAll}
                    className="px-4 lg:px-8 py-4 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 text-rose-500 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                 >
                   <Trash2 className="w-4 h-4" /> Clear All
                 </button>
              </div>
            </div>
          </motion.div>

          {/* Notification List */}
          <AnimatePresence mode="wait">
             {items.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-10 lg:py-20  text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
               >
                 <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] mb-4 lg:mb-8 shadow-xl">
                   <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">No Notifications</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No notifications yet. They will appear here as users interact with the platform.</p>
               </motion.div>
             ) : (
               <motion.div
                 key="stream"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8"
               >
                 {items.map((n, i) => {
                   const href = typeToPath[n.type] || '/admin/notifications';
                   return (
                     <motion.div
                       key={n._id || i}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: i * 0.05 }}
                       layout
                       onClick={() => {
                         if (!n.isRead) {
                           setItems((prev) => prev.map((it) => it._id === n._id ? { ...it, isRead: true } : it));
                           API.markAdminNotificationRead(n._id).catch(() => {
                             setItems((prev) => prev.map((it) => it._id === n._id ? { ...it, isRead: false } : it));
                           });
                         }
                         router.push(href);
                       }}
                       className={`group relative rounded-xl lg:rounded-[3rem] border-4 p-3 lg:p-8 cursor-pointer transition-all shadow-xl hover:scale-[1.02] flex flex-col ${n.isRead 
                         ? 'bg-white/80 dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-primary-500/30' 
                         : 'bg-primary-500/5 dark:bg-primary-500/10 border-primary-500/30 shadow-primary-500/20 active-signal'}`}
                     >
                        {!n.isRead && (
                          <div className="absolute top-8 right-8 w-3 h-3 bg-primary-500 rounded-full animate-ping" />
                        )}

                        <div className="flex items-center gap-4 mb-6">
                           <div className={`p-3 rounded-2xl ${n.isRead ? 'bg-slate-100 dark:bg-white/10 text-slate-400' : 'bg-primary-500 text-white shadow-duo-primary'} transition-colors`}>
                              {getIconByType(n.type)}
                           </div>
                           <div>
                              <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mb-1">{n.type?.toUpperCase()}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{formatDate(n.createdAt)}</div>
                           </div>
                        </div>

                        <h3 className={`text-lg font-black uppercase italic tracking-tighter leading-tight mb-3 transition-colors ${n.isRead ? 'text-slate-900 dark:text-white' : 'text-primary-600 dark:text-primary-400'}`}>
                           {n.title}
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-3 ${n.isRead ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                           {n.description}
                        </p>

                        <div className="mt-auto pt-8 flex items-center justify-between border-t-2 border-slate-50 dark:border-white/5">
                           <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase italic">
                              <Clock className="w-3 h-3" /> {formatTime(n.createdAt)}
                           </div>
                           <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-slate-100 dark:border-white/10 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-inner">
                              <ArrowRight className="w-4 h-4" />
                           </div>
                        </div>
                     </motion.div>
                   );
                 })}
               </motion.div>
             )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16 text-[10px] font-black uppercase tracking-widest">
              <button
                onClick={handlePrev}
                disabled={page <= 1}
                className="p-6 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-full text-slate-400 hover:text-primary-500 disabled:opacity-20 transition-all shadow-xl active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-4 lg:px-8 py-4 bg-slate-900 text-white rounded-lg lg:rounded-[2rem] shadow-2xl italic tracking-tighter">
                 Page {page} <span className="text-slate-500 ml-2">of</span> {totalPages}
              </div>

              <button
                onClick={handleNext}
                disabled={page >= totalPages}
                className="p-6 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-full text-slate-400 hover:text-primary-500 disabled:opacity-20 transition-all shadow-xl active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .active-signal {
          animation: glow-pulse 2s infinite ease-in-out;
        }
        @keyframes glow-pulse {
          0% { border-color: rgba(79, 70, 229, 0.3); box-shadow: 0 0 20px rgba(79, 70, 229, 0.1); }
          50% { border-color: rgba(79, 70, 229, 0.6); box-shadow: 0 0 40px rgba(79, 70, 229, 0.2); }
          100% { border-color: rgba(79, 70, 229, 0.3); box-shadow: 0 0 20px rgba(79, 70, 229, 0.1); }
        }
      `}</style>
    </>
  );
};

export default AdminNotificationsPage;

