'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Users, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  LayoutGrid, 
  List, 
  Table as TableIcon,
  Activity,
  Zap,
  Target,
  Award,
  Filter,
  Search,
  Clock,
  ShieldCheck,
  Star,
  Settings,
  MoreVertical
} from 'lucide-react';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../datepicker-custom.css";
import { motion, AnimatePresence } from 'framer-motion';

const AdminPrevMonthPlayedUsers = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [sortBy, setSortBy] = useState('highScoreQuiz');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const [preciseDate, setPreciseDate] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
  const [preciseMonth, setPreciseMonth] = useState(dayjs().subtract(1, 'month').format('YYYY-MM'));
  const [preciseWeek, setPreciseWeek] = useState(() => {
    const d = dayjs().subtract(1, 'month').startOf('month');
    const firstDay = d.startOf('month');
    const oneJan = d.startOf('year');
    const numberOfDays = firstDay.diff(oneJan, 'day');
    const weekNum = Math.ceil((numberOfDays + firstDay.day() + 1) / 7);
    return `${d.format('YYYY')}-W${weekNum}`;
  });

  useEffect(() => {
    if (activeTab === 'daily') setSelectedMonth(preciseDate);
    else if (activeTab === 'weekly') setSelectedMonth(preciseWeek);
    else setSelectedMonth(preciseMonth);
  }, [activeTab, preciseDate, preciseMonth, preciseWeek]);

  const fetchAvailablePeriods = useCallback(async (type) => {
    try {
      const response = await API.getAvailablePrevMonthPlayedUsersMonths(type);
      let periods = response.data || [];
      const now = new Date();
      let currentPeriodStr = '';
      if (type === 'daily') currentPeriodStr = now.toISOString().split('T')[0];
      else if (type === 'weekly') {
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        currentPeriodStr = `${now.getFullYear()}-W${weekNum}`;
      } else currentPeriodStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!periods.includes(currentPeriodStr)) periods = [currentPeriodStr, ...periods];
      setAvailableMonths(periods);
      if (periods.length > 0) {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;
        let defaultPeriod = periods[0];
        if (type === 'monthly') {
          const found = periods.find(p => p === prevMonthStr);
          if (found) defaultPeriod = found;
        } else if (type === 'weekly' || type === 'daily') {
          const found = periods.find(p => p.startsWith(prevMonthStr));
          if (found) defaultPeriod = found;
          else if (periods.length > 1 && periods[0] === currentPeriodStr) defaultPeriod = periods[1];
        }
        setSelectedMonth(defaultPeriod);
      } else setSelectedMonth('');
    } catch (error) {
      console.error('Error fetching available periods:', error);
      toast.error('Failed to fetch available periods');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20, type: activeTab };
      if (selectedMonth) params.monthYear = selectedMonth;
      const response = await API.getAllPrevMonthPlayedUsers(params);
      if (response && response.success) {
        setUsers(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination || pagination);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch transmission stream');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedMonth, activeTab]);

  useEffect(() => {
    fetchAvailablePeriods(activeTab);
    setPage(1);
  }, [activeTab, fetchAvailablePeriods]);

  useEffect(() => {
    if (selectedMonth) fetchUsers();
  }, [page, selectedMonth, fetchUsers]);

  const handleViewUserDetails = (userId) => {
    router.push(`/admin/prev-month-played-users/${userId}/quiz-scores`);
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'highScoreQuiz') {
      aValue = (a.monthlyProgress?.highScoreWins || 0);
      bValue = (b.monthlyProgress?.highScoreWins || 0);
    } else if (sortBy === 'accuracy') {
      aValue = (a.monthlyProgress?.accuracy || 0);
      bValue = (b.monthlyProgress?.accuracy || 0);
    } else if (sortBy === 'score') {
      aValue = (a.getScore || 0);
      bValue = (b.getScore || 0);
    } else if (sortBy === 'totalQuizzes') {
      aValue = (a.monthlyProgress?.totalQuizAttempts || 0);
      bValue = (b.monthlyProgress?.totalQuizAttempts || 0);
    } else return 0;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading && users.length === 0) {
    return (
      <AdminMobileAppWrapper title="Yield Stream">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full shadow-2xl"
            />
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500" />
          </div>
          <div className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing Diagnostic Performance Logs...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Yield Stream">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        <Sidebar />
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>
          
          {/* Header & Modulation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">ADMIN_HUB // PERFORMANCE_AUDIT</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  {activeTab} <span className="text-indigo-500">PLAYED</span> <span className="text-slate-300 dark:text-white/10 ml-2 italic tracking-widest text-2xl lg:text-4xl">USERS</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">System-wide audit of user engagement metrics, accuracy coefficients, and high-score attribution.</p>
              </div>

               <div className="flex p-2 bg-white dark:bg-white/5 rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === type
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Control Console */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-12 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-8 text-[10px] font-black">
               <div className="flex flex-wrap items-center gap-8 flex-1">
                  
                  {activeTab === 'daily' && (
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-400 uppercase tracking-widest">TEMPORAL_INDEX</div>
                        <DatePicker
                          selected={new Date(preciseDate)}
                          onChange={(date) => setPreciseDate(dayjs(date).format('YYYY-MM-DD'))}
                          dateFormat="yyyy-MM-dd"
                          maxDate={new Date()}
                          className="bg-transparent text-sm font-black uppercase italic tracking-tighter outline-none cursor-pointer text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'weekly' && (
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
                            <Clock className="w-5 h-5" />
                         </div>
                         <div className="space-y-1">
                            <div className="text-slate-400 uppercase tracking-widest">CYCLE_MONTH</div>
                            <DatePicker
                              selected={dayjs(preciseMonth).toDate()}
                              onChange={(date) => {
                                const newMonth = dayjs(date).format('YYYY-MM');
                                setPreciseMonth(newMonth);
                                const d = dayjs(date);
                                setPreciseWeek(`${d.format('YYYY')}-W${Math.ceil((d.startOf('month').diff(d.startOf('year'), 'day') + d.startOf('month').day() + 1) / 7)}`);
                              }}
                              dateFormat="MMMM yyyy"
                              showMonthYearPicker
                              className="bg-transparent text-sm font-black uppercase italic tracking-tighter outline-none cursor-pointer text-slate-900 dark:text-white w-32"
                            />
                         </div>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((w) => {
                          const [y, m] = preciseMonth.split('-').map(Number);
                          const dayInWeek = new Date(y, m - 1, (w - 1) * 7 + 1);
                          const oneJan = new Date(dayInWeek.getFullYear(), 0, 1);
                          const numberOfDays = Math.floor((dayInWeek - oneJan) / (24 * 60 * 60 * 1000));
                          const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
                          const weekVal = `${y}-W${weekNum}`;
                          const isActive = preciseWeek === weekVal;

                          return (
                            <button
                              key={w}
                              onClick={() => setPreciseWeek(weekVal)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${isActive
                                ? 'bg-purple-600 text-white shadow-lg scale-110'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600'
                                }`}
                            >
                              W{w}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'monthly' && (
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                         <Filter className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-400 uppercase tracking-widest">FISCAL_CYCLE</div>
                        <DatePicker
                          selected={dayjs(preciseMonth).toDate()}
                          onChange={(date) => setPreciseMonth(dayjs(date).format('YYYY-MM'))}
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
                          maxDate={new Date()}
                          className="bg-transparent text-sm font-black uppercase italic tracking-tighter outline-none cursor-pointer text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                    {[
                      { icon: TableIcon, id: 'table', label: 'TAB' },
                      { icon: List, id: 'list', label: 'LIN' },
                      { icon: LayoutGrid, id: 'grid', label: 'SPC' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <mode.icon className="w-4 h-4" />
                        {viewMode === mode.id && <span className="text-[8px] font-black tracking-widest pr-1">{mode.label}</span>}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Metric Summary Modules */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12">
                {[
                  { label: "CONNECTED_UNITS", value: pagination.total, icon: Users, color: "bg-indigo-500" },
                  { label: "CURRENT_SEGMENT", value: selectedMonth || 'FULL_SPECTRUM', icon: Calendar, color: "bg-emerald-500" },
                  { label: "INDEX_PAGE", value: `${pagination.page} / ${pagination.totalPages}`, icon: Zap, color: "bg-rose-500" },
                  { label: "DIAGNOSTIC_TAB", value: activeTab.toUpperCase(), icon: ShieldCheck, color: "bg-amber-500" }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${stat.color} rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[140px] text-white`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <stat.icon className="w-16 h-16" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">{stat.label}</div>
                    <div className="text-xl lg:text-3xl font-black italic tracking-tighter tabular-nums uppercase">{stat.value}</div>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* User Yield Stream */}
          <AnimatePresence mode="wait">
             {loading && users.length === 0 ? (
                <div className="flex justify-center py-40">
                   <Loading size="lg" color="blue" message="" />
                </div>
             ) : users.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
                >
                  <Activity className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-8" />
                  <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">ZERO_DIAGNOSTIC_DATA</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No Recorded performance markers detected for the current tactical segment.</p>
                </motion.div>
             ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                   {/* Table View */}
                   {viewMode === 'table' && (
                     <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                           <table className="w-full">
                              <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <th className="px-8 py-8 text-center w-20">#REF</th>
                                  <th className="px-8 py-8">UNIT_IDENTITY</th>
                                  <th className="px-8 py-8 text-center">TEMPORAL_MARKER</th>
                                  <th className="px-8 py-8 text-center">EVOLUTION_LEVEL</th>
                                  <th className="px-8 py-8 text-center">SUBSCRIPTION</th>
                                  <th onClick={() => handleSort('totalQuizzes')} className="px-8 py-8 text-center cursor-pointer hover:text-primary-500 transition-colors">YIELD_TOTAL <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                  <th onClick={() => handleSort('highScoreQuiz')} className="px-8 py-8 text-center cursor-pointer hover:text-emerald-500 transition-colors">PEAK_SCORE <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                  <th onClick={() => handleSort('accuracy')} className="px-8 py-8 text-center cursor-pointer hover:text-primary-500 transition-colors">PRECISION <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                                  <th className="px-8 py-8 text-right">VALUATION</th>
                                  <th className="px-8 py-8 text-center">ACTION</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                 {sortedUsers.map((user, i) => {
                                    const serialNumber = (pagination.page - 1) * pagination.limit + i + 1;
                                    return (
                                       <motion.tr
                                          key={user._id || i}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.05 }}
                                          className="group hover:bg-indigo-500/5 transition-all text-[10px] font-black uppercase tracking-widest text-slate-500"
                                       >
                                          <td className="px-8 py-6 text-center tabular-nums opacity-30">#{serialNumber}</td>
                                          <td className="px-8 py-6">
                                             <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-primary-500 transition-all">
                                                   {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="overflow-hidden max-w-[150px]">
                                                   <div className="text-slate-900 dark:text-white truncate mb-1">{user.name || 'NULL_ID'}</div>
                                                   <div className="text-[8px] opacity-60 truncate italic">{user.email || 'OFFLINE'}</div>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-center tabular-nums italic text-slate-900 dark:text-white">{user.monthYear}</td>
                                          <td className="px-8 py-6 text-center">
                                             <div className="flex flex-col items-center">
                                                <span className="text-indigo-500 text-sm italic tracking-tighter">LVL_{user.monthlyProgress?.currentLevel || 0}</span>
                                                <span className="text-[8px] opacity-40">{user.monthlyProgress?.levelName || 'GENESIS'}</span>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-center">
                                             <div className={`px-3 py-1 rounded-full border text-[8px] font-black ${user.subscriptionStatus === 'premium' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                                                {user.subscriptionStatus?.toUpperCase() || 'FREE'}
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-center text-sm italic tracking-tighter text-slate-900 dark:text-white tabular-nums">{user.monthlyProgress?.totalQuizAttempts || 0}</td>
                                          <td className="px-8 py-6 text-center">
                                             <div className="flex items-center justify-center gap-2 text-emerald-500">
                                                <Trophy className="w-3 h-3" />
                                                <span className="text-sm italic tracking-tighter tabular-nums">{user.monthlyProgress?.highScoreWins || 0}</span>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 text-center">
                                             <div className="text-sm italic tracking-tighter text-slate-900 dark:text-white tabular-nums">{user.monthlyProgress?.accuracy || 0}%</div>
                                          </td>
                                          <td className="px-8 py-6 text-right">
                                             <div className="text-sm italic tracking-tighter text-slate-900 dark:text-white tabular-nums">{user.getScore} / {user.totalScore}</div>
                                             <div className="text-[8px] opacity-40">YIELD_RATIO</div>
                                          </td>
                                          <td className="px-8 py-6 text-center">
                                             <button
                                                onClick={() => handleViewUserDetails(user.originalUserId)}
                                                className="p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-xl hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-inner"
                                             >
                                                <Eye className="w-4 h-4" />
                                             </button>
                                          </td>
                                       </motion.tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}

                   {/* Grid View */}
                   {viewMode === 'grid' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {sortedUsers.map((user, i) => (
                           <motion.div
                              key={user._id || i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-8 lg:p-10 hover:border-indigo-500/30 transition-all shadow-xl flex flex-col items-center text-center"
                           >
                              <div className="relative mb-6">
                                 <div className="w-20 h-20 bg-slate-900 dark:bg-white/10 text-white rounded-[2rem] flex items-center justify-center border-4 border-slate-100 dark:border-white/10 shadow-lg group-hover:scale-110 group-hover:bg-primary-500 transition-all uppercase font-black text-2xl">
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                 </div>
                                 <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-[#060813]">
                                    <Trophy className="w-4 h-4" />
                                 </div>
                              </div>

                              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-1 uppercase">{user.name || 'NULL_ID'}</h3>
                              <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-8 italic">{user.email || 'OFFLINE'}</div>

                              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                 <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 group-hover:border-primary-500/20 transition-all">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL_YIELD</div>
                                    <div className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white tabular-nums">{user.monthlyProgress?.totalQuizAttempts || 0}</div>
                                 </div>
                                 <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 group-hover:border-emerald-500/20 transition-all">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PEAK_WINS</div>
                                    <div className="text-xl font-black italic tracking-tighter text-emerald-500 tabular-nums">{user.monthlyProgress?.highScoreWins || 0}</div>
                                 </div>
                                 <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 group-hover:border-indigo-500/20 transition-all">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PRECISION</div>
                                    <div className="text-xl font-black italic tracking-tighter text-indigo-500 tabular-nums">{user.monthlyProgress?.accuracy || 0}%</div>
                                 </div>
                                 <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 group-hover:border-rose-500/20 transition-all">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">VALUATION</div>
                                    <div className="text-xl font-black italic tracking-tighter text-rose-500 tabular-nums">{user.getScore}</div>
                                 </div>
                              </div>

                              <button
                                 onClick={() => handleViewUserDetails(user.originalUserId)}
                                 className="w-full p-5 bg-slate-900 dark:bg-white/10 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                              >
                                 <Eye className="w-5 h-5" /> VIEW_PROFILE_INTEL
                              </button>
                           </motion.div>
                        ))}
                     </div>
                   )}

                   {/* List View */}
                   {viewMode === 'list' && (
                     <div className="space-y-6">
                        {sortedUsers.map((user, i) => (
                           <motion.div
                              key={user._id || i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 hover:border-indigo-500/30 transition-all shadow-xl flex flex-col lg:flex-row items-center gap-10"
                           >
                              <div className="w-20 h-20 bg-slate-900 dark:bg-white/10 text-white rounded-[2rem] flex items-center justify-center shrink-0 border-4 border-slate-100 dark:border-white/10 shadow-xl group-hover:scale-110 group-hover:bg-primary-500 transition-all uppercase font-black text-2xl">
                                 {user.name?.[0]?.toUpperCase() || 'U'}
                              </div>

                              <div className="flex-1 text-center lg:text-left space-y-3">
                                 <div className="flex flex-col lg:flex-row items-center gap-4">
                                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none hover:text-primary-500 transition-colors uppercase">{user.name || 'NULL_IDENTITY'}</h3>
                                    <div className={`px-4 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${user.subscriptionStatus === 'premium' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-100 dark:bg-white/5'}`}>
                                       {user.subscriptionStatus?.toUpperCase() || 'FREE'}
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-2">
                                    <div className="flex items-center gap-2">
                                       <Mail className="w-4 h-4 text-slate-300" />
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{user.email || 'OFFLINE'}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${activeTab === 'daily' ? 'text-primary-500' : activeTab === 'weekly' ? 'text-purple-500' : 'text-indigo-500'}`}>
                                       <Activity className="w-4 h-4" />
                                       <span className="text-[10px] font-black uppercase tracking-widest italic">{activeTab.toUpperCase()}_DIAGNOSTIC_CYCLE: {user.monthYear}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <Award className="w-4 h-4 text-amber-500" />
                                       <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">EVO_LEVEL: {user.monthlyProgress?.currentLevel || 0}</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex gap-4">
                                 <div className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 text-center min-w-[140px] group-hover:border-primary-500/20 transition-all">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL_ATTEMPTS</div>
                                    <div className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white tabular-nums">{user.monthlyProgress?.totalQuizAttempts || 0}</div>
                                 </div>
                                 <div className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 text-center min-w-[140px] group-hover:border-emerald-500/20 transition-all">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PEAK_SUCCESS</div>
                                    <div className="text-2xl font-black italic tracking-tighter text-emerald-500 tabular-nums">{user.monthlyProgress?.highScoreWins || 0}</div>
                                 </div>
                              </div>

                              <button
                                 onClick={() => handleViewUserDetails(user.originalUserId)}
                                 className="p-6 bg-white dark:bg-white/5 text-slate-400 border-4 border-slate-50 dark:border-white/10 rounded-[2rem] hover:text-primary-500 hover:border-primary-500/30 hover:scale-105 active:scale-95 transition-all shadow-xl"
                              >
                                 <Eye className="w-8 h-8" />
                              </button>
                           </motion.div>
                        ))}
                     </div>
                   )}
                </motion.div>
             )}
          </AnimatePresence>

          {/* Spectral Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16 text-[10px] font-black uppercase tracking-widest">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-6 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-full text-slate-400 hover:text-primary-500 disabled:opacity-20 transition-all shadow-xl active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-8 py-4 bg-slate-900 dark:bg-white/10 text-white rounded-[2rem] shadow-2xl italic tracking-tighter">
                 DIAGNOSTIC_INDEX: {pagination.page} <span className="text-slate-500 mx-2">//</span> TOTAL_UNITS: {pagination.totalPages}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-6 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-full text-slate-400 hover:text-primary-500 disabled:opacity-20 transition-all shadow-xl active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminPrevMonthPlayedUsers;

