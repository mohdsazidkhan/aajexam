import React, { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaMedal, FaAward, FaTable, FaList, FaTh, FaCalendarDay, FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import Loading from './Loading';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import dayjs from 'dayjs';

const MonthlyWinnersDisplay = () => {
  const [winnersData, setWinnersData] = useState(null);
  const [activeType, setActiveType] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
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

  useEffect(() => {
    fetchWinners();
    const setDefaultViewMode = () => {
      if (typeof window !== 'undefined') {
        const defaultMode = window.innerWidth >= 768 ? 'table' : 'list';
        setViewMode(defaultMode);
      }
    };
    setDefaultViewMode();
  }, [activeType, selectedDate, selectedWeek, selectedMonth]);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (activeType === 'daily') filters.date = selectedDate;
      if (activeType === 'weekly') filters.week = selectedWeek;
      if (activeType === 'monthly') filters.date = selectedMonth;

      // Consistently use the public getRecentMonthlyWinners endpoint for all types
      const response = await API.getRecentMonthlyWinners(1, null, activeType, filters);

      if (response.success) {
        if (activeType === 'monthly') {
          setWinnersData(response.data[0]);
        } else {
          // Standardize daily/weekly response to match monthly winners structure
          setWinnersData({
            winners: response.data,
            totalPrizePool: response.totalPrizePool || 0,
            monthYear: activeType.toUpperCase(),
            totalWinners: response.data.length
          });
        }
      } else {
        setError('No winners found for this period');
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeType} winners:`, err);
      setError(`Failed to load ${activeType} winners`);
    } finally {
      setLoading(false);
    }
  };

  const getPreviousMonth = () => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = previousMonth.getFullYear();
    const month = String(previousMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const types = [
    { id: 'daily', label: 'Daily', icon: FaCalendarDay, color: 'from-blue-500 to-cyan-500' },
    { id: 'weekly', label: 'Weekly', icon: FaCalendarAlt, color: 'from-purple-500 to-indigo-500' },
    { id: 'monthly', label: 'Monthly', icon: FaCalendarCheck, color: 'from-yellow-500 to-orange-500' }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
        <div className="flex items-center justify-center h-32">
          <Loading size="lg" color="yellow" message="" />
        </div>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FaCrown className="text-yellow-500 text-xl" />;
      case 2: return <FaMedal className="text-gray-400 text-xl" />;
      case 3: return <FaAward className="text-orange-600 text-xl" />;
      default: return <FaTrophy className="text-blue-500 text-xl" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-600 to-yellow-500';
      case 2: return 'from-gray-500 to-gray-400';
      case 3: return 'from-orange-600 to-orange-500';
      default: return 'from-blue-600 to-blue-500';
    }
  };

  const renderWinners = () => {
    if (error || !winnersData || !winnersData.winners || winnersData.winners.length === 0) {
      return (
        <div className="text-center py-12">
          <FaTrophy className="text-gray-300 dark:text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Winners Coming Soon!</h3>
          <p className="text-gray-600 dark:text-gray-400">The competition is currently ongoing. Check back later to see the results!</p>
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Performer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Wins</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {winnersData.winners.map((winner, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 dark:text-white">#{winner.rank || idx + 1}</span>
                      {getRankIcon(winner.rank || idx + 1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{winner.userName}</div>
                    <div className="text-xs text-gray-500">{winner.userEmail?.split('@')[0]}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {winner.highScoreQuizzes || winner.highScoreWins} Quizzes
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-orange-600 dark:text-yellow-500">₹{winner.rewardAmount?.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {winnersData.winners.map((winner, idx) => (
          <div key={idx} className={`bg-gradient-to-r ${getRankColor(winner.rank || idx + 1)} rounded-xl p-4 text-white shadow-lg flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="text-xl font-black">#{winner.rank || idx + 1}</div>
              {getRankIcon(winner.rank || idx + 1)}
              <div>
                <div className="font-bold">{winner.userName}</div>
                <div className="text-xs opacity-80">{winner.highScoreQuizzes || winner.highScoreWins} wins • {winner.accuracy}% acc</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black">₹{winner.rewardAmount?.toLocaleString()}</div>
              <div className="text-[10px] uppercase font-bold opacity-70">Reward</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Type Selector Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {types.map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${isActive
                ? `bg-gradient-to-r ${type.color} text-white shadow-xl scale-105`
                : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon size={16} />
              {type.label} Winners
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-row gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300">
        {activeType === 'daily' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Day</label>
            <div className="relative group">
              <DatePicker
                selected={new Date(selectedDate)}
                onChange={(date) => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-500 outline-none shadow-inner transition-all group-hover:border-gray-200 dark:group-hover:border-gray-700 w-full"
              />
            </div>
          </div>
        )}
        {activeType === 'weekly' && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Month & Week</label>
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
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-500 outline-none shadow-inner transition-all group-hover:border-gray-200 dark:group-hover:border-gray-700 w-32"
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
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:border-purple-300'
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
        {activeType === 'monthly' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Month</label>
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
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-yellow-500 dark:focus:border-yellow-500 outline-none shadow-inner transition-all group-hover:border-gray-200 dark:group-hover:border-gray-700 w-full"
              />
            </div>
          </div>
        )}
        <div className="flex items-end flex-1 justify-end pb-1">
          <button
            onClick={() => {
              if (activeType === 'daily') setSelectedDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
              if (activeType === 'monthly') {
                setSelectedMonth(dayjs().subtract(1, 'month').format('YYYY-MM'));
              }
              if (activeType === 'weekly') {
                const d = dayjs().subtract(1, 'week');
                const oneJan = dayjs(d).startOf('year');
                const numberOfDays = d.diff(oneJan, 'day');
                const weekNum = Math.ceil((numberOfDays + oneJan.day() + 1) / 7);
                setSelectedWeek(`${d.format('YYYY')}-W${weekNum}`);
              }
            }}
            className="text-xs font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <span className="text-sm">↺</span> Reset
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {activeType} Legends
          </h3>

          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600' : 'text-gray-400'}`}
            >
              <FaTable size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600' : 'text-gray-400'}`}
            >
              <FaList size={14} />
            </button>
          </div>
        </div>

        {renderWinners()}

        {winnersData && winnersData.winners?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>{winnersData.monthYear} Season</span>
            <span>Total Pool: ₹{winnersData.totalPrizePool?.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyWinnersDisplay;


