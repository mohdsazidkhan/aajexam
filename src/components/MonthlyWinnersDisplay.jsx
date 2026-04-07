'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Table as TableIcon,
  List,
  Grid,
  Calendar,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        const defaultMode = window.innerWidth >= 1024 ? 'table' : 'list';
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

      const response = await API.getRecentMonthlyWinners(1, null, activeType, filters);

      if (response.success) {
        if (activeType === 'monthly') {
          setWinnersData(response.data[0]);
        } else {
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

  const types = [
    { id: 'daily', label: 'Daily', icon: Clock, color: 'from-primary-400 to-primary-600', glow: 'shadow-duo-secondary', accent: 'secondary' },
    { id: 'weekly', label: 'Weekly', icon: Zap, iconColor: 'text-purple-500', color: 'from-purple-500 to-purple-700', glow: 'shadow-duo-accent', accent: 'purple' },
    { id: 'monthly', label: 'Monthly', icon: Trophy, iconColor: 'text-primary-700 dark:text-primary-500', color: 'from-primary-400 to-primary-600', glow: 'shadow-duo-primary', accent: 'primary' }
  ];

  const getRankStyles = (rank) => {
    if (rank === 1) return {
      bg: 'bg-primary-50 dark:bg-primary-900/10',
      border: 'border-primary-200 dark:border-primary-900/30 shadow-duo-primary',
      icon: <Crown className="w-6 h-6 text-primary-700 dark:text-primary-500 fill-current" />,
      text: 'text-primary-700 dark:text-primary-500 dark:text-primary-400'
    };
    if (rank === 2) return {
      bg: 'bg-slate-50 dark:bg-slate-400/10',
      border: 'border-slate-200 dark:border-slate-400/30 shadow-duo-secondary',
      icon: <Medal className="w-6 h-6 text-slate-600 dark:text-slate-400 fill-current" />,
      text: 'text-slate-600 dark:text-slate-300'
    };
    if (rank === 3) return {
      bg: 'bg-primary-50 dark:bg-amber-900/10',
      border: 'border-amber-200 dark:border-amber-900/30 shadow-duo-accent',
      icon: <Award className="w-6 h-6 text-amber-500 fill-current" />,
      text: 'text-amber-600 dark:text-amber-400'
    };
    return {
      bg: 'bg-background-surface',
      border: 'border-border-secondary shadow-duo',
      icon: <Trophy className="w-5 h-5 text-content-muted" />,
      text: 'text-content-primary'
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-10 font-outfit">

      {/* Unified Control Bar: Single Pill for Filters and Tabs */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-20 lg:bg-background-surface/95 lg:backdrop-blur-xl lg:p-2 lg:rounded-[2.5rem] lg:border-2 lg:border-border-primary lg:shadow-xl">

        {/* Left Side: Filter & Date Selection */}
        <div className="flex items-center lg:justify-start w-full lg:w-auto gap-3 lg:gap-6 pl-4 lg:pl-6 pr-4 order-2 lg:order-1 bg-background-surface/95 backdrop-blur-xl p-4 lg:p-0 rounded-[2.5rem] lg:rounded-none border-2 border-border-primary lg:border-none shadow-xl lg:shadow-none relative z-20 overflow-x-auto no-scrollbar flex-nowrap">
          <div className="flex items-center gap-3 border-r border-border-secondary pr-6 mr-2 flex-shrink-0">
            <Calendar className="w-4 h-4 text-content-muted" />
            <div className="flex flex-col">
              <p className="text-[7px] font-black text-content-muted uppercase tracking-[0.2em] leading-none mb-0.5">Filter</p>
              <p className="text-[9px] font-black text-content-primary uppercase tracking-wider">By:</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-nowrap flex-shrink-0">
            <div className="relative group">
              {activeType === 'daily' && (
                <DatePicker
                  selected={new Date(selectedDate)}
                  onChange={(date) => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
                  maxDate={new Date()}
                  className="bg-background-page border border-border-primary rounded-xl px-4 py-2 font-black text-xs text-content-primary uppercase tracking-widest outline-none w-32 cursor-pointer hover:bg-background-surface transition-colors"
                />
              )}
              {activeType === 'weekly' && (
                <div className="flex items-center gap-4">
                  <DatePicker
                    selected={dayjs(selectedMonth).toDate()}
                    onChange={(date) => setSelectedMonth(dayjs(date).format('YYYY-MM'))}
                    showMonthYearPicker
                    className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest outline-none w-28 cursor-pointer hover:bg-white dark:bg-slate-800/80 transition-colors"
                  />
                  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
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
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedWeek(weekVal);
                          }}
                          className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center transition-all ${isActive ? 'bg-primary-500 text-white shadow-lg scale-105 z-10' : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700'}`}
                        >
                          <span className="text-[10px] font-black leading-none">W{w}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeType === 'monthly' && (
                <DatePicker
                  selected={dayjs(selectedMonth).toDate()}
                  onChange={(date) => setSelectedMonth(dayjs(date).format('YYYY-MM'))}
                  showMonthYearPicker
                  maxDate={new Date()}
                  className="bg-background-page border border-border-primary rounded-xl px-4 py-2 font-black text-xs text-content-primary uppercase tracking-widest outline-none w-36 cursor-pointer hover:bg-background-surface transition-colors"
                />
              )}
            </div>

            <button
              onClick={() => {
                if (activeType === 'daily') setSelectedDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
                if (activeType === 'monthly') setSelectedMonth(dayjs().subtract(1, 'month').format('YYYY-MM'));
              }}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-background-page rounded-xl hover:bg-background-surface transition-all group shadow-sm border border-border-secondary"
            >
              <RotateCcw className="w-4 h-4 text-content-muted group-hover:rotate-[-90deg] transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Right Side: Frequency Tabs */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 relative z-10 w-full lg:w-auto shadow-inner order-1 lg:order-2 overflow-x-auto no-scrollbar flex-nowrap">
          {types.map((type) => {
            const Icon = type.icon;
            const isActive = activeType === type.id;
            const accentColor = type.accent === 'primary' ? 'text-primary-700 dark:text-primary-500' : type.accent === 'secondary' ? 'text-primary-400' : 'text-purple-400';
            return (
              <button
                key={type.id}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveType(type.id);
                }}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-3.5 lg:px-6 py-2.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 relative z-40 ${isActive
                  ? `bg-background-surface ${accentColor} shadow-duo border-2 border-border-secondary active:scale-95 px-5 lg:px-8`
                  : 'text-content-muted hover:text-content-primary'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                <span className={`${isActive ? 'inline' : 'hidden'} lg:inline`}>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-background-surface rounded-[3rem] p-5 lg:p-10 border-2 border-b-10 border-border-primary shadow-2xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

        <div className="flex items-center justify-between mb-0 lg:mb-10 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-content-secondary uppercase tracking-[0.4em]">Top Students</p>
            <h3 className="text-xl lg:text-xl lg:text-3xl font-black text-content-primary uppercase tracking-tighter flex items-center gap-4">
              <Star className="w-8 h-8 text-amber-500 fill-current" />
              {activeType} Winners
            </h3>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-duo text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>
              <TableIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-duo text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Loading Winners...</p>
          </div>
        ) : error || !winnersData || !winnersData.winners || winnersData.winners.length === 0 ? (
          <div className="py-24 text-center space-y-6">
            <div className="w-24 h-24 bg-background-page rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-border-secondary shadow-inner">
              <Trophy className="w-12 h-12 text-content-muted" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm lg:text-xl font-black text-content-primary uppercase tracking-tight">Coming Soon</h4>
              <p className="text-sm font-bold text-content-secondary max-w-sm mx-auto uppercase tracking-widest leading-relaxed">Winners are currently being announced. Check back soon!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4"
            >
              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {winnersData.winners.map((winner, idx) => {
                    const rank = winner.rank || idx + 1;
                    const styles = getRankStyles(rank);
                    return (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className={`p-6 rounded-[2.5rem] border-2 border-b-8 flex items-center justify-between transition-all relative overflow-hidden ${styles.bg} ${styles.border}`}
                      >
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-background-surface flex items-center justify-center border-2 border-border-primary shadow-xl overflow-hidden font-black text-2xl text-content-muted">
                              {winner.userName?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              {styles.icon}
                            </div>
                          </div>
                          <div>
                            <h4 className={`text-xl font-black uppercase tracking-tight ${idx < 3 ? styles.text : 'text-content-primary'}`}>
                              {winner.userName}
                            </h4>
                            <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">
                              {winner.highScoreQuizzes || winner.highScoreWins} HIGH SCORES Ã¢â‚¬Â¢ {winner.accuracy}% ACCURACY
                            </p>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-[8px] font-black text-content-secondary uppercase tracking-widest leading-none mb-1">Reward</p>
                          <p className={`text-xl lg:text-3xl font-black font-outfit tabular-nums ${idx === 0 ? 'text-primary-700 dark:text-primary-500' : 'text-content-primary'}`}>₹{winner.rewardAmount?.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[2.5rem] border-2 border-border-secondary">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background-page border-b-2 border-border-secondary">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-content-secondary"># Rank</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-content-secondary">Student</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-content-secondary text-center">Achievements</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-content-secondary text-right">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-secondary">
                      {winnersData.winners.map((winner, idx) => {
                        const rank = winner.rank || idx + 1;
                        const styles = getRankStyles(rank);
                        return (
                          <motion.tr key={idx} variants={itemVariants} className="hover:bg-background-page transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black font-outfit text-content-primary">#{rank}</span>
                                {styles.icon}
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-background-page flex items-center justify-center font-black text-content-secondary border-2 border-border-primary shadow-sm">
                                  {winner.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-content-primary uppercase tracking-tight">{winner.userName}</p>
                                  <p className="text-[8px] font-black text-content-secondary uppercase tracking-widest">{winner.userEmail?.split('@')[0]}... [ID PROTECTED]</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-6 text-center">
                              <span className="text-[10px] font-black text-content-secondary uppercase tracking-widest">
                                {winner.highScoreQuizzes || winner.highScoreWins} HIGH Ã¢â‚¬Â¢ {winner.accuracy}% ACC
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <span className={`text-xl font-black font-outfit tabular-nums ${idx === 0 ? 'text-primary-700 dark:text-primary-500' : 'text-content-primary'}`}>₹{winner.rewardAmount?.toLocaleString()}</span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {winnersData && winnersData.winners?.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-border-secondary flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-content-muted" />
                    <p className="text-[9px] font-black text-content-secondary uppercase tracking-[0.2em]">Verified {activeType} Cycle: {winnersData.monthYear}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest">Total Rewards:</p>
                    <p className="text-xl font-black text-primary-700 dark:text-primary-500 uppercase tracking-tighter">₹{winnersData.totalPrizePool?.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MonthlyWinnersDisplay;




