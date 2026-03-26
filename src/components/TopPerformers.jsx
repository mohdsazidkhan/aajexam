'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaTable, FaList, FaTh } from 'react-icons/fa';
import Link from 'next/link';
import { useGlobalError } from '../contexts/GlobalErrorContext';
import { useTokenValidation } from '../hooks/useTokenValidation';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import Loading from './Loading';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import dayjs from 'dayjs';

const TopPerformers = () => {
  const [viewMode, setViewMode] = useState(() => {
    // Set default view based on screen size
    return window.innerWidth < 768 ? "list" : "table";
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = dayjs();
    const oneJan = dayjs(d).startOf('year');
    const numberOfDays = d.diff(oneJan, 'day');
    const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
    return `${d.format('YYYY')}-W${weekNum}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format('YYYY-MM'));
  const [allPeriodRanks, setAllPeriodRanks] = useState({ daily: '-', weekly: '-', monthly: '-' });
  const [ranksLoading, setRanksLoading] = useState(false);

  // Global error context
  const { checkRateLimitError } = useGlobalError();

  // Token validation
  const { validateTokenBeforeRequest } = useTokenValidation();

  // Check if user is logged in and get current user info
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem("token");
  const currentUserId = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem("userInfo") || 'null')?._id) : undefined;

  // Helper to sort leaders consistently (Score > HighScores > Accuracy)
  const sortLeaders = useCallback((list) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const statsA = a.stats || a.dailyProgress || a.weeklyProgress || a.monthlyProgress || a.level || a.monthly || {};
      const statsB = b.stats || b.dailyProgress || b.weeklyProgress || b.monthlyProgress || b.level || b.monthly || {};

      const getScore = (u, s) => s.totalScore || u.totalScore || 0;
      const getHS = (u, s) => s.highScoreWins || s.highScoreQuizzes || u.highScoreWins || u.highScoreQuizzes || 0;
      const getAcc = (u, s) => s.accuracy || u.accuracy || 0;

      const scoreDiff = getScore(b, statsB) - getScore(a, statsA);
      if (scoreDiff !== 0) return scoreDiff;

      const hsDiff = getHS(b, statsB) - getHS(a, statsA);
      if (hsDiff !== 0) return hsDiff;

      return getAcc(b, statsB) - getAcc(a, statsA);
    });
  }, []);

  const fetchTopPerformers = useCallback(async (isRefresh = false) => {
    // Validate token before making API call
    if (!validateTokenBeforeRequest()) {
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters = {};
      if (activeTab === 'daily' && selectedDate) filters.date = selectedDate;
      if (activeTab === 'weekly' && selectedWeek) filters.week = selectedWeek;
      if (activeTab === 'monthly' && selectedMonth) filters.date = selectedMonth;

      // Use the public competition leaderboard endpoint for all types
      // Pass userId so the backend can return the user's specific position
      let result = await API.getPublicCompetitionLeaderboard(activeTab, 1, 10, { userId: currentUserId, ...filters });

      if (result.success) {
        let transformed = [];
        let monthLabel = '';
        let surroundingUsers = [];
        let currentUser = null;

        // Unified response handling
        const leaderboardData = result.leaderboard || result.data?.top || result.data || [];
        monthLabel = result.month || result.data?.month || activeTab.toUpperCase();

        const rawLeaders = Array.isArray(leaderboardData) ? leaderboardData : [];
        const sortedLeaders = sortLeaders(rawLeaders);

        transformed = sortedLeaders.map((u, idx) => {
          // Robust stats detection: pick the first available non-empty progress/stats object
          const stats = u.stats || u.dailyProgress || u.weeklyProgress || u.monthlyProgress || u.monthly || u.level || {};
          const uId = u.studentId || u.userId || u._id || idx;
          const uName = u.studentName || u.name || u.userName || 'Unknown';

          return {
            userId: uId,
            name: uName,
            position: u.rank || idx + 1,
            isCurrentUser: String(uId) === String(currentUserId),
            profilePicture: u.profilePicture,
            subscriptionName: u.subscriptionStatus?.toUpperCase() || u.subscriptionName || 'FREE',
            level: {
              currentLevel: u.currentLevel !== undefined ? u.currentLevel : (stats.currentLevel || 0),
              levelName: u.levelName || stats.levelName || getLevelName(u.currentLevel || stats.currentLevel || 0),
              highScoreQuizzes: stats.highScoreWins || stats.highScoreQuizzes || 0,
              quizzesPlayed: stats.totalQuizAttempts || stats.quizzesPlayed || 0,
              accuracy: stats.accuracy || 0,
              averageScore: stats.averageScore || stats.accuracy || 0,
              totalCorrectAnswers: stats.totalCorrectAnswers || u.totalCorrectAnswers || 0,
              totalScore: stats.totalScore || u.totalScore || 0
            }
          };
        });

        surroundingUsers = Array.isArray(result.surroundingUsers || result.data?.surroundingUsers)
          ? (result.surroundingUsers || result.data.surroundingUsers)
          : [];

        currentUser = result.currentUser || result.data?.currentUser;

        // Transform surrounding users with same flexible logic
        const transformedSurroundingUsers = surroundingUsers.map((u, idx) => {
          const stats = u.stats || u.dailyProgress || u.weeklyProgress || u.monthlyProgress || u.level || u.monthly || {};
          const uId = u.userId || u.studentId || idx;
          const uName = u.name || u.studentName || 'Unknown';

          return {
            userId: uId,
            name: uName,
            position: u.position || u.rank,
            isCurrentUser: u.isCurrentUser || String(uId) === String(currentUserId),
            subscriptionName: u.subscriptionName || u.subscriptionStatus?.toUpperCase() || 'FREE',
            level: {
              currentLevel: u.currentLevel !== undefined ? u.currentLevel : (stats.currentLevel || 0),
              levelName: u.levelName || stats.levelName || getLevelName(u.currentLevel || stats.currentLevel || 0),
              highScoreQuizzes: stats.highScoreQuizzes || stats.highScoreWins || 0,
              quizzesPlayed: stats.quizzesPlayed || stats.totalQuizAttempts || 0,
              accuracy: stats.accuracy || 0,
              averageScore: stats.averageScore || stats.accuracy || 0,
              totalCorrectAnswers: u.totalCorrectAnswers || stats.totalCorrectAnswers || 0,
              totalScore: stats.totalScore || u.totalScore || 0
            }
          };
        });

        // Initialize currentUser rank if missing by searching transformed list
        if (currentUser && currentUserId) {
          const userIdxInTransformed = transformed.findIndex(u => String(u.userId) === String(currentUserId));
          if (userIdxInTransformed !== -1 && !(currentUser.position || currentUser.rank)) {
            const foundUser = transformed[userIdxInTransformed];
            currentUser.position = foundUser.position || (userIdxInTransformed + 1);
            currentUser.rank = foundUser.rank || (userIdxInTransformed + 1);
          }
        }

        setData({
          month: monthLabel,
          topPerformers: transformed,
          surroundingUsers: transformedSurroundingUsers,
          currentUser: currentUser ? {
            userId: currentUser.userId || currentUser.studentId || currentUser._id,
            name: currentUser.name || currentUser.studentName,
            position: currentUser.position || currentUser.rank,
            rank: currentUser.position || currentUser.rank, // Add rank property for consistency
            isCurrentUser: true,
            subscriptionName: currentUser.subscriptionName || currentUser.subscriptionStatus?.toUpperCase() || 'FREE',
            level: {
              currentLevel: currentUser.currentLevel !== undefined ? currentUser.currentLevel : (currentUser.stats?.currentLevel || currentUser.level?.currentLevel || 0),
              levelName: currentUser.levelName || currentUser.stats?.levelName || getLevelName(currentUser.currentLevel || 0),
              highScoreQuizzes: currentUser.stats?.highScoreWins || currentUser.level?.highScoreQuizzes || 0,
              quizzesPlayed: currentUser.stats?.totalQuizAttempts || currentUser.level?.quizzesPlayed || 0,
              accuracy: currentUser.stats?.accuracy || currentUser.level?.accuracy || 0,
              averageScore: currentUser.stats?.accuracy || currentUser.level?.accuracy || 0,
              totalCorrectAnswers: currentUser.stats?.totalCorrectAnswers || currentUser.totalCorrectAnswers || 0,
              totalScore: currentUser.stats?.totalScore || currentUser.totalScore || 0
            }
          } : null,
          total: result.total || result.data?.total || transformed.length
        });
      } else {
        // ... (rest of error handling remains same)
        // Check if it's a rate limit error first
        const errorMessage = result.message || result.error || "Failed to load top performers. Please try again.";

        if (checkRateLimitError(errorMessage)) {
          // Rate limit error is handled globally, just set local error
          setError("Rate limit reached. Please wait or login for higher limits.");
        } else {
          // Show other backend errors
          setError(`Backend Error: ${errorMessage}`);
        }
      }
    } catch (err) {
      console.error("API Error:", err);

      // Check if it's a rate limit error first
      if (err.message && checkRateLimitError(err.message)) {
        // Rate limit error is handled globally, just set local error
        setError("Rate limit reached. Please wait or login for higher limits.");
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Network Error: Unable to connect to server. Please check if the backend is running.");
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError("Failed to load top performers. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId, checkRateLimitError, validateTokenBeforeRequest, activeTab, selectedDate, selectedWeek, selectedMonth]);

  const fetchAllRanks = useCallback(async () => {
    if (!currentUserId || !isLoggedIn) return;

    try {
      setRanksLoading(true);
      // Pass the current selected periods to get the user's rank for those specific periods
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        API.getPublicCompetitionLeaderboard('daily', 1, 2, { date: selectedDate, userId: currentUserId }).catch(() => null),
        API.getPublicCompetitionLeaderboard('weekly', 1, 2, { week: selectedWeek, userId: currentUserId }).catch(() => null),
        API.getPublicCompetitionLeaderboard('monthly', 1, 2, { month: selectedMonth, userId: currentUserId }).catch(() => null)
      ]);

      const getRank = (res) => {
        if (!res) return '-';

        // Apply sorting to handle ties accurately
        const rawLeaders = res.data || res.leaders || [];
        const sortedLeaders = sortLeaders(rawLeaders);

        // 1. Check metadata currentUser
        const metaUser = res?.currentUser || res?.data?.currentUser || res?.user || res?.data?.user;
        let rank = metaUser?.position || metaUser?.rank || res?.userRank || res?.data?.userRank || res?.rank || res?.data?.rank;

        // 2. Fallback: Search for the user in the sorted list to determine their position
        if (Array.isArray(sortedLeaders)) {
          const userIdx = sortedLeaders.findIndex(l => {
            const lId = l.userId || l.studentId || l._id;
            return String(lId) === String(currentUserId);
          });

          if (userIdx !== -1) {
            const userInList = sortedLeaders[userIdx];
            rank = userInList.position || userInList.rank || (userIdx + 1);
          }
        }

        return rank ? `#${rank}` : '-';
      };

      setAllPeriodRanks({
        daily: getRank(dailyRes),
        weekly: getRank(weeklyRes),
        monthly: getRank(monthlyRes)
      });
    } catch (err) {
      console.error("Error fetching all ranks:", err);
    } finally {
      setRanksLoading(false);
    }
  }, [currentUserId, isLoggedIn, selectedDate, selectedWeek, selectedMonth]);

  // Helper function to get level names
  const getLevelName = (level) => {
    const levelNames = {
      0: 'Starter', 1: 'Rookie', 2: 'Explorer', 3: 'Thinker', 4: 'Strategist', 5: 'Achiever',
      6: 'Mastermind', 7: 'Champion', 8: 'Prodigy', 9: 'Wizard', 10: 'Legend'
    };
    return levelNames[level] || 'Unknown';
  };

  useEffect(() => {
    fetchTopPerformers();
    if (isLoggedIn) {
      fetchAllRanks();
    }

    // Auto-refresh every 5 minutes to keep data current
    const interval = setInterval(() => {
      fetchTopPerformers();
      if (isLoggedIn) fetchAllRanks();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchTopPerformers, fetchAllRanks, activeTab, isLoggedIn]);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && viewMode === "table") {
        setViewMode("list");
      } else if (!isMobile && viewMode === "list") {
        setViewMode("table");
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const getSortedTopPerformers = () => {
    if (!data?.topPerformers) return [];
    const performers = [...data.topPerformers];
    return performers.sort((a, b) => {
      // Use the transformed data structure (level properties contain monthly data)
      const aHighScore = a.level?.highScoreQuizzes || 0;
      const bHighScore = b.level?.highScoreQuizzes || 0;
      const aAccuracy = a.level?.accuracy || 0;
      const bAccuracy = b.level?.accuracy || 0;
      const aTotalQuizzes = a.level?.quizzesPlayed || 0;
      const bTotalQuizzes = b.level?.quizzesPlayed || 0;

      // First priority: High Score Wins (descending) - same as Performance Analytics
      if (aHighScore !== bHighScore) {
        return bHighScore - aHighScore;
      }

      // Second priority: Accuracy (descending) - same as Performance Analytics
      if (aAccuracy !== bAccuracy) {
        return bAccuracy - aAccuracy;
      }

      // Third priority: Total quizzes played (descending) - same as Performance Analytics
      return bTotalQuizzes - aTotalQuizzes;
    });
  };

  const getCurrentMonthDisplay = () => {
    if (activeTab === 'daily') return selectedDate || 'Today';
    if (activeTab === 'weekly') return selectedWeek || 'This Week';

    const monthValue = selectedMonth || data?.month;
    if (monthValue && monthValue.includes('-')) {
      const [year, month] = monthValue.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    // Fallback to current month if no data available
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  // Logged-out state UI
  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">🏆 Top Performers</h3>
        </div>
        <div className="text-center py-10">
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">Login to View Your Rank</p>
          <Link
            href="/login"
            className="inline-flex bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-xs sm:text-lg md:text-base"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="text-red-500 dark:text-red-400 text-lg mb-4">
            ⚠️ {error}
          </div>
          <div className="text-sm text-primary-600 dark:text-red-300 mb-4">
            This could be due to:
            <ul className="list-disc list-inside mt-2 text-left">
              <li>Backend server not running</li>
              <li>Network connectivity issues</li>
              <li>Rate limiting from backend</li>
              <li>Backend service errors</li>
            </ul>
          </div>
          <button
            onClick={() => fetchTopPerformers(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const topPerformers = getSortedTopPerformers();

  return (
    <>
      {/* Type Selector Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'daily', label: 'Daily', color: 'from-secondary-600 to-cyan-500' },
          { id: 'weekly', label: 'Weekly', color: 'from-purple-600 to-indigo-500' },
          { id: 'monthly', label: 'Monthly', color: 'from-primary-600 to-primary-500' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isActive
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label} Top Performers
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 min-h-[400px] flex flex-col">
        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
          {activeTab === 'daily' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Date</label>
              <DatePicker
                selected={(() => {
                  try {
                    return new Date(selectedDate);
                  } catch (e) { }
                  return new Date();
                })()}
                onChange={(date) => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-500 outline-none w-full"
              />
            </div>
          )}
          {activeTab === 'weekly' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Month & Week</label>
              <div className="flex flex-row gap-2 items-center">
                <DatePicker
                  selected={(() => {
                    try {
                      const [y, m] = selectedMonth.split('-').map(Number);
                      if (y && m) return new Date(y, m - 1, 1);
                    } catch (e) { }
                    return new Date();
                  })()}
                  onChange={(date) => {
                    const newMonth = dayjs(date).format('YYYY-MM');
                    setSelectedMonth(newMonth);
                    // Automatically pick 1st week of this month
                    const firstDay = dayjs(date).startOf('month');
                    const oneJan = dayjs(date).startOf('year');
                    const numberOfDays = firstDay.diff(oneJan, 'day');
                    const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                    setSelectedWeek(`${dayjs(date).format('YYYY')}-W${weekNum}`);
                  }}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none w-32"
                />
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((w) => {
                    // Calculate week number for this specific week of the month
                    const [y, m] = selectedMonth.split('-').map(Number);
                    const dayInWeek = new Date(y, m - 1, (w - 1) * 7 + 1);
                    const oneJan = new Date(dayInWeek.getFullYear(), 0, 1);
                    const numberOfDays = Math.floor((dayInWeek - oneJan) / (24 * 60 * 60 * 1000));
                    const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
                    const weekVal = `${y}-W${weekNum}`;
                    const isActive = selectedWeek === weekVal;

                    return (
                      <button
                        key={w}
                        onClick={() => setSelectedWeek(weekVal)}
                        className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all ${isActive
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                          }`}
                      >
                        {w}{w === 1 ? 'st' : w === 2 ? 'nd' : w === 3 ? 'rd' : 'th'} Week
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'monthly' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Month</label>
              <DatePicker
                selected={(() => {
                  try {
                    const [y, m] = selectedMonth.split('-').map(Number);
                    if (y && m) return new Date(y, m - 1, 1);
                  } catch (e) { }
                  return new Date();
                })()}
                onChange={(date) => setSelectedMonth(dayjs(date).format('YYYY-MM'))}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                maxDate={new Date()}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full"
              />
            </div>
          )}
          <div className="flex items-end flex-1 justify-end">
            <button
              onClick={() => {
                if (activeTab === 'daily') setSelectedDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
                if (activeTab === 'monthly') setSelectedMonth(dayjs().subtract(1, 'month').format('YYYY-MM'));
                if (activeTab === 'weekly') {
                  const d = dayjs().subtract(1, 'week');
                  const oneJan = dayjs(d).startOf('year');
                  const numberOfDays = d.diff(oneJan, 'day');
                  const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                  setSelectedWeek(`${d.format('YYYY')}-W${weekNum}`);
                }
              }}
              className="text-secondary-600 dark:text-secondary-400 text-sm font-bold hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                🏆 Top Performers - {getCurrentMonthDisplay()}
              </h3>
              <Loading size="lg" color="blue" message={`Loading leaderboard...`} />
            </div>
          </div>
        ) : !topPerformers.length ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              No top performers data available for {getCurrentMonthDisplay()}.
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
              <div className='mb-4 lg:mb-0 text-center lg:text-left'>
                <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  🏆 Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} Performers - {getCurrentMonthDisplay()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Top performers based on high scores, accuracy
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Last updated at: {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                  ✅ Showing real-time {getCurrentMonthDisplay()} data <br /> Auto-refreshes every 5 minutes
                </p>
              </div>

              {/* View Toggle Buttons and Refresh */}
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTopPerformers(true)}
                  disabled={refreshing}
                  className={`p-2 rounded-lg transition-all duration-200 ${refreshing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                    } text-white shadow-lg`}
                  title={refreshing ? "Refreshing..." : "Refresh Data"}
                >
                  {refreshing ? '⏳' : '🔄'}
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "table"
                    ? "bg-secondary-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  title="Table View"
                >
                  <FaTable />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list"
                    ? "bg-secondary-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  title="List View"
                >
                  <FaList />
                </button>
              </div>
            </div>


            {/* Current User Position Section */}
            {
              data?.currentUser && (
                <div className="my-4 lg:my-8 p-3 lg:p-6 bg-gradient-to-r from-red-50 to-primary-50 dark:from-red-900/20 dark:to-primary-900/20 rounded-xl border-2 border-red-200 dark:border-primary-600">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                      <h4 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        🎯 Your Current Position
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Based on your highest performance across all periods</p>
                    </div>

                    {/* Triple Rank Display */}
                    <div className="flex flex-wrap gap-2 lg:gap-4 w-full lg:w-auto">
                      {[
                        { label: 'Daily', rank: allPeriodRanks.daily, color: 'from-secondary-500 to-cyan-500' },
                        { label: 'Weekly', rank: allPeriodRanks.weekly, color: 'from-purple-500 to-indigo-500' },
                        { label: 'Monthly', rank: allPeriodRanks.monthly, color: 'from-primary-500 to-primary-500' }
                      ].map((item) => (
                        <div key={item.label} className="flex-1 lg:flex-none min-w-[80px] bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-3 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                          <div className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                          <div className={`text-sm lg:text-lg font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {ranksLoading ? '...' : item.rank}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 lg:p-4 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg lg:text-2xl shadow-lg shrink-0">
                          {data.currentUser.rank || data.currentUser.position}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h5 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                              {data.currentUser.name}
                            </h5>
                            <div className={`subscription-name-badge ${data.currentUser.subscriptionName === "PRO"
                              ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                              : "bg-gradient-to-r from-green-400 to-teal-500"
                              } scale-90`}>
                              {data.currentUser.subscriptionName || "FREE"}
                            </div>
                          </div>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                            Level {data.currentUser.level.currentLevel} - {data.currentUser.level.levelName}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-around lg:justify-end gap-4 lg:gap-8 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 mt-3 lg:mt-0 border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400">
                            {data.currentUser.level.highScoreQuizzes}
                          </div>
                          <div className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">High Scores</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                            {data.currentUser.level.quizzesPlayed}
                          </div>
                          <div className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">Played</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                            {data.currentUser.level.accuracy}%
                          </div>
                          <div className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">Accuracy</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            {/* Refreshing Indicator */}
            {
              refreshing && (
                <div className="mb-4 p-3 bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-700 rounded-lg flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary-500"></div>
                  <span className="text-secondary-600 dark:text-secondary-400 text-sm">Refreshing {getCurrentMonthDisplay()} data...</span>
                </div>
              )
            }

            {/* Table View */}
            {
              viewMode === "table" && (
                <div className="overflow-x-auto border-2 border-secondary-300 dark:border-indigo-500 rounded-2xl p-3 lg:p-6 bg-gradient-to-r from-secondary-900/10 to-indigo-900/10">
                  <h4 className="text-md lg:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🎯 Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} Performers - Table View
                  </h4>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20">
                        <th className="py-4 px-4 text-left text-secondary-800 dark:text-secondary-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🏆</span>
                            Rank
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-secondary-800 dark:text-secondary-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">👤</span>
                            Student
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-secondary-800 dark:text-secondary-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📈</span>
                            Level
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-secondary-800 dark:text-secondary-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📚</span>
                            Quizzes
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-secondary-800 dark:text-secondary-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            High Scores
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-primary-800 dark:text-primary-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            Accuracy
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-emerald-800 dark:text-emerald-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            Total Correct
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-emerald-800 dark:text-emerald-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💯</span>
                            Total Score
                          </div>
                        </th>

                      </tr>
                    </thead>
                    <tbody>
                      {topPerformers.map((p, i) => (
                        <tr
                          key={i}
                          className={`border-b transition-all duration-200 border-gray-200 hover:shadow-lg group ${p.userId === currentUserId
                            ? "bg-gradient-to-r from-red-100 to-primary-100 dark:from-red-800 dark:to-primary-900 border-red-400 dark:border-primary-600 shadow-lg" :
                            i === 0 ? "bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/10 dark:to-primary-900/10" :
                              i === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10" :
                                i === 2 ? "bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/10 dark:to-amber-900/10" :
                                  "hover:bg-gradient-to-r hover:from-secondary-50 hover:to-indigo-50 dark:hover:from-secondary-900/10 dark:hover:to-indigo-900/10"
                            }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full  flex items-center justify-center text-white font-bold text-lg shadow-lg ${p.userId === currentUserId ? "bg-gradient-to-r from-red-500 to-primary-500 ring-4 ring-red-300 dark:ring-primary-400" :
                                i === 0 ? "bg-gradient-to-r from-primary-400 to-primary-500" :
                                  i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500" :
                                    i === 2 ? "bg-gradient-to-r from-primary-400 to-amber-500" :
                                      "bg-gradient-to-r from-secondary-400 to-indigo-500"
                                }`}>
                                {p.userId === currentUserId ? "👤" : i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                              </div>
                              {p.userId === currentUserId ? (
                                <div className="text-xs font-medium text-red-800 dark:text-primary-200">
                                  You
                                </div>
                              ) : i < 3 && (
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {i === 0 ? "1st Place" : i === 1 ? "2nd Place" : "3rd Place"}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                                <span className="text-xl text-secondary-600 dark:text-secondary-400">
                                  {p.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>

                              <div>
                                <div className="font-bold text-gray-900 dark:text-white text-md lg:text-lg">
                                  {p.name || "Unknown"}
                                </div>
                                <div className={`subscription-name-badge ${p.subscriptionName === "PRO"
                                  ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                                  : "bg-gradient-to-r from-green-400 to-teal-500"
                                  }`}>
                                  {p.subscriptionName || "FREE"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-sm">📈</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {p.level?.levelName || "No Level"}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Level {p.level?.currentLevel || 0}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-secondary-600 dark:text-secondary-400 text-sm">📚</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {p.level?.quizzesPlayed || 0}
                                </span>
                                {(p.level?.quizzesPlayed || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-200">
                                    📚
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-primary-600 dark:text-primary-400 text-sm">⭐</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {p.level?.highScoreQuizzes || 0}
                                </span>
                                {(p.level?.highScoreQuizzes || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                    🏆
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-primary-600 dark:text-primary-400 text-sm">🎯</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-lg ${(p.level?.accuracy || 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                                  (p.level?.accuracy || 0) >= 70 ? 'text-secondary-600 dark:text-secondary-400' :
                                    (p.level?.accuracy || 0) >= 60 ? 'text-primary-600 dark:text-primary-400' :
                                      'text-primary-600 dark:text-red-400'
                                  }`}>
                                  {p.level?.accuracy || 0}%
                                </span>
                                {(p.level?.accuracy || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-primary-800 dark:bg-purple-900/30 dark:text-primary-200">
                                    🎯
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-emerald-600 dark:text-emerald-400 text-sm">✅</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {p.level?.totalCorrectAnswers || 0}
                                </span>
                                {(p.level?.totalCorrectAnswers || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                                    ✅
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-emerald-600 dark:text-emerald-400 text-sm">💯</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {p.level?.totalScore || 0}
                                </span>
                                {(p.level?.totalScore || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                                    💯
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }

            {/* List View */}
            {
              viewMode === "list" && (
                <div className="space-y-4 p-0 lg:p-6 bg-gradient-to-r from-secondary-50/50 to-indigo-50/50 dark:from-secondary-900/10 dark:to-indigo-900/10">
                  <h4 className="text-md lg:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🎯 Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} Performers - List View
                  </h4>
                  {topPerformers.map((p, i) => (
                    <div
                      key={i}
                      className={`p-2 lg:p-4 rounded-lg border dark:border-gray-600 transition-all duration-200 ${p.userId === currentUserId
                        ? "bg-gradient-to-r from-red-100 to-primary-100 dark:from-red-800 dark:to-primary-900 border-red-400 dark:border-primary-600 shadow-lg" :
                        i === 0
                          ? "bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 border-primary-200 dark:border-primary-600 shadow-lg"
                          : i === 1
                            ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-green-900/20 dark:to-green-900/20 border-green-200 dark:border-green-600 shadow-md"
                            : i === 2
                              ? "bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20 border-primary-200 dark:border-primary-600 shadow-md"
                              : "bg-gray-50 dark:bg-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full  flex items-center justify-center text-white font-bold text-lg shadow-lg ${p.userId === currentUserId ? "bg-gradient-to-r from-red-500 to-primary-500 ring-4 ring-red-300 dark:ring-primary-400" :
                          i === 0 ? "bg-gradient-to-r from-primary-400 to-primary-500" :
                            i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500" :
                              i === 2 ? "bg-gradient-to-r from-primary-400 to-amber-500" :
                                "bg-gradient-to-r from-secondary-400 to-indigo-500"
                          }`}>
                          {p.userId === currentUserId ? "👤" : i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {p.name || "Unknown"}

                            {p.userId === currentUserId && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100">
                                You
                              </span>
                            )}
                          </p>
                          <div className={`subscription-name-badge ${p.subscriptionName === "PRO"
                            ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                            : "bg-gradient-to-r from-green-400 to-teal-500"
                            }`}>
                            {p.subscriptionName || "FREE"}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {p.level?.levelName || "No Level"}
                          </p>

                        </div>

                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {/* High Score Badge */}
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-1 lg:p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-green-800 dark:text-green-200">
                              {p.level?.highScoreQuizzes || 0}
                            </div>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              🏆 High Scores
                            </div>
                          </div>
                        </div>

                        {/* Total Quizzes Badge */}
                        <div className="bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 p-1 lg:p-3 rounded-lg border border-secondary-200 dark:border-secondary-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                              {p.level?.quizzesPlayed || 0}
                            </div>
                            <div className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                              📚 Total Quizzes
                            </div>
                          </div>
                        </div>

                        {/* Accuracy Badge */}
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-1 lg:p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-center">
                            <div className={`text-md lg:text-2xl font-bold ${(p.level?.accuracy || 0) >= 80 ? 'text-green-800 dark:text-green-200' :
                              (p.level?.accuracy || 0) >= 70 ? 'text-secondary-800 dark:text-secondary-200' :
                                (p.level?.accuracy || 0) >= 60 ? 'text-primary-800 dark:text-primary-200' :
                                  'text-red-800 dark:text-red-200'
                              }`}>
                              {p.level?.accuracy || 0}%
                            </div>
                            <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              🎯 Accuracy
                            </div>
                          </div>
                        </div>

                        {/* Level Badge */}
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-1 lg:p-3 rounded-lg border border-purple-200 dark:border-pink-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-primary-800 dark:text-primary-200">
                              {p.level?.currentLevel || 0}
                            </div>
                            <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              📈 Level
                            </div>
                          </div>
                        </div>

                        {/* Total Correct Answers Badge */}
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-1 lg:p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                              {p.level?.totalCorrectAnswers || 0}
                            </div>
                            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              ✅ Correct
                            </div>
                          </div>
                        </div>
                        {/* Total Score */}
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-1 lg:p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                              {p.level?.totalScore || 0}
                            </div>
                            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              💯 Total Score
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            {/* Grid View */}
            {
              viewMode === "grid" && (
                <div className='space-y-4 border-2 border-secondary-300 dark:border-indigo-500 rounded-2xl p-3 lg:p-6 bg-gradient-to-r from-secondary-50/50 to-indigo-50/50 dark:from-secondary-900/10 dark:to-indigo-900/10'>
                  <h4 className="text-md lg:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🎯 Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} Performers - Grid View
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6 xl-gap-8 mb-2 md:mb-4 lg:mb-6 xl:mb-8">

                    {topPerformers?.map((p, i) => (
                      <div
                        key={i}
                        className={`p-2 lg:p-4 rounded-lg border dark:border-gray-600 hover:shadow-lg transition-all duration-200 ${p.userId === currentUserId
                          ? "bg-gradient-to-r from-red-100 to-primary-100 dark:from-red-800 dark:to-primary-900 border-red-400 dark:border-primary-600 shadow-lg" :
                          i === 0
                            ? "bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 border-primary-200 dark:border-primary-600 shadow-lg"
                            : i === 1
                              ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-600 shadow-md"
                              : i === 2
                                ? "bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20 border-primary-200 dark:border-primary-600 shadow-md"
                                : "bg-gray-50 dark:bg-gray-700"
                          }`}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full  flex items-center justify-center text-white font-bold text-lg shadow-lg ${p.userId === currentUserId ? "bg-gradient-to-r from-red-500 to-primary-500 ring-4 ring-red-300 dark:ring-primary-400" :
                            i === 0 ? "bg-gradient-to-r from-primary-400 to-primary-500" :
                              i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500" :
                                i === 2 ? "bg-gradient-to-r from-primary-400 to-amber-500" :
                                  "bg-gradient-to-r from-secondary-400 to-indigo-500"
                            }`}>
                            {p.userId === currentUserId ? "👤" : i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {p.name || "Unknown"}
                              {p.userId === currentUserId && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100">
                                  You
                                </span>
                              )}
                            </p>
                            <div className={`subscription-name-badge ${p.subscriptionName === "PRO"
                              ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                              : "bg-gradient-to-r from-green-400 to-teal-500"
                              }`}>
                              {p.subscriptionName || "FREE"}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {p.level?.levelName || "No Level"}
                            </p>
                          </div>
                        </div>

                        {/* High Score Badge */}
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-lg mb-3 border border-green-200 dark:border-green-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-green-800 dark:text-green-200">
                              {p.level?.highScoreQuizzes || 0}
                            </div>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              🏆 High Score Quizzes
                            </div>
                          </div>
                        </div>

                        {/* Total Quizzes Badge */}
                        <div className="bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 p-3 rounded-lg mb-3 border border-secondary-200 dark:border-secondary-700">
                          <div className="text-center">
                            <div className="textxl lg:text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                              {p.level?.quizzesPlayed || 0}
                            </div>
                            <div className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                              📚 Total Quizzes
                            </div>
                          </div>
                        </div>

                        {/* Level Badge */}
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-3 rounded-lg mb-3 border border-purple-200 dark:border-pink-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-primary-800 dark:text-primary-200">
                              {p.level?.currentLevel || 0}
                            </div>
                            <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              📈 Level
                            </div>
                          </div>
                        </div>

                        {/* Accuracy Badge */}
                        <div className="bg-gradient-to-r from-primary-100 to-amber-100 dark:from-primary-900/30 dark:to-amber-900/30 p-3 rounded-lg mb-3 border border-primary-200 dark:border-amber-700">
                          <div className="text-center">
                            <div className={`text-md lg:text-2xl font-bold ${(p.level?.accuracy || 0) >= 80 ? 'text-green-800 dark:text-green-200' :
                              (p.level?.accuracy || 0) >= 70 ? 'text-secondary-800 dark:text-secondary-200' :
                                (p.level?.accuracy || 0) >= 60 ? 'text-primary-800 dark:text-primary-200' :
                                  'text-red-800 dark:text-red-200'
                              }`}>
                              {p.level?.accuracy || 0}%
                            </div>
                            <div className="text-sm font-medium text-primary-600 dark:text-secondary-400">
                              🎯 Accuracy
                            </div>
                          </div>
                        </div>

                        {/* Total Correct Answers Badge */}
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-3 rounded-lg mb-3 border border-emerald-200 dark:border-emerald-700">
                          <div className="text-center">
                            <div className="text-md lg:text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                              {p.level?.totalCorrectAnswers || 0} out of {p.level?.totalScore || 0}
                            </div>
                            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              ✅ Total Correct
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }


            {/* Surrounding Users Section */}
            {
              data?.surroundingUsers && data.surroundingUsers.length > 0 && topPerformers.some(p => p.userId === currentUserId) && (
                <div className="mt-8 mb-8">
                  <h4 className="text-md lg:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🔍 Your Competition Zone
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.surroundingUsers.map((user, index) => (
                      <div
                        key={user.userId}
                        className={`p-2 lg:p-4 rounded-lg border transition-all duration-200 ${user.isCurrentUser
                          ? "bg-gradient-to-r from-red-100 to-primary-100 dark:from-red-800 dark:to-primary-900 border-red-400 dark:border-primary-600 shadow-lg"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-md"
                          }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full  flex items-center justify-center text-white font-bold text-lg ${user.isCurrentUser
                            ? "bg-gradient-to-r from-red-500 to-primary-500"
                            : "bg-gradient-to-r from-secondary-500 to-indigo-500"
                            }`}>
                            {user.isCurrentUser ? "👤" : user.position}
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-900 dark:text-white">
                              {user.name}
                              {user.isCurrentUser && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100">
                                  You
                                </span>
                              )}
                            </h6>
                            <div className={`subscription-name-badge ${user.subscriptionName === "PRO"
                              ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                              : "bg-gradient-to-r from-green-400 to-teal-500"
                              }`}>
                              {user.subscriptionName || "FREE"}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Level {user.monthlyProgress?.currentLevel} - {user.monthlyProgress?.levelName}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-center bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {user.monthlyProgress.highScoreQuizzes}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">High Scores</div>
                          </div>
                          <div className="text-center bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="font-bold text-secondary-600 dark:text-secondary-400">
                              {user.monthlyProgress?.totalQuizAttempts}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Quizzes</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            {/* Extended Competition Zone - When current user is not in top performers */}
            {
              data?.surroundingUsers && data.surroundingUsers.length > 0 && !topPerformers.some(p => p.userId === currentUserId) && (
                <div className="mt-12 p-3 md:p-6lg:p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-300 dark:border-pink-500 shadow-xl relative">

                  <div className="text-center mb-8">
                    <h4 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                      🎯 Your Competition Zone
                    </h4>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                      You're not in the top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} yet, but here's your current position and nearby competitors to help you climb up!
                    </p>
                  </div>

                  {/* Current User Highlight */}
                  {data.currentUser && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-red-100 to-primary-100 dark:from-red-800 dark:to-primary-900 rounded-xl border-2 border-red-300 dark:border-primary-500 shadow-lg">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-4xl shadow-lg">
                          #{data.currentUser.position}
                        </div>
                        <div className="text-center md:text-left">
                          <h5 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            {data.currentUser.name}
                          </h5>
                          <div className={`subscription-name-badge ${data.currentUser.subscriptionName === "PRO"
                            ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                            : "bg-gradient-to-r from-green-400 to-teal-500"
                            }`}>
                            {data.currentUser.subscriptionName || "FREE"}
                          </div>
                          <p className="text-xl text-gray-700 dark:text-gray-200 mb-4">
                            Level {data.currentUser.level.currentLevel} - {data.currentUser.level.levelName}
                          </p>
                          <div className="flex gap-6 justify-center md:justify-start">
                            <div className="text-center">
                              <div className="text-md lg:text-2xl font-bold text-green-600 dark:text-green-400">
                                {data.currentUser.level.highScoreQuizzes}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">High Scores</div>
                            </div>
                            <div className="text-center">
                              <div className="text-md lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                                {data.currentUser.level.quizzesPlayed}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Total Quizzes</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Surrounding Users Grid */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                      🔍 Nearby Competitors
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                      {data.surroundingUsers.map((user, index) => (
                        <div
                          key={user.userId}
                          className={`p-5 rounded-xl border-2 transition-all duration-200 ${user.isCurrentUser
                            ? "bg-gradient-to-r from-red-100 to-primary-100 dark:from-red-800 dark:to-primary-900 border-red-400 dark:border-primary-600 shadow-lg transform scale-105"
                            : "bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-600 hover:shadow-lg hover:scale-105"
                            }`}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${user.isCurrentUser
                              ? "bg-gradient-to-r from-red-500 to-primary-500"
                              : "bg-gradient-to-r from-purple-500 to-pink-500"
                              }`}>
                              {user.isCurrentUser ? "👤" : user.position}
                            </div>
                            <div>
                              <h6 className="font-bold text-gray-900 dark:text-white text-lg">
                                {user.name}
                                {user.isCurrentUser && (
                                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100">
                                    You
                                  </span>
                                )}
                              </h6>
                              <div className={`subscription-name-badge ${data.currentUser.subscriptionName === "PRO"
                                ? "bg-gradient-to-r from-primary-400 to-secondary-500"
                                : "bg-gradient-to-r from-green-400 to-teal-500"
                                }`}>
                                {data.currentUser.subscriptionName || "FREE"}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300">
                                Level {user.monthlyProgress?.currentLevel} - {user.monthlyProgress?.levelName}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                                {user.monthlyProgress.highScoreQuizzes}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">High Scores</div>
                            </div>
                            <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="font-bold text-secondary-600 dark:text-secondary-400 text-lg">
                                {user.monthlyProgress?.totalQuizAttempts}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Quizzes</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


                </div>
              )}
          </>
        )}
      </div>
    </>
  );
};

export default TopPerformers;


