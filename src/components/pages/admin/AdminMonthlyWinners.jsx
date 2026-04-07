'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import { 
  Trophy, Medal, Crown, Calendar, Users, IndianRupee, LayoutGrid, List, Table as TableIcon, 
  Search, Info, History, ShieldCheck, Zap, Activity, Clock, ChevronRight, Filter, Star, 
  TrendingUp, Award, BarChart3, Binary, Cpu, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../datepicker-custom.css";
import config from '../../../lib/config/appConfig';

const AdminMonthlyWinners = () => {
  const [monthlyWinners, setMonthlyWinners] = useState([]);
  const [activeType, setActiveType] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [monthlyWinnersLoading, setMonthlyWinnersLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table'); // 'grid', 'list', 'table'
  // Get current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1

  // Calculate default previous month
  let defaultMonth = currentMonth - 1;
  let defaultYear = currentYear;

  // Handle year rollover (if current month is Jan, prev month is Dec of last year)
  if (defaultMonth === 0) {
    defaultMonth = 12;
    defaultYear = currentYear - 1;
  }

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // New precise filters
  const [preciseDate, setPreciseDate] = useState(() => dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
  const [preciseWeek, setPreciseWeek] = useState(() => {
    const d = dayjs().subtract(1, 'week');
    const oneJan = dayjs(d).startOf('year');
    const numberOfDays = d.diff(oneJan, 'day');
    const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
    return `${d.format('YYYY')}-W${weekNum}`;
  });
  const [preciseMonth, setPreciseMonth] = useState(() => dayjs().subtract(1, 'month').format('YYYY-MM'));

  const [showAllMonths, setShowAllMonths] = useState(false); // Toggle to show all months or specific month
  const [stats, setStats] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchMonthlyWinners = useCallback(async () => {
    try {
      setMonthlyWinnersLoading(true);
      const filters = {};
      let periodId = null;

      if (showAllMonths) {
        // Show all available periods
        const response = await API.getRecentMonthlyWinners(12, null, activeType);
        setMonthlyWinners(response.data || []);
      } else {
        if (activeType === 'daily') {
          filters.date = preciseDate;
        } else if (activeType === 'weekly') {
          filters.week = preciseWeek;
        } else if (activeType === 'monthly') {
          periodId = preciseMonth;
        }

        // Get data for the specific period only
        const response = await API.getMonthlyWinners(periodId, activeType, filters);

        if (response && response.data) {
          // If it's an array (daily/weekly), use it as is. 
          // If it's a single object (monthly), wrap it in an array.
          setMonthlyWinners(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setMonthlyWinners([]);
        }
      }
    } catch (error) {
      console.error('Error fetching monthly winners:', error);
      // Don't show toast error on initial load if no data found for current/prev month
      // unless it's an actual API failure (not a 404)
      if (error?.response?.status !== 404) {
        toast.error('Could not load winners. Please try again.');
      }
      setMonthlyWinners([]);
    } finally {
      setMonthlyWinnersLoading(false);
    }
  }, [preciseDate, preciseWeek, preciseMonth, showAllMonths, activeType]);

  const fetchStats = useCallback(async () => {
    try {
      setFetchingStats(true);
      const response = await API.getMonthlyWinnersStats();
      if (response && response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setFetchingStats(false);
    }
  }, []);

  const handleFilter = async () => {
    try {
      setFilterLoading(true);
      await fetchMonthlyWinners();
      if (showAllMonths) {
        toast.success(`Showing all available ${activeType} winners`);
      } else {
        const periodLabel = activeType === 'daily' ? preciseDate :
          activeType === 'weekly' ? preciseWeek :
            preciseMonth;
        toast.success(`Showing ${activeType} winners for ${periodLabel}`);
      }
    } catch (error) {
      console.error('Error filtering monthly winners:', error);
      toast.error('Could not load winners. Please try again.');
    } finally {
      setFilterLoading(false);
    }
  };


  // Auto-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMonthlyWinners();
      fetchStats();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [preciseDate, preciseWeek, preciseMonth, showAllMonths, activeType, fetchStats]);

  return (
    <AdminMobileAppWrapper title={`${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Winners`}>
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        <Sidebar />
        <div className="adminContent w-full max-auto text-slate-900 dark:text-white font-outfit ">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className={`text-md md:text-xl lg:text-2xl font-black italic tracking-tighter uppercase ${activeType === 'daily' ? 'text-indigo-600 dark:text-indigo-400' :
                    activeType === 'weekly' ? 'text-blue-600 dark:text-blue-400' :
                      'text-indigo-600 dark:text-indigo-400'
                    }`}>
                    {activeType} Top Performers
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium uppercase tracking-widest leading-none">
                    {activeType === 'daily' ? 'View top quiz performers for each day.' :
                      activeType === 'weekly' ? 'See who led the leaderboard each week.' :
                        'Browse the top winners for each month.'}
                  </p>
                </div>
              </div>

              {/* Competition Type Selector */}
              <div className="flex p-2 bg-slate-100 dark:bg-white/5 rounded-2xl border-4 border-slate-200 dark:border-white/10">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveType(type)}
                    className={`px-3 lg:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeType === type
                      ? activeType === 'daily' ? 'bg-indigo-500 text-white shadow-xl' :
                        activeType === 'weekly' ? 'bg-blue-500 text-white shadow-xl' :
                          'bg-indigo-500 text-white shadow-xl'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>

              {/* Year and Month Filters - Moved to Header */}
              <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                {activeType === 'daily' && !showAllMonths && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider hidden sm:block">Date:</label>
                    <DatePicker
                      selected={new Date(preciseDate)}
                      onChange={(date) => setPreciseDate(dayjs(date).format('YYYY-MM-DD'))}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {activeType === 'weekly' && !showAllMonths && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider hidden sm:block">Week:</label>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={dayjs(preciseMonth).toDate()}
                        onChange={(date) => {
                          const newMonth = dayjs(date).format('YYYY-MM');
                          setPreciseMonth(newMonth);
                          const firstDay = dayjs(date).startOf('month');
                          const oneJan = dayjs(date).startOf('year');
                          const numberOfDays = firstDay.diff(oneJan, 'day');
                          const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                          setPreciseWeek(`${dayjs(date).format('YYYY')}-W${weekNum}`);
                        }}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white outline-none w-32"
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((w) => {
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
                              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${isActive
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-slate-700 dark:text-gray-400'
                                }`}
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeType === 'monthly' && !showAllMonths && (
                   <div className="flex items-center gap-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Month:</label>
                     <DatePicker
                       selected={dayjs(preciseMonth).toDate()}
                       onChange={(date) => setPreciseMonth(dayjs(date).format('YYYY-MM'))}
                       dateFormat="MMMM yyyy"
                       showMonthYearPicker
                       maxDate={new Date()}
                       className="bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
                     />
                   </div>
                )}

                {showAllMonths && (
                  <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg border border-green-200 dark:border-green-800">
                    Showing all records
                  </div>
                )}

              </div>
              {/* View Toggle Buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg lg:rounded-[1.5rem] p-2 border-2 border-slate-200 dark:border-white/10 shadow-inner">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-xl transition-all ${viewMode === 'grid'
                        ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xl'
                        : 'text-slate-400 hover:text-indigo-500'
                        }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                        ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xl'
                        : 'text-slate-400 hover:text-indigo-500'
                        }`}
                    >
                      <List className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('table')}
                      className={`p-3 rounded-xl transition-all ${viewMode === 'table'
                        ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xl'
                        : 'text-slate-400 hover:text-indigo-500'
                        }`}
                    >
                      <TableIcon className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Show All Months Toggle */}
                  <Button
                    onClick={() => setShowAllMonths(!showAllMonths)}
                    variant={showAllMonths ? 'primary' : 'secondary'}
                    className={`w-full lg:w-auto px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${showAllMonths
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    icon={Calendar}
                  >
                    {showAllMonths ? `Show Specific ${activeType === 'monthly' ? 'Month' : activeType === 'weekly' ? 'Week' : 'Day'}` : `Show All ${activeType === 'monthly' ? 'Months' : activeType === 'weekly' ? 'Weeks' : 'Days'}`}
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Content Display */}
          <div className="flex-1 overflow-auto">
            {monthlyWinnersLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="lg" color="yellow" message="" />
              </div>
            ) : monthlyWinners.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-600 dark:text-gray-400 dark:text-gray-500 text-2xl lg:text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 capitalize">
                  {showAllMonths ? `No ${activeType} winners yet` : `No winners for this ${activeType === 'daily' ? 'day' : activeType === 'weekly' ? 'week' : 'month'}`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {showAllMonths
                    ? `There are no ${activeType} winners recorded yet. Winners will appear here once a competition period ends.`
                    : `No winners were found for the selected period. Try picking a different ${activeType === 'daily' ? 'date' : activeType === 'weekly' ? 'week' : 'month'} using the filters above.`
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-6 mb-4 lg:mb-10">
                  <motion.div whileHover={{ y: -5 }} className={`bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl p-3 lg:p-8 rounded-xl lg:rounded-[2.5rem] shadow-2xl border-b-8 transition-all relative overflow-hidden group ${activeType === 'daily' ? 'border-indigo-500' : 'border-blue-500'}`}>
                    <div className="flex items-center gap-3 lg:gap-6 relative z-10">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Periods</p>
                        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">
                          {fetchingStats ? '...' : (activeType === 'daily' ? stats?.totalDays : activeType === 'weekly' ? stats?.totalWeeks : stats?.totalMonths) || '0'}
                        </h3>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className={`bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl p-3 lg:p-8 rounded-xl lg:rounded-[2.5rem] shadow-2xl border-b-8 transition-all relative overflow-hidden group ${activeType === 'daily' ? 'border-indigo-500' : 'border-blue-500'}`}>
                    <div className="flex items-center gap-3 lg:gap-6 relative z-10">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Avg Winners</p>
                        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">
                          {fetchingStats ? '...' : (activeType === 'daily' ? stats?.avgWinnersPerDay : activeType === 'weekly' ? stats?.avgWinnersPerWeek : stats?.avgWinnersPerMonth) || '0'}
                        </h3>
                      </div>
                    </div>
                  </motion.div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-primary-500 shadow-primary-50' : activeType === 'weekly' ? 'border-purple-500 shadow-purple-50' : 'border-primary-500 shadow-primary-50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-primary-50 text-primary-700 dark:text-primary-500' : activeType === 'weekly' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-primary-700 dark:text-primary-500'}`}>
                        <IndianRupee className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">Total Distributed</p>
                        <h3 className="text-xl lg:text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                          ₹{fetchingStats ? '...' : (activeType === 'daily' ? stats?.totalDistributedDaily : activeType === 'weekly' ? stats?.totalDistributedWeekly : stats?.totalAmountDistributed)?.toLocaleString() || '0'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-primary-400 shadow-primary-50/50' : activeType === 'weekly' ? 'border-purple-400 shadow-purple-50/50' : 'border-primary-400 shadow-primary-50/50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-primary-50/50 text-primary-700 dark:text-primary-500' : activeType === 'weekly' ? 'bg-purple-50/50 text-purple-500' : 'bg-primary-50/50 text-primary-700 dark:text-primary-500'}`}>
                        <History className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">
                          {activeType === 'daily' ? dayjs(preciseDate).format('DD MMM') : activeType === 'weekly' ? `Week ${preciseWeek.split('-W')[1]}` : dayjs(preciseMonth).format('MMM YYYY')} Prize Pool
                        </p>
                        <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                          ₹{monthlyWinnersLoading ? '...' : (monthlyWinners[0]?.totalPrizePool || 0)?.toLocaleString()}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-primary-500 shadow-primary-50' : activeType === 'weekly' ? 'border-purple-500 shadow-purple-50' : 'border-primary-500 shadow-primary-50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-primary-50 text-primary-700 dark:text-primary-500' : activeType === 'weekly' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-primary-700 dark:text-primary-500'}`}>
                        <Trophy className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">Viewing {activeType === 'daily' ? 'Day' : activeType === 'weekly' ? 'Week' : 'Month'}</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase truncate">
                          {activeType === 'daily' ? dayjs(preciseDate).format('DD MMM YY') : activeType === 'weekly' ? `Wk ${preciseWeek.split('-W')[1]}` : dayjs(preciseMonth).format('MMM YYYY')}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Rules Badge Info Section - Moved to Bottom */}
                <div className={`mt-4 lg:mt-8 p-4 lg:p-10 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/5 flex flex-col lg:flex-row gap-12 items-center justify-between transition-all duration-300 shadow-2xl relative overflow-hidden backdrop-blur-3xl ${activeType === 'daily' ? 'bg-indigo-50/50 dark:bg-indigo-900/10' :
                  activeType === 'weekly' ? 'bg-blue-50/50 dark:bg-blue-900/10' :
                    'bg-indigo-50/50 dark:bg-indigo-900/10'
                  }`}>
                  <div className="flex items-center gap-3 lg:gap-8 text-center lg:text-left relative z-10">
                    <div className={`w-16 h-16 rounded-lg lg:rounded-[1.5rem] flex items-center justify-center shadow-2xl transform rotate-6 scale-110 ${activeType === 'daily' ? 'bg-indigo-500 text-white' :
                      activeType === 'weekly' ? 'bg-blue-500 text-white' :
                        'bg-indigo-500 text-white'
                      }`}>
                      <Info className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Eligibility Rules</h4>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-3">
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                          <Zap className={`w-4 h-4 ${activeType === 'daily' ? 'text-indigo-500' : 'text-blue-500'}`} />
                          {activeType === 'daily' ? `MIN ${config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT} QUIZZES` : activeType === 'weekly' ? `MIN ${config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT} QUIZZES` : `MIN ${config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} QUIZZES`}
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                          <TrendingUp className={`w-4 h-4 ${activeType === 'daily' ? 'text-indigo-500' : 'text-blue-500'}`} />
                          LEVEL {activeType === 'daily' ? `${config.QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED}+` : activeType === 'weekly' ? `${config.QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED}+` : `${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}+`}
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                          <Award className={`w-4 h-4 ${activeType === 'daily' ? 'text-indigo-500' : 'text-blue-500'}`} />
                          {config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% ACCURACY
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10">
                    <motion.span 
                      whileHover={{ scale: 1.05, rotate: -2 }}
                      className={`px-4 lg:px-10 py-4 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase italic tracking-[0.2em] shadow-2xl transition-all ${activeType === 'daily' ? 'bg-indigo-500 text-white shadow-indigo-500/20' :
                      activeType === 'weekly' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                        'bg-indigo-500 text-white shadow-indigo-500/20'
                      }`}>
                      PREMIUM MEMBERS ONLY
                    </motion.span>
                  </div>
                </div>
                {/* Monthly Winners Grid */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-6">
                    {monthlyWinners.map((monthData, index) => (
                      <div key={monthData._id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-400 to-primary-500 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="text-xl" />
                              <h3 className="text-lg font-bold">
                                {monthData.monthYear || (activeType === 'daily' ? new Date(monthData.resetDate).toLocaleDateString() : `Week ${monthData.weekNumber || ''}`)}
                              </h3>
                            </div>
                            <div className="text-right">
                              <div className="text-sm opacity-90">Total Prize</div>
                              <div className="text-lg font-bold">₹{monthData.totalPrizePool?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="space-y-3">
                            {monthData.winners?.map((winner, winnerIndex) => (
                              <div key={winner._id || winnerIndex} className="flex flex-col lg:flex-row item-start lg:items-center justify-start lg:justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${winner.rank === 1 ? 'bg-primary-500' :
                                    winner.rank === 2 ? 'bg-gray-400' : 'bg-primary-600'
                                    }`}>
                                    {winner.rank === 1 ? <Crown /> : winner.rank === 2 ? <Medal /> : <Medal />}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{winner?.userId?.name}</div>
                                    <div className="text-sm text-slate-700 dark:text-gray-400">{winner?.userId?.email}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    ₹{winner.rewardAmount?.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-slate-700 dark:text-gray-400">
                                    {winner.highScoreWins} wins â€¢ {winner.accuracy}% accuracy
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>{monthData.totalWinners} Winners</span>
                              <span>Ended: {new Date(monthData.resetDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Monthly Winners List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {monthlyWinners.map((monthData, index) => (
                      <div key={monthData._id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Calendar className="text-xl" />
                              <h3 className="text-xl font-bold">
                                {monthData.monthYear || (activeType === 'daily' ? new Date(monthData.resetDate).toLocaleDateString() : `Week ${monthData.weekNumber || ''}`)}
                              </h3>
                              <span className="text-sm opacity-90">â€¢ {monthData.totalWinners} Winners</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm opacity-90">Total Prize Pool</div>
                              <div className="text-lg font-bold">₹{monthData.totalPrizePool?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 lg:p-6">
                          <div className="space-y-4">
                            {monthData.winners?.map((winner, winnerIndex) => (
                              <div key={winner._id || winnerIndex} className="flex flex-col lg:flex-row item-start lg:items-center justify-start lg:justify-between p-2 lg:p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full  flex items-center justify-center text-white font-bold text-lg ${winner.rank === 1 ? 'bg-primary-500' :
                                    winner.rank === 2 ? 'bg-gray-400' : 'bg-primary-600'
                                    }`}>
                                    {winner.rank === 1 ? <Crown /> : winner.rank === 2 ? <Medal /> : <Medal />}
                                  </div>
                                  <div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{winner?.userId?.name}</div>
                                    <div className="text-sm text-slate-700 dark:text-gray-400">{winner?.userId?.email}</div>
                                    <div className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                                      {winner.highScoreWins} wins â€¢ {winner.accuracy}% accuracy
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-md md:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₹{winner.rewardAmount?.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-slate-700 dark:text-gray-400">
                                    Rank #{winner.rank}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>Period ended: {new Date(monthData.resetDate).toLocaleDateString()}</span>
                              <span>Processed by: {monthData.processedBy}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Monthly Winners Table View */}
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] shadow-2xl border-4 border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className={`p-4 lg:p-10 text-white relative overflow-hidden ${activeType === 'daily' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                      <div className="absolute top-0 right-0 p-3 lg:p-8 opacity-10">
                        <Crown className="w-48 h-48 -rotate-12 translate-x-12 translate-y-[-12px]" />
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3 lg:gap-6">
                          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-3xl shadow-xl">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl lg:text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">Winners Leaderboard</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">Prize distribution details</p>
                          </div>
                        </div>
                        <div className="hidden lg:flex flex-col items-end">
                          <div className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Last Updated</div>
                          <div className="text-sm font-black tabular-nums tracking-widest">{dayjs().format('HH:mm:ss Z')}</div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b-2 border-slate-100 dark:border-white/5">
                          <tr>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Winner</th>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Prize</th>
                            {activeType === 'monthly' && (
                              <>
                                <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Referrals</th>
                                <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral Status</th>
                              </>
                            )}
                            <th className="px-4 lg:px-8 py-3 lg:py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Awarded On</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                          {monthlyWinners.map((monthData, monthIndex) =>
                            monthData.winners?.map((winner, winnerIndex) => (
                              <tr key={`${monthData._id}-${winner._id || winnerIndex}`} className="group hover:bg-indigo-500/5 transition-all text-nowrap">
                                <td className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 tabular-nums">
                                  {(() => {
                                    let serialNumber = 1;
                                    for (let i = 0; i < monthIndex; i++) {
                                      serialNumber += monthlyWinners[i].winners?.length || 0;
                                    }
                                    return (serialNumber + winnerIndex).toString().padStart(2, '0');
                                  })()}
                                </td>
                                <td className="px-4 lg:px-8 py-4 lg:py-8">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl transition-transform group-hover:scale-110 shadow-lg ${winner.rank === 1 ? 'bg-indigo-500 shadow-indigo-500/20' :
                                      winner.rank === 2 ? 'bg-slate-400' : 'bg-indigo-600'
                                      }`}>
                                      {winner.rank === 1 ? <Crown className="w-5 h-5" /> : <span className="text-xs">#{winner.rank}</span>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-8 py-4 lg:py-8">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight italic">
                                      {winner?.userId?.name || winner?.userName || 'Unknown'}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 lowercase tracking-widest mt-1 opacity-70">
                                      {winner?.userId?.email || 'No email available'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-8 py-4 lg:py-8">
                                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${activeType === 'daily' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                    LEVEL {winner.userLevel || winner?.userId?.level || '0'}
                                  </span>
                                </td>
                                <td className="px-4 lg:px-8 py-4 lg:py-8">
                                  <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    {monthData.monthYear || (activeType === 'daily' ? dayjs(monthData.resetDate).format('DD MMM YY') : activeType === 'weekly' ? `Week ${monthData.weekNumber}` : dayjs(monthData.resetDate).format('MMM YYYY'))}
                                  </div>
                                </td>
                                <td className="px-4 lg:px-8 py-4 lg:py-8">
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{winner.highScoreWins} Wins</span>
                                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full rounded-full ${activeType === 'daily' ? 'bg-indigo-500' : activeType === 'weekly' ? 'bg-blue-500' : 'bg-indigo-500'}`} style={{ width: `${winner.accuracy}%` }}></div>
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{winner.accuracy}% Accuracy</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-8 py-4 lg:py-8">
                                  <div className={`text-sm font-black tabular-nums ${activeType === 'daily' ? 'text-indigo-600' : 'text-blue-600'}`}>
                                    ₹{winner.rewardAmount?.toLocaleString()}
                                  </div>
                                </td>
                                {activeType === 'monthly' && (
                                  <>
                                    <td className="px-4 lg:px-8 py-4 lg:py-8">
                                      <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                                        {winner.monthlyReferralCount || 0}
                                      </div>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-8">
                                      <span className={`px-3 py-1 inline-flex text-[9px] uppercase font-black rounded-full tracking-widest shadow-sm ${winner.referralEligible
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {winner.referralEligible ? 'Eligible' : 'Not Eligible'}
                                      </span>
                                    </td>
                                  </>
                                )}
                                <td className="px-4 lg:px-8 py-4 lg:py-8 text-right">
                                  <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 italic">
                                    {dayjs(monthData.resetDate).format('DD MMM YY')}
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                                    {dayjs(monthData.resetDate).format('HH:mm:ss')}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}


          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminMonthlyWinners;



