'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaUsers, FaEye, FaChevronLeft, FaChevronRight, FaTrophy, FaSort, FaSortUp, FaSortDown, FaTh, FaList, FaTable } from 'react-icons/fa';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../datepicker-custom.css";

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
  const [sortBy, setSortBy] = useState('highScoreQuiz'); // Default sort by high score quiz
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table'); // 'grid', 'list', 'table'
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  // Precise filter states (Synced with Monthly Winners style)
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

  // Sync selectedMonth with precise pickers
  useEffect(() => {
    if (activeTab === 'daily') {
      setSelectedMonth(preciseDate);
    } else if (activeTab === 'weekly') {
      setSelectedMonth(preciseWeek);
    } else {
      setSelectedMonth(preciseMonth);
    }
  }, [activeTab, preciseDate, preciseMonth, preciseWeek]);

  // Fetch available periods based on tab
  const fetchAvailablePeriods = useCallback(async (type) => {
    try {
      const response = await API.getAvailablePrevMonthPlayedUsersMonths(type);
      let periods = response.data || [];

      // Add current period if it's not already in the list
      const now = new Date();
      let currentPeriodStr = '';
      if (type === 'daily') {
        currentPeriodStr = now.toISOString().split('T')[0];
      } else if (type === 'weekly') {
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        currentPeriodStr = `${now.getFullYear()}-W${weekNum}`;
      } else {
        currentPeriodStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      if (!periods.includes(currentPeriodStr)) {
        periods = [currentPeriodStr, ...periods];
      }

      setAvailableMonths(periods);
      if (periods.length > 0) {
        // Calculate previous month string (YYYY-MM)
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Try to find the best default period
        let defaultPeriod = periods[0]; // Fallback to newest

        if (type === 'monthly') {
          // Look for previous month exactly
          const found = periods.find(p => p === prevMonthStr);
          if (found) defaultPeriod = found;
        } else if (type === 'weekly' || type === 'daily') {
          // Look for the latest period belonging to the previous month
          const found = periods.find(p => p.startsWith(prevMonthStr));
          if (found) defaultPeriod = found;
          else if (periods.length > 1) {
            // If prev month not found, maybe just take the one before "current" if it's currently "current"
            if (periods[0] === currentPeriodStr) defaultPeriod = periods[1];
          }
        }

        setSelectedMonth(defaultPeriod);
      } else {
        setSelectedMonth('');
      }
    } catch (error) {
      console.error('Error fetching available periods:', error);
      toast.error('Failed to fetch available periods');
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        type: activeTab
      };

      if (selectedMonth) {
        params.monthYear = selectedMonth;
      }

      const response = await API.getAllPrevMonthPlayedUsers(params);

      if (response && response.success) {
        // Handle successful response - check if data exists and is an array
        const usersData = Array.isArray(response.data) ? response.data : [];
        if (usersData.length === 0) {
          setLoading(false);
        }
        setUsers(usersData);
        setPagination(response.pagination || pagination);
      } else {
        setLoading(false);
        // If response is not successful or doesn't have success flag, set empty users
        setUsers([]);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching prevMonthPlayedUsers:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedMonth]);

  useEffect(() => {
    fetchAvailablePeriods(activeTab);
    setPage(1);
  }, [activeTab, fetchAvailablePeriods]);

  useEffect(() => {
    if (selectedMonth) {
      fetchUsers();
    }
  }, [page, selectedMonth, fetchUsers]);

  const handleViewUserDetails = (userId) => {
    router.push(`/admin/prev-month-played-users/${userId}/quiz-scores`);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to desc
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Sort users based on current sort settings
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
    } else {
      return 0;
    }

    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <FaSort className="text-gray-400" />;
    }
    return sortOrder === 'asc' ? <FaSortUp className="text-secondary-600" /> : <FaSortDown className="text-secondary-600" />;
  };

  return (
    <AdminMobileAppWrapper title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Played Users`}>
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        <Sidebar />
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div>
                <h2 className={`text-md lg:text-3xl font-black italic tracking-tighter uppercase ${activeTab === 'daily' ? 'text-secondary-600 dark:text-secondary-400' :
                  activeTab === 'weekly' ? 'text-purple-600 dark:text-purple-400' :
                    'text-secondary-600 dark:text-primary-500'
                  }`}>
                  {activeTab} Played Users
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm font-medium">
                  Analysis of {activeTab} user participation and performance.
                </p>
              </div>

              {/* Competition Type Selector */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 capitalize ${activeTab === type
                      ? activeTab === 'daily' ? 'bg-secondary-600 text-white shadow-lg' :
                        activeTab === 'weekly' ? 'bg-purple-600 text-white shadow-lg' :
                          'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                {activeTab === 'daily' && (
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

                {activeTab === 'weekly' && (
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

                {activeTab === 'monthly' && (
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

                {/* View Toggles */}
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <FaTh size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <FaList size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <FaTable size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-secondary-200 dark:border-secondary-600">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-2xl text-secondary-600" />
                  <div>
                    <div className="text-sm text-secondary-700 dark:text-secondary-400">Total Users</div>
                    <div className="text-md lg:text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                      {pagination.total}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-600">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-2xl text-green-600" />
                  <div>
                    <div className="text-sm text-green-700 dark:text-green-400">Selected {activeTab === 'daily' ? 'Date' : activeTab === 'weekly' ? 'Week' : 'Month'}</div>
                    <div className="text-md lg:text-2xl font-bold text-green-800 dark:text-secondary-200">
                      {selectedMonth || 'All'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-600">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-2xl text-primary-600" />
                  <div>
                    <div className="text-sm text-primary-700 dark:text-primary-400">Current Page</div>
                    <div className="text-md lg:text-2xl font-bold text-primary-800 dark:text-primary-200">
                      {pagination.page} / {pagination.totalPages}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="lg" color="blue" message="" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Data Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedMonth
                    ? `No data found for ${selectedMonth}. Try selecting a different ${activeTab === 'daily' ? 'date' : activeTab === 'weekly' ? 'week' : 'month'}.`
                    : `No data found. Check if data has been saved for previous ${activeTab === 'daily' ? 'days' : activeTab === 'weekly' ? 'weeks' : 'months'}.`
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                    {sortedUsers.map((user, index) => {
                      const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                      return (
                        <div key={user._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                          <div className="bg-gradient-to-r from-secondary-500 to-indigo-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm opacity-90">#{serialNumber}</div>
                                <div className="text-sm lg:text-lg font-bold">{user.name || 'N/A'}</div>
                                {user.email && (
                                  <div className="text-sm opacity-80">{user.email}</div>
                                )}
                              </div>
                              <FaUsers className="text-2xl opacity-80" />
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="text-gray-900 dark:text-white font-medium truncate ml-2">{user.email || 'N/A'}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{user.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {activeTab === 'daily' ? 'Date' : activeTab === 'weekly' ? 'Week' : 'Month'}:
                                </span>
                                <span className="text-gray-900 dark:text-white font-medium">{user.monthYear}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Level:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {user.monthlyProgress?.currentLevel || user.level?.currentLevel || 0} - {user.monthlyProgress?.levelName || user.level?.levelName || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subscription:</span>
                                <span className="text-gray-900 dark:text-white font-medium capitalize">
                                  {user.subscriptionStatus || 'free'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">Total Quizzes</div>
                                <div className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                  {user?.monthlyProgress?.totalQuizAttempts || 0}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">High Scores</div>
                                <div className="text-sm lg:text-lg font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                  <FaTrophy className="text-sm" />
                                  {user?.monthlyProgress?.highScoreWins || 0}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
                                <div className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                  {user.monthlyProgress?.accuracy || 0}%
                                </div>
                              </div>
                              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
                                <div className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                  {user.getScore} / {user.totalScore}
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleViewUserDetails(user.originalUserId)}
                              variant="admin"
                              size="small"
                              fullWidth
                              icon={<FaEye className="text-sm" />}
                              className="mt-3"
                            >
                              View Scores
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {sortedUsers.map((user, index) => {
                      const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                      return (
                        <div key={user._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                          <div className="p-2 md:p-4 lg:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-secondary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                  {serialNumber}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                      {user.name || 'N/A'}
                                    </h3>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{user.email || 'N/A'}</div>

                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Quizzes</div>
                                  <div className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                    {user?.monthlyProgress?.totalQuizAttempts || 0}
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">High Scores</div>
                                  <div className="text-sm lg:text-lg font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                    <FaTrophy className="text-sm" />
                                    {user?.monthlyProgress?.highScoreWins || 0}
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accuracy</div>
                                  <div className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                    {user.monthlyProgress?.accuracy || 0}%
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Score</div>
                                  <div className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                    {user.getScore} / {user.totalScore}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleViewUserDetails(user.originalUserId)}
                                  variant="admin"
                                  size="small"
                                  icon={<FaEye className="text-sm" />}
                                >
                                  View Scores
                                </Button>
                                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                  {user.monthYear} • Level {user.monthlyProgress?.currentLevel || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              S.No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {activeTab === 'daily' ? 'Date' : activeTab === 'weekly' ? 'Week' : 'Month'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Subscription
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => handleSort('totalQuizzes')}
                            >
                              <div className="flex items-center gap-2">
                                Total Played Quizzes
                                {getSortIcon('totalQuizzes')}
                              </div>
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => handleSort('highScoreQuiz')}
                            >
                              <div className="flex items-center gap-2">
                                High Score Quiz
                                {getSortIcon('highScoreQuiz')}
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Accuracy
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {sortedUsers.map((user, index) => {
                            const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                            return (
                              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                  {serialNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name || 'N/A'}
                                  </div>
                                  {user.userName && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      @{user.userName}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {user.email || 'N/A'}
                                  </div>
                                  {user.phone && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {user.phone}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                                    {user.monthYear}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.savedAt ? new Date(user.savedAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {user.monthlyProgress?.currentLevel || 0} - {user.monthlyProgress?.levelName || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                    {user.subscriptionStatus || 'free'}
                                  </div>
                                  {user.subscriptionExpiry && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {(() => {
                                        const date = new Date(user.subscriptionExpiry);
                                        const day = date.getDate().toString().padStart(2, '0');
                                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                        const year = date.getFullYear();
                                        return `${day}/${month}/${year}`;
                                      })()}
                                    </div>
                                  )}
                                  {!user.subscriptionExpiry && user.subscriptionStatus && user.subscriptionStatus !== 'free' && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      No expiry date
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {(user?.monthlyProgress?.totalQuizAttempts || 0)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    quizzes
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <FaTrophy className="text-green-600 dark:text-green-400" />
                                    <div>
                                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {(user?.monthlyProgress?.highScoreWins || 0)}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        high scores
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.monthlyProgress?.accuracy || 0}%
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'} accuracy
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.getScore} / {user.totalScore}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Get Score/Total Score
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button
                                    onClick={() => handleViewUserDetails(user.originalUserId)}
                                    variant="admin"
                                    size="small"
                                    icon={<FaEye className="text-sm" />}
                                  >
                                    View Scores
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col lg:flex-row item-start lg:items-center justify-start lg:justify-between mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaChevronLeft className="text-sm" />
                        <span>Previous</span>
                      </button>
                      <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <span>Next</span>
                        <FaChevronRight className="text-sm" />
                      </button>
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

export default AdminPrevMonthPlayedUsers;

