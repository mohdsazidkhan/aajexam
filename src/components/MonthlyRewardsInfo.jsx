import React, { useState, useEffect } from 'react';
import { Sunrise, Calendar, Trophy, Medal, Award, Star, IndianRupee } from 'lucide-react';
import config from '../lib/config/appConfig';
import API from '../lib/api';
import Loading from './Loading';

const MonthlyRewardsInfo = ({ compact = false, className = '', prizePool: propPrizePool = null, activeProUsers: propActiveProUsers = null, rewardDistribution: propRewardDistribution = null }) => {
  const [stats, setStats] = useState({
    activeProUsers: propActiveProUsers || 0,
    prizepools: { daily: 0, weekly: 0, monthly: 0 },
    loading: !propActiveProUsers
  });

  const [exampleType, setExampleType] = useState('monthly'); // 'daily', 'weekly', 'monthly'

  useEffect(() => {
    fetchStats();
  }, [propActiveProUsers]);

  const fetchStats = async () => {
    try {
      const [statsRes, prizeRes] = await Promise.all([
        API.getPublicLandingStats(),
        API.getPrizePools()
      ]);

      if (statsRes.success && prizeRes.success) {
        setStats({
          activeProUsers: statsRes.data.activeProUsers,
          prizepools: prizeRes.prizepools,
          loading: false
        });
      }
    } catch (err) {
      console.error("Error fetching stats for RewardsInfo:", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const pool = propPrizePool !== null ? propPrizePool : stats.prizepools.monthly;
  const activePro = propActiveProUsers !== null ? propActiveProUsers : stats.activeProUsers;

  if (compact) {
    return (
      <div className={`bg-white dark:bg-slate-800 border-2 border-b-4 border-slate-100 dark:border-slate-700 rounded-[1.5rem] p-5 shadow-xl font-outfit ${className}`}>
        <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          Reward Pools
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-primary-700 dark:text-primary-500">Daily Pool</span>
            <span className="text-slate-700 dark:text-white flex items-center gap-1"><IndianRupee className="w-2.5 h-2.5" /> {(stats.prizepools.daily?.total ?? stats.prizepools.daily ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-primary-700 dark:text-primary-500">Weekly Pool</span>
            <span className="text-slate-700 dark:text-white flex items-center gap-1"><IndianRupee className="w-2.5 h-2.5" /> {(stats.prizepools.weekly?.total ?? stats.prizepools.weekly ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-green-500">Monthly Pool</span>
            <span className="text-slate-700 dark:text-white flex items-center gap-1"><IndianRupee className="w-2.5 h-2.5" /> {(stats.prizepools.monthly?.total ?? stats.prizepools.monthly ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  if (stats.loading && !compact) {
    return <Loading size="lg" />;
  }

  const challengeInfo = [
    {
      type: 'Daily',
      icon: Sunrise,
      color: 'blue',
      pool: stats.prizepools.daily,
      req: `${config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT} Quizzes`,
      levelReq: `Daily Level ${config.QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED}+`,
      reset: `Daily at ${config.CRON_CONFIG.DAILY_RESET}`
    },
    {
      type: 'Weekly',
      icon: Calendar,
      color: 'purple',
      pool: stats.prizepools.weekly,
      req: `${config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT} Quizzes`,
      levelReq: `Weekly Level ${config.QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED}+`,
      reset: `Every ${config.CRON_CONFIG.WEEKLY_RESET}`
    },
    {
      type: 'Monthly',
      icon: Trophy,
      color: 'orange',
      pool: stats.prizepools.monthly,
      req: `${config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} Quizzes`,
      levelReq: `Level ${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}+`,
      reset: `${config.CRON_CONFIG.MONTHLY_RESET}`
    }
  ];

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-b-8 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-4 md:p-8 lg:p-12 ${className} shadow-2xl font-outfit`}>
      <div className="relative z-10">
        <h3 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter uppercase">
          Estimated <span className="text-primary-700 dark:text-primary-500">Rewards</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {challengeInfo.map((item) => (
            <div key={item.type} className="bg-slate-50 dark:bg-slate-800 p-10 rounded-[2.5rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl transition-all hover:-translate-y-2 group">
              <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-8 shadow-duo border-4 border-slate-100 dark:border-slate-600 rotate-3 group-hover:rotate-6 transition-transform">
                <item.icon className="w-10 h-10 text-primary-500" />
              </div>
              <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mb-3">{item.type} Prize Pool</h4>
              <div className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter group-hover:text-primary-700 dark:text-primary-500 transition-colors flex items-center gap-2">
                <span className="text-2xl lg:text-4xl text-slate-400">₹</span>{(item.pool?.total ?? item.pool ?? 0).toLocaleString()}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none">{item.levelReq}</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none">{item.req}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-inner group">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] text-center">
            Prizes scale with active Pro students. Currently <span className="text-primary-700 dark:text-primary-500 group-hover:scale-110 inline-block transition-transform">{activePro} students</span> are Pro!
          </p>
        </div>
      </div>

      {/* Reward Potential Example */}
      <div className="mt-16 pt-16 border-t-4 border-slate-100 dark:border-slate-800">
        <div className="relative group overflow-hidden rounded-[3rem] p-1 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-500 to-primary-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-gradient-shift"></div>

          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[calc(3rem-4px)] p-4 md:p-10 lg:p-16 overflow-hidden border-4 border-slate-100 dark:border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[120px] rounded-full -mr-48 -mt-48"></div>

            <div className="relative z-10">
              {/* Type Switcher */}
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 lg:p-3 bg-slate-100 dark:bg-slate-800 rounded-[2rem] mb-4 lg:mb-12 w-fit max-w-full shadow-inner border-2 border-slate-200 dark:border-slate-700 mx-auto lg:mx-0 px-3">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setExampleType(type)}
                    className={`px-6 lg:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex-shrink-0 ${exampleType === type
                      ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-500 shadow-duo border-2 border-slate-100 dark:border-slate-600 active:translate-y-0.5'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 text-center lg:text-left">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-50 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-2 border-primary-100 dark:border-slate-700 text-primary-700 dark:text-primary-500">
                    <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                    {exampleType} Reward Projection
                  </div>
                  <h2 className="text-2xl lg:text-4xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 uppercase">
                    Reward <span className="text-primary-700 dark:text-primary-500">System</span>
                  </h2>
                  <p className="text-slate-700 dark:text-slate-400 text-sm lg:text-base leading-relaxed font-black uppercase tracking-widest max-w-xl mx-auto lg:mx-0 opacity-80">
                    {exampleType === 'monthly' && (
                      <>The prize pool grows with every student. For every new student, 
                        <span className="text-primary-700 dark:text-primary-500 font-black"> ₹{config.QUIZ_CONFIG.MONTHLY_POOL_MULTIPLIER} </span> is added to the monthly prize pool!</>
                    )}
                    {exampleType === 'weekly' && (
                      <>Weekly rewards are distributed every Sunday. We add 
                        <span className="text-primary-700 dark:text-primary-500 font-black"> ₹{config.QUIZ_CONFIG.WEEKLY_POOL_MULTIPLIER} </span> per PRO to the pool.</>
                    )}
                    {exampleType === 'daily' && (
                      <>Daily rewards for top students. We add 
                        <span className="text-green-500 font-black"> ₹{config.QUIZ_CONFIG.DAILY_POOL_MULTIPLIER} </span> per PRO to the daily pool.</>
                    )}
                  </p>
                </div>

                <div className="relative group/val">
                  <div className="absolute inset-0 bg-primary-500/10 blur-[60px] rounded-full scale-110 group-hover/val:scale-125 transition-transform"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border-4 border-b-[16px] border-primary-500 shadow-2xl text-center lg:min-w-[320px] transition-all group-hover/val:-translate-y-2">
                    <div className="text-[10px] uppercase font-black text-slate-600 dark:text-slate-400 tracking-[0.4em] mb-6">100 Pro Members Active</div>
                    <div className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 flex items-center justify-center gap-2">
                      <span className="text-2xl lg:text-4xl text-slate-400">₹</span>{(() => {
                        const base = 100;
                        if (exampleType === 'monthly') return (base * config.QUIZ_CONFIG.MONTHLY_POOL_MULTIPLIER).toLocaleString('en-IN');
                        if (exampleType === 'weekly') return Math.round((base * config.QUIZ_CONFIG.WEEKLY_POOL_MULTIPLIER) / 4).toLocaleString('en-IN');
                        if (exampleType === 'daily') return Math.round((base * config.QUIZ_CONFIG.DAILY_POOL_MULTIPLIER) / 30).toLocaleString('en-IN');
                        return 0;
                      })()}
                    </div>
                    <div className="text-[10px] text-primary-700 dark:text-primary-500 font-black uppercase tracking-[0.3em]">Projected Prize Pool</div>
                  </div>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {(() => {
                  const distributions = {
                    daily: [
                      { label: '1st Rank', percentage: 1.0, icon: Trophy }
                    ],
                    weekly: [
                      { label: '1st Rank', percentage: 0.50, icon: Trophy },
                      { label: '2nd Rank', percentage: 0.30, icon: Medal },
                      { label: '3rd Rank', percentage: 0.20, icon: Award }
                    ],
                    monthly: [
                      { label: '1st Rank', percentage: 0.35, icon: Trophy },
                      { label: '2nd Rank', percentage: 0.25, icon: Medal },
                      { label: '3rd Rank', percentage: 0.20, icon: Award },
                      { label: '4th Rank', percentage: 0.12, icon: Star },
                      { label: '5th Rank', percentage: 0.08, icon: Star }
                    ]
                  };

                  return (distributions[exampleType] || distributions.monthly).map((reward, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border-4 border-b-[8px] border-slate-100 dark:border-slate-700 shadow-xl transition-all hover:-translate-y-2 group/card">
                      <div className="flex items-center justify-between mb-6">
                        <reward.icon className="w-8 h-8 text-primary-500 rotate-3 group-hover/card:rotate-12 transition-transform" />
                        <div className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{reward.label}</div>
                      </div>
                      <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter flex items-center gap-1.5">
                        <span className="text-sm lg:text-base text-slate-400">₹</span>{(() => {
                          const base = 100;
                          let pool = 0;
                          if (exampleType === 'monthly') pool = base * config.QUIZ_CONFIG.MONTHLY_POOL_MULTIPLIER;
                          else if (exampleType === 'weekly') pool = (base * config.QUIZ_CONFIG.WEEKLY_POOL_MULTIPLIER) / 4;
                          else if (exampleType === 'daily') pool = (base * config.QUIZ_CONFIG.DAILY_POOL_MULTIPLIER) / 30;
                          return Math.round(pool * reward.percentage).toLocaleString('en-IN');
                        })()}
                      </div>
                      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary-500 shadow-duo-primary" style={{ width: `${reward.percentage * 100}%` }}></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-md">
                  * PROJECTION ONLY. ACTUAL PAYOUTS ARE BASED ON ACTIVE PRO MEMBERS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRewardsInfo;


