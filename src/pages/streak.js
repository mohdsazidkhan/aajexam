'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Calendar, Shield, Snowflake, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import Seo from '../components/Seo';
import { DashboardSkeleton } from '../components/skeletons/PrivateSkeletons';

const StreakPage = () => {
  const [streak, setStreak] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streakRes, lbRes] = await Promise.all([
          API.request('/api/streak'),
          API.request('/api/streak/leaderboard?type=current&limit=20')
        ]);
        if (streakRes?.success) setStreak(streakRes.data);
        if (lbRes?.success) setLeaderboard(lbRes.data || []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const useFreeze = async () => {
    try {
      const res = await API.request('/api/streak/freeze', { method: 'POST' });
      if (res?.success) {
        setStreak(prev => ({ ...prev, freezesAvailable: res.data.freezesAvailable }));
        toast.success('Streak freeze activated!');
      } else { toast.error(res?.message || 'Failed'); }
    } catch (e) { toast.error('Pro subscription required'); }
  };

  if (loading) return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6"><DashboardSkeleton /></div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <Seo title="Your Streak – AajExam" description="Track your daily AajExam streak." noIndex={true} />
      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" /> Your Streak
          </h1>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center space-y-1">
            <Flame className="w-8 h-8 text-orange-500 mx-auto" />
            <p className="text-3xl font-black text-orange-500">{streak?.currentStreak || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Current Streak</p>
          </Card>
          <Card className="p-4 text-center space-y-1">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
            <p className="text-3xl font-black text-yellow-500">{streak?.longestStreak || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Longest Streak</p>
          </Card>
          <Card className="p-4 text-center space-y-1">
            <Calendar className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-3xl font-black text-emerald-500">{streak?.totalActiveDays || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Active Days</p>
          </Card>
          <Card className="p-4 text-center space-y-1">
            <Snowflake className="w-8 h-8 text-blue-500 mx-auto" />
            <p className="text-3xl font-black text-blue-500">{streak?.freezesAvailable || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Freezes Left</p>
          </Card>
        </div>

        {/* Today Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className={`p-6 text-center ${streak?.todayCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-4 ring-emerald-500/20' : 'bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-500/30'}`}>
            {streak?.todayCompleted
              ? <><Shield className="w-10 h-10 text-emerald-500 mx-auto mb-2" /><h2 className="text-lg font-black text-emerald-700 dark:text-emerald-300">Today&apos;s Challenge Complete!</h2></>
              : <><Flame className="w-10 h-10 text-orange-500 mx-auto mb-2 animate-pulse" /><h2 className="text-lg font-black text-orange-700 dark:text-orange-300">Complete Today&apos;s Challenge to Keep Streak!</h2>
                <Link href="/daily-challenge" className="inline-block mt-3 px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30">Go to Challenge</Link></>
            }
          </Card>
        </motion.div>

        {/* Freeze Button */}
        {!streak?.todayCompleted && streak?.freezesAvailable > 0 && (
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Use Streak Freeze</h3>
              <p className="text-[10px] text-slate-400">Skip today without breaking streak (Pro only)</p>
            </div>
            <button onClick={useFreeze} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Snowflake className="w-3 h-3 inline mr-1" /> Use Freeze
            </button>
          </Card>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 lg:p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 relative z-10"><TrendingUp className="w-4 h-4 text-primary-500" /> Streak Leaderboard</h3>
              <motion.div className="space-y-2 relative z-10" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
                {leaderboard.map((entry, i) => (
                  <motion.div key={i} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className={`text-sm font-black w-6 ${i < 3 ? 'text-yellow-500' : 'text-slate-400'}`}>#{i + 1}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">{entry.user?.name || 'Student'}</span>
                    <span className="text-sm font-black text-orange-500 flex items-center gap-1"><Flame className="w-3 h-3" />{entry.currentStreak}</span>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StreakPage;
