import React, { useEffect, useState } from 'react';
import {
  Trophy,
  List,
  Grid,
  Table as TableIcon,
  Crown,
  Medal,
  Target,
  Zap,
  BookOpen,
  PieChart,
  User,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import Loading from './Loading';

const PublicTopPerformers = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'table'

  useEffect(() => {
    const fetchTop = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.getPublicLandingTopPerformers(10);
        if (res?.success && Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => {
            const aHigh = a.highQuizzes || 0;
            const bHigh = b.highQuizzes || 0;
            if (aHigh !== bHigh) return bHigh - aHigh;
            const aAcc = a.accuracy || 0;
            const bAcc = b.accuracy || 0;
            if (aAcc !== bAcc) return bAcc - aAcc;
            return (b.totalQuizzes || 0) - (a.totalQuizzes || 0);
          });
          setTopPerformers(sorted);
        } else {
          setTopPerformers([]);
        }
      } catch (e) {
        setError('Failed to load top performers');
      } finally {
        setLoading(false);
      }
    };
    fetchTop();

    const setDefaultViewMode = () => {
      if (typeof window !== 'undefined') {
        const defaultMode = window.innerWidth >= 1024 ? 'table' : 'list';
        setViewMode(defaultMode);
      }
    };
    setDefaultViewMode();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-400">Loading Leaderboard...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border-2 border-rose-100 dark:border-rose-900/30">
      <p className="text-sm font-black text-rose-500 uppercase tracking-widest">{error}</p>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 font-outfit">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-4">
        <div className="space-y-1 text-center lg:text-left">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Top Students</p>
          <h3 className="text-xl lg:text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center justify-center lg:justify-start gap-4">
            <Trophy className="w-8 h-8 text-amber-500 fill-current" />
            {new Date().toLocaleDateString('en-US', { month: 'long' })} Performers
          </h3>
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-inner">
          {[
            { id: 'list', icon: List },
            { id: 'grid', icon: Grid },
            { id: 'table', icon: TableIcon }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`p-3 rounded-xl transition-all ${viewMode === mode.id
                ? 'bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-500 shadow-duo border-b-2 border-slate-100 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-500'
                }`}
            >
              <mode.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full"
        >
          {viewMode === 'list' && (
            <div className="space-y-4 px-2">
              {topPerformers.map((performer, index) => (
                <motion.div
                  key={performer?._id || `idx-${index}`}
                  variants={itemVariants}
                  whileHover={{ x: 8 }}
                  className={`flex items-center gap-6 p-5 rounded-[2rem] border-2 border-b-8 transition-all overflow-hidden relative ${index === 0 ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-900/30' :
                    index === 1 ? 'bg-slate-50 dark:bg-slate-400/10 border-slate-200 dark:border-slate-400/30' :
                      index === 2 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30' :
                        'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-duo ${index === 0 ? 'bg-primary-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                      index === 2 ? 'bg-amber-500 text-white' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-400 font-black overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                      {performer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {performer?.name || 'Anonymous'}
                      </h4>
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${performer?.subscriptionName === 'PRO' ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                        }`}>
                        {performer?.subscriptionName || 'FREE'}
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:grid grid-cols-3 gap-8 px-6">
                    <StatMinimal label="Accuracy" value={`${performer?.accuracy || 0}%`} icon={Target} color="primary" />
                    <StatMinimal label="Quizzes" value={performer?.totalQuizzes || 0} icon={BookOpen} color="secondary" />
                    <StatMinimal label="High Scores" value={performer?.highQuizzes || 0} icon={Trophy} color="amber" />
                  </div>

                  <div className="text-right ml-auto">
                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Level</p>
                    <p className="text-xl lg:text-2xl font-black text-primary-700 dark:text-primary-500 font-outfit">{performer?.userLevel || 0}</p>
                  </div>

                  {index < 3 && (
                    <div className="absolute -right-2 -bottom-2 opacity-5 pointer-events-none">
                      {index === 0 ? <Crown className="w-24 h-24 rotate-12" /> : <Medal className="w-24 h-24 rotate-12" />}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
              {topPerformers.map((performer, index) => (
                <motion.div
                  key={performer?._id || `grid-${index}`}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 mlgp-8 border-2 border-b-8 border-slate-100 dark:border-slate-700 relative overflow-hidden group transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-duo ${index === 0 ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                      #{index + 1}
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1 text-right">Level</p>
                      <p className="text-xl lg:text-2xl font-black text-primary-700 dark:text-primary-500 font-outfit">Lvl {performer?.userLevel || 0}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-3xl border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform">
                      {performer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{performer?.name || 'Anonymous'}</h4>
                      <p className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">{performer?.subscriptionName || 'FREE'} STUDENT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <StatBoxMini label="Accuracy" value={`${performer?.accuracy || 0}%`} color="primary" />
                    <StatBoxMini label="High Scores" value={performer?.highQuizzes || 0} color="amber" />
                  </div>

                  {index === 0 && (
                    <div className="absolute -top-6 -right-6 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full flex items-center justify-center pointer-events-none">
                      <Crown className="w-12 h-12 text-primary-700 dark:text-primary-500/20 rotate-12" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="overflow-hidden rounded-[2.5rem] border-2 border-b-8 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b-2 border-slate-100 dark:border-slate-800">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"># Rank</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Level</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Accuracy</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">High Scores</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-700/50">
                  {topPerformers.map((performer, index) => (
                    <motion.tr
                      key={performer?._id || `table-${index}`}
                      variants={itemVariants}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors ${index < 3 ? 'font-bold' : ''}`}
                    >
                      <td className="p-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-duo ${index === 0 ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-400 border-2 border-white dark:border-slate-800 shadow-sm">
                            {performer?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{performer?.name || 'Anonymous'}</p>
                            <p className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest">{performer?.subscriptionName || 'FREE'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-black text-slate-600 dark:text-slate-400 font-outfit uppercase">Lvl {performer?.userLevel || 0}</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-sm font-black text-emerald-500 font-outfit tabular-nums">{performer?.accuracy || 0}%</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-sm font-black text-amber-500 font-outfit tabular-nums">{performer?.highQuizzes || 0}</span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-300 dark:text-slate-600 group hover:text-primary-700 dark:text-primary-500 transition-colors cursor-pointer">
                          <span className="text-[9px] font-black uppercase tracking-widest group-hover:mr-2 transition-all">Stats</span>
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function StatMinimal({ label, value, icon: Icon, color }) {
  const colors = {
    primary: 'text-primary-700 dark:text-primary-500',
    secondary: 'text-primary-700 dark:text-primary-500',
    amber: 'text-amber-500'
  };
  return (
    <div className="flex flex-col items-center">
      <div className={`p-2 rounded-xl bg-white dark:bg-slate-900/50 mb-1 ${colors[color]} shadow-sm`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{value}</p>
      <p className="text-[7px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function StatBoxMini({ label, value, color }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-700 dark:text-primary-500 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
  };
  return (
    <div className={`${colors[color]} rounded-2xl p-4 border-2 border-b-4 flex flex-col items-center justify-center text-center`}>
      <span className="text-lg font-black font-outfit leading-none mb-1">{value}</span>
      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</p>
    </div>
  );
}

export default PublicTopPerformers;


