'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaCrown, FaCalendarAlt, FaUsers, FaRupeeSign, FaTh, FaList, FaTable, FaSearch, FaInfoCircle, FaHistory } from 'react-icons/fa';
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
        toast.error('Failed to fetch monthly winners');
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
        toast.success(`Filtered winners for ${periodLabel} (${activeType})`);
      }
    } catch (error) {
      console.error('Error filtering monthly winners:', error);
      toast.error('Failed to fetch monthly winners');
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
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className={`text-md lg:text-3xl font-black italic tracking-tighter uppercase ${activeType === 'daily' ? 'text-secondary-600 dark:text-secondary-400' :
                    activeType === 'weekly' ? 'text-primary-600 dark:text-primary-400' :
                      'text-primary-600 dark:text-primary-500'
                    }`}>
                    {activeType} Champions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm font-medium">
                    {activeType === 'daily' ? 'Rewarding daily consistency and quiz speed.' :
                      activeType === 'weekly' ? 'Weekly top performers and masterminds.' :
                        'The ultimate monthly legends of AajExam.'}
                  </p>
                </div>
              </div>

              {/* Competition Type Selector */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 capitalize ${activeType === type
                      ? activeType === 'daily' ? 'bg-secondary-600 text-white shadow-lg' :
                        activeType === 'weekly' ? 'bg-purple-600 text-white shadow-lg' :
                          'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Year and Month Filters - Moved to Header */}
              <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                {activeType === 'daily' && !showAllMonths && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:block">Date:</label>
                    <DatePicker
                      selected={new Date(preciseDate)}
                      onChange={(date) => setPreciseDate(dayjs(date).format('YYYY-MM-DD'))}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                  </div>
                )}

                {activeType === 'weekly' && !showAllMonths && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:block">Week:</label>
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
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500'
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
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:block">Month:</label>
                    <DatePicker
                      selected={dayjs(preciseMonth).toDate()}
                      onChange={(date) => setPreciseMonth(dayjs(date).format('YYYY-MM'))}
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      maxDate={new Date()}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
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
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-secondary-600 dark:text-secondary-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                      <FaTh className="text-lg" />
                      <span>Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-secondary-600 dark:text-secondary-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                      <FaList className="text-lg" />
                      <span>List</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'table'
                        ? 'bg-white dark:bg-gray-600 text-secondary-600 dark:text-secondary-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                      <FaTable className="text-lg" />
                      <span>Table</span>
                    </button>
                  </div>

                  {/* Show All Months Toggle */}
                  <Button
                    onClick={() => setShowAllMonths(!showAllMonths)}
                    variant={showAllMonths ? 'primary' : 'secondary'}
                    className={`w-full lg:w-auto px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${showAllMonths
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    icon={<FaCalendarAlt className="text-sm" />}
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
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 underline capitalize">
                  {showAllMonths ? `No ${activeType} Winners Available` : `No ${activeType} Winners Found`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {showAllMonths
                    ? `No ${activeType} winners data is currently available in the system.`
                    : `No winners found for this period. Try changing the filters above.`
                  }
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Tip: {currentMonth === 9 ? 'Currently showing August data by default. ' : ''}Try selecting different months to view available data!
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-secondary-500 shadow-secondary-50' : activeType === 'weekly' ? 'border-purple-500 shadow-purple-50' : 'border-primary-500 shadow-primary-50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-secondary-50 text-secondary-600' : activeType === 'weekly' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-secondary-600'}`}>
                        <FaCalendarAlt className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total {activeType === 'daily' ? 'Days' : activeType === 'weekly' ? 'Weeks' : 'Months'}</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                          {fetchingStats ? '...' : (activeType === 'daily' ? stats?.totalDays : activeType === 'weekly' ? stats?.totalWeeks : stats?.totalMonths) || '0'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-secondary-500 shadow-secondary-50' : activeType === 'weekly' ? 'border-purple-500 shadow-purple-50' : 'border-primary-500 shadow-primary-50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-secondary-50 text-secondary-600' : activeType === 'weekly' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-secondary-600'}`}>
                        <FaUsers className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Winners/{activeType === 'daily' ? 'Day' : activeType === 'weekly' ? 'Week' : 'Month'}</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                          {fetchingStats ? '...' : (activeType === 'daily' ? stats?.avgWinnersPerDay : activeType === 'weekly' ? stats?.avgWinnersPerWeek : stats?.avgWinnersPerMonth) || '0'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-secondary-500 shadow-secondary-50' : activeType === 'weekly' ? 'border-purple-500 shadow-purple-50' : 'border-primary-500 shadow-primary-50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-secondary-50 text-secondary-600' : activeType === 'weekly' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-secondary-600'}`}>
                        <FaRupeeSign className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Prize</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                          ₹{fetchingStats ? '...' : (activeType === 'daily' ? stats?.totalDistributedDaily : activeType === 'weekly' ? stats?.totalDistributedWeekly : stats?.totalAmountDistributed)?.toLocaleString() || '0'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-secondary-400 shadow-secondary-50/50' : activeType === 'weekly' ? 'border-purple-400 shadow-purple-50/50' : 'border-primary-400 shadow-primary-50/50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-secondary-50/50 text-secondary-500' : activeType === 'weekly' ? 'bg-purple-50/50 text-purple-500' : 'bg-primary-50/50 text-primary-500'}`}>
                        <FaHistory className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {activeType === 'daily' ? dayjs(preciseDate).format('DD MMM') : activeType === 'weekly' ? `Week ${preciseWeek.split('-W')[1]}` : dayjs(preciseMonth).format('MMM YYYY')} Prize
                        </p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                          ₹{monthlyWinnersLoading ? '...' : (monthlyWinners[0]?.totalPrizePool || 0)?.toLocaleString()}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 transition-all hover:scale-[1.02] ${activeType === 'daily' ? 'border-secondary-500 shadow-secondary-50' : activeType === 'weekly' ? 'border-purple-500 shadow-purple-50' : 'border-primary-500 shadow-primary-50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${activeType === 'daily' ? 'bg-secondary-50 text-secondary-600' : activeType === 'weekly' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-secondary-600'}`}>
                        <FaTrophy className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected {activeType === 'daily' ? 'Day' : activeType === 'weekly' ? 'Week' : 'Month'}</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase truncate">
                          {activeType === 'daily' ? dayjs(preciseDate).format('DD MMM YY') : activeType === 'weekly' ? `Wk ${preciseWeek.split('-W')[1]}` : dayjs(preciseMonth).format('MMM YYYY')}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Rules Badge Info Section - Moved to Bottom */}
                <div className={`mt-8 p-4 rounded-2xl border flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300 ${activeType === 'daily' ? 'bg-secondary-50/50 border-secondary-100 dark:bg-secondary-900/10 dark:border-secondary-900/30' :
                  activeType === 'weekly' ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30' :
                    'bg-primary-50/50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30'
                  }`}>
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 ${activeType === 'daily' ? 'bg-secondary-600 text-white' :
                      activeType === 'weekly' ? 'bg-primary-600 text-white' :
                        'bg-primary-600 text-white'
                      }`}>
                      <FaInfoCircle className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">Participation Criteria</h4>
                      <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                        <div className="text-sm font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activeType === 'daily' ? 'bg-secondary-500 animate-pulse' : activeType === 'weekly' ? 'bg-purple-500 animate-pulse' : 'bg-primary-500 animate-pulse'}`}></div>
                          {activeType === 'daily' ? `${config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT} Quizzes` : activeType === 'weekly' ? `${config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT} Quizzes` : `${config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} Quizzes`} Minimum
                        </div>
                        <div className="text-sm font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activeType === 'daily' ? 'bg-secondary-500' : activeType === 'weekly' ? 'bg-purple-500' : 'bg-primary-500'}`}></div>
                          Level {activeType === 'daily' ? `${config.QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED}+` : activeType === 'weekly' ? `${config.QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED}+` : `${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}+`} Required
                        </div>
                        <div className="text-sm font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activeType === 'daily' ? 'bg-secondary-500' : activeType === 'weekly' ? 'bg-purple-500' : 'bg-primary-500'}`}></div>
                          {config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% Min. Accuracy
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase italic tracking-wider shadow-xl transform skew-x-[-10deg] ${activeType === 'daily' ? 'bg-secondary-600 text-white' :
                      activeType === 'weekly' ? 'bg-primary-600 text-white' :
                        'bg-primary-600 text-white'
                      }`}>
                      PRO Member Only
                    </span>
                  </div>
                </div>
                {/* Monthly Winners Grid */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {monthlyWinners.map((monthData, index) => (
                      <div key={monthData._id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-400 to-primary-500 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-xl" />
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
                                    {winner.rank === 1 ? <FaCrown /> : winner.rank === 2 ? <FaMedal /> : <FaMedal />}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{winner?.userId?.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{winner?.userId?.email}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    ₹{winner.rewardAmount?.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {winner.highScoreWins} wins • {winner.accuracy}% accuracy
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>Winners: {monthData.totalWinners}</span>
                              <span>Reset: {new Date(monthData.resetDate).toLocaleDateString()}</span>
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
                              <FaCalendarAlt className="text-xl" />
                              <h3 className="text-xl font-bold">
                                {monthData.monthYear || (activeType === 'daily' ? new Date(monthData.resetDate).toLocaleDateString() : `Week ${monthData.weekNumber || ''}`)}
                              </h3>
                              <span className="text-sm opacity-90">• {monthData.totalWinners} Winners</span>
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
                                    {winner.rank === 1 ? <FaCrown /> : winner.rank === 2 ? <FaMedal /> : <FaMedal />}
                                  </div>
                                  <div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{winner?.userId?.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{winner?.userId?.email}</div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {winner.highScoreWins} wins • {winner.accuracy}% accuracy
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-md lg:text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₹{winner.rewardAmount?.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Rank #{winner.rank}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>Reset Date: {new Date(monthData.resetDate).toLocaleDateString()}</span>
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
                  <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className={`p-8 text-white ${activeType === 'daily' ? 'bg-gradient-to-br from-secondary-600 to-indigo-700 shadow-secondary-200' : activeType === 'weekly' ? 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-200' : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <FaTrophy className="text-2xl text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">All Winners Table</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Full performance breakdown for {activeType}</p>
                          </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end">
                          <div className="text-[10px] font-black uppercase opacity-60">System Log</div>
                          <div className="text-xs font-black tabular-nums">{dayjs().format('HH:mm:ss Z')}</div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              S.No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Winner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Period
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Prize
                            </th>
                            {activeType === 'monthly' && (
                              <>
                                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Monthly Referrals
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Referral Eligible
                                </th>
                              </>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Winning Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                          {monthlyWinners.map((monthData, monthIndex) =>
                            monthData.winners?.map((winner, winnerIndex) => (
                              <tr key={`${monthData._id}-${winner._id || winnerIndex}`} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500 font-bold tabular-nums">
                                  {(() => {
                                    let serialNumber = 1;
                                    for (let i = 0; i < monthIndex; i++) {
                                      serialNumber += monthlyWinners[i].winners?.length || 0;
                                    }
                                    return (serialNumber + winnerIndex).toString().padStart(2, '0');
                                  })()}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-110 ${winner.rank === 1 ? 'bg-primary-500' :
                                      winner.rank === 2 ? 'bg-gray-400' : 'bg-primary-600'
                                      }`}>
                                      {winner.rank === 1 ? <FaCrown className="text-lg" /> : <span className="text-sm">#{winner.rank}</span>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
                                      {winner?.userId?.name || winner?.userName || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 lowercase tracking-tight italic">
                                      {winner?.userId?.email || 'no-email'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${activeType === 'daily' ? 'bg-secondary-100 text-secondary-700' : activeType === 'weekly' ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'}`}>
                                    Lvl {winner.userLevel || winner?.userId?.level || '0'}
                                  </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter">
                                    {monthData.monthYear || (activeType === 'daily' ? dayjs(monthData.resetDate).format('DD MMM YY') : activeType === 'weekly' ? `Week ${monthData.weekNumber}` : dayjs(monthData.resetDate).format('MMM YYYY'))}
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums">{winner.highScoreWins} Wins</span>
                                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full rounded-full ${activeType === 'daily' ? 'bg-secondary-500' : activeType === 'weekly' ? 'bg-purple-500' : 'bg-primary-500'}`} style={{ width: `${winner.accuracy}%` }}></div>
                                      </div>
                                      <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{winner.accuracy}% Accuracy</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className={`text-lg font-black tabular-nums transition-all group-hover:scale-110 ${activeType === 'daily' ? 'text-secondary-600' : activeType === 'weekly' ? 'text-purple-600' : 'text-secondary-600'}`}>
                                    ₹{winner.rewardAmount?.toLocaleString()}
                                  </div>
                                </td>
                                {activeType === 'monthly' && (
                                  <>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                      <div className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                                        {winner.monthlyReferralCount || 0}
                                      </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                      <span className={`px-3 py-1 inline-flex text-[9px] uppercase font-black rounded-full tracking-widest shadow-sm ${winner.referralEligible
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {winner.referralEligible ? 'Eligible' : 'Not Elite'}
                                      </span>
                                    </td>
                                  </>
                                )}
                                <td className="px-6 py-5 whitespace-nowrap text-[10px] text-gray-400 dark:text-gray-500">
                                  <div className="font-black uppercase">
                                    {dayjs(monthData.resetDate).format('DD-MMM-YY')}
                                  </div>
                                  <div className="font-bold opacity-60">
                                    {dayjs(monthData.resetDate).format('hh:mm A')}
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

