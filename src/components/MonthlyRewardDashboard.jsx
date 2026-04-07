'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Users,
  TrendingUp,
  Target,
  Zap,
  Award,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  PieChart,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import { useTokenValidation } from '../hooks/useTokenValidation';
import Loading from './Loading';

const MonthlyRewardDashboard = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [data, setData] = useState({
    leaderboard: [],
    prizepool: null,
    userProgress: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { checkAuthStatus } = useTokenValidation();

  const fetchCompetitionData = async (type) => {
    try {
      setLoading(true);
      if (!(await checkAuthStatus())) {
        setError('Authorization Required: Please log in to view rewards data.');
        return;
      }

      const limit = activeTab === 'daily' ? (config.QUIZ_CONFIG.DAILY_WINNER_COUNT || 1) :
        activeTab === 'weekly' ? (config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT || 3) :
          (config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT || 5);

      const [leaderboardRes, prizeRes, profileRes] = await Promise.all([
        API.getCompetitionLeaderboard(type, 1, limit),
        API.getPrizePools(),
        API.getProfile()
      ]);

      if (leaderboardRes.success && prizeRes.success && profileRes.success) {
        setData({
          leaderboard: leaderboardRes.leaderboard,
          prizepool: prizeRes.prizepools[type],
          userProgress: profileRes.user[`${type}Progress`],
          activeProUsers: prizeRes.activeProUsers
        });
      } else {
        setError('DATA_ERROR: Could not retrieve reward details.');
      }
    } catch (err) {
      console.error('Error fetching competition data:', err);
      setError(err.message || 'CONNECTION_ERROR: Connection lost.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitionData(activeTab);
  }, [activeTab, checkAuthStatus]);

  const getRankStyles = (rank) => {
    if (rank === 1) return {
      bg: 'bg-primary-50 dark:bg-primary-900/10',
      border: 'border-primary-500 shadow-duo-primary',
      text: 'text-primary-700 dark:text-primary-500 dark:text-primary-400',
      icon: <Crown className="w-6 h-6 text-primary-700 dark:text-primary-500 fill-current" />
    };
    if (rank === 2) return {
      bg: 'bg-slate-50 dark:bg-slate-800/50',
      border: 'border-slate-400 shadow-duo-secondary',
      text: 'text-slate-600 dark:text-slate-300',
      icon: <Medal className="w-6 h-6 text-slate-600 dark:text-slate-400 fill-current" />
    };
    if (rank === 3) return {
      bg: 'bg-primary-50 dark:bg-amber-900/10',
      border: 'border-amber-500 shadow-duo-accent',
      text: 'text-primary-700 dark:text-primary-500 dark:text-amber-400',
      icon: <Award className="w-6 h-6 text-amber-500 fill-current" />
    };
    return {
      bg: 'bg-background-surface',
      border: 'border-border-secondary shadow-duo',
      text: 'text-content-primary',
      icon: <Star className="w-5 h-5 text-content-muted" />
    };
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Activity, color: 'secondary' },
    { id: 'weekly', label: 'Weekly', icon: Zap, color: 'purple' },
    { id: 'monthly', label: 'Monthly', icon: Trophy, color: 'primary' },
  ];

  const requirements = {
    daily: { quizzes: config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT, acc: config.QUIZ_CONFIG.DAILY_MINIMUM_ACCURACY || 70 },
    weekly: { quizzes: config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT, acc: config.QUIZ_CONFIG.WEEKLY_MINIMUM_ACCURACY || 70 },
    monthly: { quizzes: config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT, acc: config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY || 70 },
  };

  return (
    <div className="space-y-10 font-outfit">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1.5 bg-background-page rounded-[1.8rem] border-2 border-border-primary shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${isActive
                  ? `bg-background-surface text-${tab.color === 'primary' ? 'primary' : tab.color === 'secondary' ? 'secondary' : 'purple'}-600 shadow-duo border-b-4 border-border-secondary`
                  : 'text-content-secondary hover:text-content-primary'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-10"
        >
          {error && (
            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* Eligibility Status */}
          {data.userProgress && (
            <div className={`bg-background-surface rounded-[2.5rem] p-4 mlgp-8 border-2 border-b-10 transition-all overflow-hidden relative ${data.userProgress.rewardEligible
              ? 'border-emerald-500 shadow-duo-secondary'
              : 'border-border-secondary shadow-duo'
              }`}>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner border-2 ${data.userProgress.rewardEligible ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100' : 'bg-background-page border-border-secondary'}`}>
                    <Trophy className={`w-10 h-10 ${data.userProgress.rewardEligible ? 'text-emerald-500 animate-bounce' : 'text-content-muted'}`} />
                  </div>
                  <div className="space-y-1 text-center lg:text-left">
                    <p className="text-[10px] font-black text-content-secondary uppercase tracking-[0.4em]">Your Status</p>
                    <h2 className="text-xl lg:text-xl lg:text-3xl font-black text-content-primary uppercase tracking-tighter">
                      {data.userProgress.rewardEligible ? 'Reward Eligible!' : 'Keep learning to qualify!'}
                    </h2>
                    <p className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest">
                      Challenge: {activeTab.toUpperCase()} REWARDS
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                  {[
                    { label: 'Quizzes Won', value: `${data.userProgress.highScoreWins} / ${requirements[activeTab].quizzes}`, icon: CheckCircle2, color: 'primary' },
                    { label: 'Accuracy', value: `${data.userProgress.accuracy}% / ${requirements[activeTab].acc}%`, icon: Target, color: 'secondary' },
                    { label: 'Total Points', value: data.userProgress.totalScore, icon: TrendingUp, color: 'purple' },
                    { label: 'My Rank', value: `#${data.userProgress.rewardRank || '?'}`, icon: Crown, color: 'primary' }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-background-page rounded-2xl border-2 border-border-primary shadow-sm text-center min-w-[120px]">
                      <p className="text-[8px] font-black text-content-secondary uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={`text-lg font-black font-outfit text-${stat.color === 'primary' ? 'primary' : stat.color === 'secondary' ? 'secondary' : 'purple'}-500`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar background item */}
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (data.userProgress.highScoreWins / requirements[activeTab].quizzes) * 100)}%` }} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Current Rankings */}
            <div className="lg:col-span-2 bg-background-surface rounded-[2.5rem] p-5 lg:p-10 border-2 border-b-10 border-border-primary shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-content-secondary uppercase tracking-[0.4em]">Leaderboard</p>
                  <h2 className="text-xl lg:text-xl lg:text-3xl font-black text-content-primary uppercase tracking-tighter flex items-center gap-4">
                    <Users className="w-8 h-8 text-primary-700 dark:text-primary-500" />
                    Active Students
                  </h2>
                </div>
                <div className="px-6 py-2 bg-emerald-500 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-duo-secondary">
                  Pool: ₹{data.prizepool?.total || 0}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-content-secondary">Loading Winners...</p>
                </div>
              ) : data.leaderboard.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-background-page rounded-[2rem] flex items-center justify-center mx-auto border-2 border-border-primary">
                    <Star className="w-8 h-8 text-content-muted" />
                  </div>
                  <p className="text-sm font-black text-content-secondary uppercase tracking-widest">No students have reached this level yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.leaderboard.map((user, idx) => {
                    const style = getRankStyles(user.rank);
                    return (
                      <motion.div
                        key={user.studentId}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group flex items-center justify-between p-6 rounded-[2rem] border-2 border-b-6 transition-all hover:translate-x-2 ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-background-surface flex items-center justify-center border-2 border-border-secondary shadow-sm relative overflow-hidden">
                              {style.icon}
                            </div>
                            <span className={`text-xl lg:text-2xl font-black font-outfit ${style.text}`}>#{user.rank}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-content-primary uppercase tracking-tight">{user.studentName}</h3>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-content-secondary uppercase">{user.stats.highScoreWins} WINS</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="w-3 h-3 text-primary-700 dark:text-primary-500" />
                                <span className="text-[9px] font-black text-content-secondary uppercase">{user.stats.accuracy}% ACCURACY</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[20px] font-black font-outfit text-emerald-500">
                            ₹{data.prizepool?.distribution?.find(d => d.rank === user.rank)?.amount || 0}
                          </p>
                          <p className="text-[8px] font-black text-content-muted uppercase tracking-widest">Est. Reward</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-10">
              {/* Prize Distribution Grid */}
              <div className="bg-background-surface rounded-[2.5rem] p-4 mlgp-8 border-2 border-b-10 border-border-primary shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-duo-secondary">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm lg:text-xl font-black text-content-primary uppercase tracking-tight">Prize Distribution</h2>
                </div>
                <div className="space-y-3">
                  {data.prizepool?.distribution?.map((reward) => {
                    const style = getRankStyles(reward.rank);
                    return (
                      <div key={reward.rank} className={`p-4 rounded-2xl border-2 border-b-4 flex items-center justify-between transition-all ${style.bg} ${style.border}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-background-surface flex items-center justify-center border border-border-secondary text-[10px] font-black text-content-secondary">
                            #{reward.rank}
                          </div>
                          <p className="text-[10px] font-black text-content-primary uppercase tracking-widest">{reward.percentage}%</p>
                        </div>
                        <p className="text-lg font-black text-emerald-500 font-outfit">₹{reward.amount}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ranking Criteria */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 text-white border-2 border-b-10 border-primary-700 shadow-2xl space-y-6 overflow-hidden relative">
                <TrendingUp className="absolute -top-10 -right-10 w-40 h-40 text-white/5 pointer-events-none" />
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10">
                  <Info className="w-6 h-6" />
                  Ranking Rules
                </h3>
                <div className="space-y-4 relative z-10">
                  {[
                    { rank: '1ST', label: 'Quiz Wins', sub: 'Total High-Score Victories' },
                    { rank: '2ND', label: 'Accuracy', sub: 'Correct Answer Percentage' },
                    { rank: '3RD', label: 'Total Points', sub: 'Aggregate Score' },
                    { rank: '4TH', label: 'Consistency', sub: 'Total Quiz Attempts' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <span className="w-10 text-[10px] font-black text-primary-300 tracking-widest">{item.rank}</span>
                      <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                        <p className="text-[8px] font-bold text-primary-200/60 uppercase tracking-widest mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MonthlyRewardDashboard;



