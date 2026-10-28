'use client';
import PageHero from '@/components/common/ui/PageHero';
import { ListPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import Link from '@/components/common/AppLink';
import { Flame, Trophy, Calendar, Shield, Snowflake, TrendingUp } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Loading from '../../components/common/Loading';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';

const StreakPage = () => {
  const { translate } = useTranslate();
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
        toast.success(translate('Streak freeze activated!'));
      } else { toast.error(res?.message || translate('Failed')); }
    } catch (e) { toast.error(translate('Pro subscription required')); }
  };

  if (loading) return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="py-2 xl:py-4"><ListPageSkeleton chips={4} rows={3} /></div>
    </div>
  );

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo title="Your Streak – AajExam" description="Track your daily AajExam streak." noIndex={true} />
      <div className="py-4 xl:py-6 space-y-6">
        <PageHero
          icon={Flame}
          eyebrow={translate('Current Streak')}
          title={translate('Your Streak')}
          actions={
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
            <div className="ring-1 ring-slate-200 dark:ring-white/20 px-3 py-1.5 min-w-[88px]" style={{ borderRadius: 10 }}>
              <p className="text-lg font-bold font-outfit leading-none text-primary-600">{streak?.currentStreak || 0}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 whitespace-nowrap">{translate('Current Streak')}</p>
            </div>
            <div className="ring-1 ring-slate-200 dark:ring-white/20 px-3 py-1.5 min-w-[88px]" style={{ borderRadius: 10 }}>
              <p className="text-lg font-bold font-outfit leading-none text-primary-600">{streak?.longestStreak || 0}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 whitespace-nowrap">{translate('Longest Streak')}</p>
            </div>
            <div className="ring-1 ring-slate-200 dark:ring-white/20 px-3 py-1.5 min-w-[88px]" style={{ borderRadius: 10 }}>
              <p className="text-lg font-bold font-outfit leading-none text-primary-600">{streak?.totalActiveDays || 0}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 whitespace-nowrap">{translate('Active Days')}</p>
            </div>
            <div className="ring-1 ring-slate-200 dark:ring-white/20 px-3 py-1.5 min-w-[88px]" style={{ borderRadius: 10 }}>
              <p className="text-lg font-bold font-outfit leading-none text-primary-600">{streak?.freezesAvailable || 0}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 whitespace-nowrap">{translate('Freezes Left')}</p>
            </div>
            </div>
          }
        />

        {/* Today Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card as="section" className={`p-6 text-center ${streak?.todayCompleted ? 'ring-4 ring-primary-500/20' : 'bg-background-surface-secondary ring-4 ring-black/10 dark:ring-white/10'}`}>
            {streak?.todayCompleted
              ? <><Shield className="w-10 h-10 text-primary-600 mx-auto mb-2" /><h2 className="text-lg font-bold text-primary-600">{translate('Today\'s Challenge Complete!')}</h2></>
              : <><Flame className="w-10 h-10 text-content-primary mx-auto mb-2 animate-pulse" /><h2 className="text-lg font-bold text-content-primary">{translate('Complete Today\'s Challenge to Keep Streak!')}</h2>
                <Link href="/daily-challenge" className="inline-block mt-3 px-6 py-2 bg-primary-600 text-on-primary rounded-lg xl:rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">{translate('Go to Challenge')}</Link></>
            }
          </Card>
        </motion.div>

        {/* Freeze Button */}
        {!streak?.todayCompleted && streak?.freezesAvailable > 0 && (
          <Card as="section" className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-content-primary">{translate('Use Streak Freeze')}</h3>
              <p className="text-[10px] text-content-muted">{translate('Skip today without breaking streak (Pro only)')}</p>
            </div>
            <button onClick={useFreeze} className="px-4 py-2 bg-primary-600 text-on-primary rounded-lg xl:rounded-xl text-xs font-bold hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Snowflake className="w-3 h-3 inline mr-1" /> Use Freeze
            </button>
          </Card>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card as="section" className="space-y-2 xl:space-y-4 relative overflow-hidden">
              <h3 className="text-sm font-bold text-content-primary flex items-center gap-2 relative z-10"><TrendingUp className="w-4 h-4 text-primary-600" /> {translate('Streak Leaderboard')}</h3>
              <motion.div className="space-y-2 relative z-10" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
                {leaderboard.map((entry, i) => (
                  <motion.div key={i} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3 px-3 py-3 rounded-lg xl:rounded-xl bg-background-surface-secondary hover:bg-background-surface-secondary transition-colors">
                    <span className={`text-sm font-bold w-6 ${i < 3 ? 'text-content-primary' : 'text-content-muted'}`}>#{i + 1}</span>
                    <span className="text-sm font-bold text-content-secondary flex-1">{entry.user?.name || translate('Student')}</span>
                    <span className="text-sm font-bold text-content-primary flex items-center gap-1"><Flame className="w-3 h-3" />{entry.currentStreak}</span>
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
