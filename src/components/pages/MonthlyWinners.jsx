'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../lib/api';
import { toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaCrown, FaCalendarAlt, FaUsers, FaRupeeSign, FaTh, FaList, FaTable } from 'react-icons/fa';
// MobileAppWrapper import removed
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import { isMobile } from 'react-device-detect';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../datepicker-custom.css";
import dayjs from 'dayjs';

const MonthlyWinners = () => {
  const [monthlyWinners, setMonthlyWinners] = useState([]);
  const [activeType, setActiveType] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [monthlyWinnersLoading, setMonthlyWinnersLoading] = useState(true);
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table'); // 'grid', 'list', 'table'
  const [selectedDate, setSelectedDate] = useState(() => dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = dayjs().subtract(1, 'week');
    const oneJan = dayjs(d).startOf('year');
    const numberOfDays = d.diff(oneJan, 'day');
    const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
    return `${d.format('YYYY')}-W${weekNum}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return dayjs().subtract(1, 'month').format('YYYY-MM');
  });

  // Check if user is logged in and get current user info
  const currentUserId = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem("userInfo") || 'null')?._id) : undefined;

  const fetchMonthlyWinners = useCallback(async () => {
    try {
      setMonthlyWinnersLoading(true);
      const filters = {};
      if (activeType === 'daily' && selectedDate) filters.date = selectedDate;
      if (activeType === 'weekly' && selectedWeek) filters.week = selectedWeek;
      if (activeType === 'monthly' && selectedMonth) filters.date = selectedMonth;

      // Consistent with MonthlyWinnersDisplay.jsx on Home Page
      // Use getRecentMonthlyWinners for historical/previous winners data
      const response = await API.getRecentMonthlyWinners(12, null, activeType, filters);

      if (response && response.success) {
        let transformedWinnersData = [];

        // Handle different data structures for monthly vs daily/weekly
        if (activeType === 'monthly') {
          // monthly returns an array of month objects: [{ _id, winners: [], totalPrizePool, ... }]
          transformedWinnersData = (response.data || []).map(monthData => ({
            ...monthData,
            winners: (monthData.winners || []).map((u, idx) => {
              const uId = u.studentId || u.userId || u._id || idx;
              return {
                ...u,
                rank: u.rank || idx + 1,
                userId: {
                  _id: uId,
                  name: u.studentName || u.name || u.userName || 'Unknown',
                  profilePicture: u.profilePicture,
                  email: u.studentEmail || u.email
                }
              };
            })
          }));
        } else {
          // daily/weekly returns flat array of winner objects
          transformedWinnersData = [{
            winners: (response.data || []).map((u, idx) => {
              const uId = u.studentId || u.userId || u._id || idx;
              return {
                ...u,
                rank: u.rank || idx + 1,
                userId: {
                  _id: uId,
                  name: u.studentName || u.name || u.userName || 'Unknown',
                  profilePicture: u.profilePicture,
                  email: u.studentEmail || u.email
                }
              };
            }),
            totalPrizePool: response.totalPrizePool || 0,
            monthYear: activeType.toUpperCase() + (activeType === 'daily' ? ` (${selectedDate})` : ` (${selectedWeek})`),
            totalWinners: response.data?.length || 0,
            resetDate: activeType === 'daily' ? selectedDate : new Date()
          }];
        }

        setMonthlyWinners(transformedWinnersData);
      } else {
        setMonthlyWinners([]);
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast.error('Failed to fetch winners');
      setMonthlyWinners([]);
    } finally {
      setMonthlyWinnersLoading(false);
    }
  }, [selectedDate, selectedWeek, selectedMonth, activeType]);

  useEffect(() => {
    fetchMonthlyWinners();
  }, [fetchMonthlyWinners]);

  // Auto-fetch when year, month, or showAllMonths changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMonthlyWinners();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [selectedDate, selectedWeek, selectedMonth, activeType]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="container mx-auto px-0 lg:px-6 xl:px-8">
          {/* Header */}
          {/* Competition Type Selector (Tabs Outside) */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'daily', label: 'Daily', color: 'from-secondary-600 to-cyan-500' },
              { id: 'weekly', label: 'Weekly', color: 'from-purple-600 to-indigo-500' },
              { id: 'monthly', label: 'Monthly', color: 'from-primary-600 to-primary-500' }
            ].map((tab) => {
              const isActive = activeType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveType(tab.id)}
                  className={`flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label} Winners
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header Content */}
            <div className={`p-4 lg:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r ${activeType === 'daily' ? 'from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20' : activeType === 'weekly' ? 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20' : 'from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-inner ${activeType === 'daily' ? 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-600' : activeType === 'weekly' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600' : 'bg-primary-500 dark:bg-primary-900/50 text-secondary-600'}`}>
                    <FaTrophy className="text-2xl lg:text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white capitalize">
                      Winners
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
                      Celebrating our top-performing students from the previous seasons.
                    </p>
                  </div>
                </div>

                {/* View Toggles Integrated into Header */}
                <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-gray-900/50 rounded-xl p-1 w-fit border border-gray-200 dark:border-gray-700">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-secondary-600 dark:text-secondary-400 shadow-md' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800'}`} title="Grid View"><FaTh /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-secondary-600 dark:text-secondary-400 shadow-md' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800'}`} title="List View"><FaList /></button>
                  <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 text-secondary-600 dark:text-secondary-400 shadow-md' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800'}`} title="Table View"><FaTable /></button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {activeType === 'daily' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Select Day</label>
                    <div className="relative group">
                      <DatePicker
                        selected={new Date(selectedDate)}
                        onChange={(date) => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date()}
                        className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-secondary-500 dark:focus:border-secondary-500 outline-none shadow-sm transition-all w-full"
                      />
                    </div>
                  </div>
                )}
                {activeType === 'weekly' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Select Month & Week</label>
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
                          const firstDay = dayjs(date).startOf('month');
                          const oneJan = dayjs(date).startOf('year');
                          const numberOfDays = firstDay.diff(oneJan, 'day');
                          const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                          setSelectedWeek(`${dayjs(date).format('YYYY')}-W${weekNum}`);
                        }}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-500 outline-none shadow-sm transition-all w-32"
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((w) => {
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
                              className={`flex justify-center items-center px-3 py-2 rounded-xl text-xs font-black transition-all ${isActive
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-500 hover:border-purple-300'
                                }`}
                            >
                              {w}{w === 1 ? 'st' : w === 2 ? 'nd' : w === 3 ? 'rd' : 'th'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {activeType === 'monthly' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Select Month</label>
                    <div className="relative group">
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
                        className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-primary-500 dark:focus:border-primary-500 outline-none shadow-sm transition-all w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-end ml-auto">
                  <button
                    onClick={() => {
                      if (activeType === 'daily') setSelectedDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
                      if (activeType === 'monthly') setSelectedMonth(dayjs().subtract(1, 'month').format('YYYY-MM'));
                      if (activeType === 'weekly') {
                        const d = dayjs().subtract(1, 'week');
                        const oneJan = dayjs(d).startOf('year');
                        const numberOfDays = d.diff(oneJan, 'day');
                        const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                        setSelectedWeek(`${d.format('YYYY')}-W${weekNum}`);
                      }
                    }}
                    className="text-xs font-black text-secondary-500 hover:text-secondary-600 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-all"
                  >
                    <span className="text-sm">↺</span> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-8">

              {/* Content */}
              {monthlyWinnersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loading size="lg" color="yellow" message="" />
                </div>
              ) : monthlyWinners.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏆</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 underline capitalize">
                    No {activeType} Winners Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No winners found for this period. Try changing the filters above.
                  </p>
                </div>
              ) : (
                <>
                  {/* Monthly Winners Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-primary-200 dark:border-primary-600">
                      <div className="flex items-center gap-3">
                        <FaTrophy className="text-2xl text-primary-600" />
                        <div>
                          <div className="text-sm text-primary-700 dark:text-primary-400 capitalize">Total {activeType === 'monthly' ? 'Months' : activeType === 'weekly' ? 'Weeks' : 'Days'}</div>
                          <div className="text-md lg:text-2xl font-bold text-primary-800 dark:text-primary-200">{monthlyWinners.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-secondary-200 dark:border-secondary-600">
                      <div className="flex items-center gap-3">
                        <FaUsers className="text-2xl text-secondary-600" />
                        <div>
                          <div className="text-sm text-secondary-700 dark:text-secondary-400">Total Winners</div>
                          <div className="text-md lg:text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                            {monthlyWinners.reduce((total, month) => total + (month.totalWinners || 0), 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-600">
                      <div className="flex items-center gap-3">
                        <FaRupeeSign className="text-2xl text-green-600" />
                        <div>
                          <div className="text-sm text-green-700 dark:text-green-400">Total Distributed</div>
                          <div className="text-md lg:text-2xl font-bold text-green-800 dark:text-green-200">
                            ₹{monthlyWinners.reduce((total, month) => total + (month.totalPrizePool || 0), 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-600">
                      <div className="flex items-center gap-3">
                        <FaMedal className="text-2xl text-primary-600" />
                        <div>
                          <div className="text-sm text-primary-700 dark:text-primary-400 capitalize">Avg Winners/{activeType === 'monthly' ? 'Month' : activeType === 'weekly' ? 'Week' : 'Day'}</div>
                          <div className="text-md lg:text-2xl font-bold text-primary-800 dark:text-primary-200">
                            {monthlyWinners.length > 0 ? (monthlyWinners.reduce((total, month) => total + (month.totalWinners || 0), 0) / monthlyWinners.length).toFixed(1) : 0}
                          </div>
                        </div>
                      </div>
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
                                      <div className="font-medium text-gray-900 dark:text-white">{winner?.userId?.name || winner?.userName || winner?.username}</div>
                                      {winner?.userId?.email && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{winner.userId.email}</div>
                                      )}
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
                                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{winner?.userId?.name || winner?.userName || winner?.username}</div>
                                      {winner?.userId?.email && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{winner.userId.email}</div>
                                      )}
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
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Monthly Winners Table View */}
                  {viewMode === 'table' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-gradient-to-r from-secondary-500 to-indigo-600 p-4 text-white">
                        <div className="flex items-center gap-3">
                          <FaTrophy className="text-2xl" />
                          <h3 className="text-xl font-bold">All Winners Table</h3>
                        </div>
                        <p className="text-sm opacity-90 mt-1">Complete list of all monthly winners with detailed information</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                S.No.
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Rank
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Winner
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Period
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Performance
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Prize
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {monthlyWinners.map((monthData, monthIndex) =>
                              monthData.winners?.map((winner, winnerIndex) => (
                                <tr key={`${monthData._id}-${winner._id || winnerIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {(() => {
                                      let serialNumber = 1;
                                      for (let i = 0; i < monthIndex; i++) {
                                        serialNumber += monthlyWinners[i].winners?.length || 0;
                                      }
                                      return serialNumber + winnerIndex;
                                    })()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${winner.rank === 1 ? 'bg-primary-500' :
                                        winner.rank === 2 ? 'bg-gray-400' : 'bg-primary-600'
                                        }`}>
                                        {winner.rank === 1 ? <FaCrown /> : winner.rank === 2 ? <FaMedal /> : <FaMedal />}
                                      </div>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        #{winner.rank}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {winner?.userId?.name || winner?.userName || winner?.username}
                                      </div>
                                      {winner?.userId?.email && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {winner.userId.email}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                                      {monthData.monthYear || (activeType === 'daily' ? new Date(monthData.resetDate).toLocaleDateString() : `Week ${monthData.weekNumber || ''}`)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {activeType === 'monthly' ? new Date(monthData.resetDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric'
                                      }) : `Reset: ${new Date(monthData.resetDate).toLocaleDateString()}`}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      <span className="font-medium">{winner.highScoreWins}</span> wins
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      <span className="font-medium">{winner.accuracy}%</span> accuracy
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                      ₹{winner.rewardAmount?.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Prize Amount
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {(() => {
                                        const date = new Date(monthData.resetDate);
                                        const day = date.getDate().toString().padStart(2, '0');
                                        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                                        const month = monthNames[date.getMonth()];
                                        const year = date.getFullYear();
                                        return `${day}-${month}-${year}`;
                                      })()}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(monthData.resetDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
      </div>
      <UnifiedFooter />
    </>
  );
};

export default MonthlyWinners;

