'use client';

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  Zap,
  Flame,
  Award,
  TrendingUp,
  ChevronRight,
  Clock,
  CircleCheck,
  CircleAlert,
  Coins,
  Gift,
  Search,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "react-hot-toast";

import config from '../lib/config/appConfig';
import API from "../lib/api";
import MonthlyRewardsInfo from "./MonthlyRewardsInfo";
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
import Skeleton from './Skeleton';

const RewardsDashboard = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [totalPrizePool, setTotalPrizePool] = useState(0);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const [profile, rewardInfo] = await Promise.all([
        API.getProfile(),
        API.getMonthlyRewardInfo().catch(() => null)
      ]);

      if (rewardInfo?.success) {
        setTotalPrizePool(rewardInfo.data?.totalPrizePool || 0);
      }

      const dailyWins = profile?.user?.dailyProgress?.highScoreWins || 0;
      const weeklyWins = profile?.user?.weeklyProgress?.highScoreWins || 0;
      const monthlyWins = profile?.user?.monthlyProgress?.highScoreWins || 0;

      const dailyReq = config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT || 5;
      const weeklyReq = config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT || 20;
      const monthlyReq = config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 50;

      setRewards({
        claimableRewards: profile?.user?.claimableRewards || 0,
        daily: { current: dailyWins, required: dailyReq, percentage: Math.min(100, (dailyWins / dailyReq) * 100) },
        weekly: { current: weeklyWins, required: weeklyReq, percentage: Math.min(100, (weeklyWins / weeklyReq) * 100) },
        monthly: { current: monthlyWins, required: monthlyReq, percentage: Math.min(100, (monthlyWins / monthlyReq) * 100) },
        unlocked: profile?.user?.unlockedRewards || [],
        claimed: profile?.user?.claimedRewards || []
      });
    } catch (error) {
      toast.error("Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRewards(); }, []);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      const res = await API.claimRewards();
      if (res.success) {
        toast.success("Rewards claimed successfully!");
        fetchRewards();
      }
    } catch (e) {
      toast.error("Claim failed");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return (
    <div className="space-y-8 py-10 px-4 mx-auto">
      <Skeleton height="120px" borderRadius="2rem" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton height="300px" borderRadius="1.5rem" />
        <Skeleton height="300px" borderRadius="1.5rem" />
        <Skeleton height="300px" borderRadius="1.5rem" />
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in px-0 lg:px-4 lg:px-10 mx-auto font-outfit mt-4 mt-4">

      {/* --- Rewards Hub --- */}
      <section className="relative group">
        <div className="absolute inset-0 bg-primary-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <Card className="bg-white dark:bg-slate-800/50 border-2 border-b-8 border-slate-200 dark:border-slate-800 p-10 overflow-hidden relative rounded-[3rem] transform transition-all duration-500 hover:-translate-y-1 shadow-xl group-hover:border-primary-500/30">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-primary-500 text-white rounded-[2rem] flex items-center justify-center shadow-duo-primary relative overflow-hidden group-hover:rotate-6 transition-transform">
                <Coins className="w-12 h-12 relative z-10" />
                <motion.div
                  animate={{ y: [0, -40, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-white/20 blur-xl"
                />
              </div>
              <div className="text-center lg:text-left space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-none mb-2 mt-4">MY REWARDS</p>
                <h2 className="text-xl lg:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none font-outfit">
                  ₹{rewards.claimableRewards.toLocaleString()}
                </h2>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-primary-700 dark:text-primary-500 pt-2">
                  <CircleCheck className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ready to Claim!</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              <Button
                variant="primary"
                size="lg"
                className={`flex-1 lg:px-16 py-8 rounded-3xl text-sm font-black tracking-widest transform transition-all active:scale-95 ${rewards.claimableRewards > 0 ? 'animate-pulse' : 'opacity-40 grayscale pointer-events-none'}`}
                onClick={handleClaim}
                disabled={claiming || rewards.claimableRewards <= 0}
              >
                {claiming ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    CLAIMING...
                  </div>
                ) : 'CLAIM REWARDS'}
              </Button>
              <Button
                variant="ghost"
                className="border-2 border-b-6 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-10 py-8 rounded-3xl text-sm font-black hover:text-primary-700 dark:text-primary-500 hover:border-primary-500/20 transition-all shadow-sm"
              >
                HISTORY
              </Button>
            </div>
          </div>
          <Sparkles className="absolute -top-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
        </Card>
      </section>

      {/* --- My Progress Section --- */}
      <section className="space-y-12">
        <div className="flex flex-col lg:flex-row items-baseline justify-between gap-6 px-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em]">My Progress</p>
            <h3 className="text-2xl lg:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Active <span className="text-primary-700 dark:text-primary-500">Goals</span></h3>
          </div>
          <div className="flex items-center gap-4 bg-slate-900 dark:bg-slate-950 border-2 border-b-6 border-black text-white px-8 py-4 rounded-[2rem] shadow-xl">
            <div className="p-2 bg-primary-500/20 rounded-xl text-primary-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total Prize Pool</p>
              <span className="text-xl font-black uppercase tracking-tighter text-white font-outfit">₹{totalPrizePool.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { id: 'daily', title: 'Daily Goal', icon: Flame, color: 'emerald', data: rewards.daily, req: `Level ${config.QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED}+`, badge: 'STREAK' },
            { id: 'weekly', title: 'Weekly Goal', icon: Zap, color: 'secondary', data: rewards.weekly, req: `Level ${config.QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED}+`, badge: 'REGULAR' },
            { id: 'monthly', title: 'Monthly Goal', icon: Award, color: 'primary', data: rewards.monthly, req: `Level ${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}+`, badge: 'LEGEND' }
          ].map((quest, idx) => {
            const accentColor = quest.id === 'daily' ? 'emerald' : quest.id === 'weekly' ? 'secondary' : 'primary';
            return (
              <motion.div key={idx} whileHover={{ y: -8 }} className="group">
                <div className="p-5 lg:p-10 flex flex-col justify-between h-[480px] relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-b-8 border-slate-100 dark:border-slate-700 rounded-[3rem] shadow-sm hover:shadow-xl hover:border-primary-500/20 transition-all">
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center bg-${accentColor}-500/10 text-${accentColor}-500 border-2 border-b-4 border-${accentColor}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                        <quest.icon className="w-10 h-10 fill-current opacity-80" />
                      </div>
                      <span className={`px-5 py-2 bg-${accentColor}-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-duo-${accentColor === 'secondary' ? 'secondary' : accentColor === 'emerald' ? 'emerald' : 'primary'}`}>
                        {quest.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none font-outfit">{quest.title}</h4>
                      <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">{quest.id} cycle</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-none">Goal</p>
                          <p className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{quest.req}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-4xl font-black uppercase tracking-tighter font-outfit ${quest.data.percentage >= 100 ? 'text-primary-700 dark:text-primary-500' : 'text-slate-300 dark:text-slate-700'}`}>
                            {quest.data.current}
                          </span>
                          <span className="text-sm font-black text-slate-200 dark:text-slate-800 mx-1">/</span>
                          <span className="text-sm font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{quest.data.required}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="relative h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden border-b-4 border-black/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${quest.data.percentage}%` }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className={`absolute inset-y-0 left-0 bg-${accentColor}-500 rounded-full`}
                          />
                          <div className="absolute inset-0 bg-white/10 opacity-30 skew-x-[45deg] animate-pulse" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${quest.data.percentage >= 100 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          <p className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                            Status: {quest.data.percentage >= 100 ? 'COMPLETED' : `${100 - Math.round(quest.data.percentage)}% REMAINING`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-8 mt-4 border-t-2 border-slate-50 dark:border-slate-700/50">
                    {quest.data.percentage >= 100 ? (
                      <div className="flex items-center justify-center gap-3 bg-primary-500 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-duo-primary">
                        <CircleCheck className="w-5 h-5 fill-current" /> ALL GOALS MET
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        className={`!bg-slate-600 hover:!bg-slate-700 text-white uppercase tracking-[0.3em] font-black py-6 rounded-2xl border-slate-700 shadow-duo-accent !border-b-6`}
                        onClick={() => window.location.href = '/levels'}
                      >
                        START QUIZ
                      </Button>
                    )}
                  </div>

                  {/* Decorative 3D Watermark Icon */}
                  <quest.icon className="absolute -bottom-16 -right-16 w-64 h-64 text-slate-50 dark:text-slate-700/10 -z-0 rotate-12 transition-transform duration-700 group-hover:rotate-0 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* --- Reward Info Section --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="p-12 bg-slate-900 border-none shadow-2xl rounded-[3.5rem] relative overflow-hidden group">
          <div className="relative z-10 space-y-12">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-[0.5em]">Rules</p>
              <h4 className="text-4xl font-black uppercase tracking-tighter text-white">How it <span className="text-primary-700 dark:text-primary-500">Works</span></h4>
            </div>

            <div className="space-y-8">
              {[
                { icon: Clock, text: "Review Period: It takes up to 7 days to verify and process your rewards." },
                { icon: CircleAlert, text: "Fair Play: Top performers are shared publicly to ensure transparency for everyone." },
                { icon: BookOpen, text: "Verification: You need to verify your bank details to withdraw your rewards." }
              ].map((rule, i) => (
                <div key={i} className="flex gap-8 items-start group/rule">
                  <div className="p-4 bg-white/5 rounded-2x border border-white/5 group-hover/rule:bg-primary-500/20 transition-all">
                    <rule.icon className="w-6 h-6 text-primary-700 dark:text-primary-500" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] leading-loose pt-1">{rule.text}</p>
                </div>
              ))}
            </div>
            <Button
              variant="transparent"
              className="text-primary-700 dark:text-primary-500 hover:text-white p-0 text-[10px] font-black uppercase tracking-[0.4em] w-fit"
            >
              VIEW ALL RULES Ã¢â€ â€™
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </Card>

        <Card className="p-12 border-2 border-b-8 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl flex flex-col justify-center text-center space-y-10 rounded-[3.5rem] relative overflow-hidden group">
          <div className="relative z-10 space-y-10">
            <div className="relative w-fit mx-auto">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 0.95, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-28 h-28 bg-primary-500 text-white rounded-[2rem] flex items-center justify-center shadow-duo-secondary"
              >
                <Gift className="w-14 h-14 fill-current" />
              </motion.div>
              <Sparkles className="absolute -top-6 -right-6 w-10 h-10 text-primary-700 dark:text-primary-500 animate-pulse" />
            </div>

            <div className="space-y-4">
              <h4 className="text-2xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">Daily <span className="text-primary-700 dark:text-primary-500">Bonus</span></h4>
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto">
                The student with the highest accuracy in all categories every 24 hours gets an automatic bonus reward.
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="py-10 rounded-[2rem] text-sm font-black shadow-duo-secondary tracking-[0.3em] font-outfit"
                onClick={() => window.location.href = '/leaderboard'}
              >
                VIEW LEADERBOARD
              </Button>
            </div>
          </div>
          <TrendingUp className="absolute -bottom-16 -right-16 w-80 h-80 text-primary-700 dark:text-primary-500/5 rotate-12 transition-transform group-hover:rotate-0 pointer-events-none" />
        </Card>
      </section>

      <MonthlyRewardsInfo />
    </div>
  );
};

export default RewardsDashboard;


