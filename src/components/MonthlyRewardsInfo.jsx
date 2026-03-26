import React, { useState, useEffect } from 'react';
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
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 ${className} backdrop-blur-sm`}>
        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-sm flex items-center gap-2">
          <span className="p-1 bg-blue-100 dark:bg-blue-800 rounded">📋</span>
          Rewards System
        </h4>
        <div className="space-y-2">
          <div className="text-[10px] text-blue-700 dark:text-blue-300">
            <strong>Daily:</strong> ₹{(stats.prizepools.daily?.total ?? stats.prizepools.daily ?? 0).toLocaleString()} total pool
          </div>
          <div className="text-[10px] text-blue-700 dark:text-blue-300">
            <strong>Weekly:</strong> ₹{(stats.prizepools.weekly?.total ?? stats.prizepools.weekly ?? 0).toLocaleString()} total pool
          </div>
          <div className="text-[10px] text-blue-700 dark:text-blue-300">
            <strong>Monthly:</strong> ₹{(stats.prizepools.monthly?.total ?? stats.prizepools.monthly ?? 0).toLocaleString()} total pool
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
      icon: '🌅',
      color: 'blue',
      pool: stats.prizepools.daily,
      req: `${config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT} Quizzes`,
      levelReq: `Daily Level ${config.QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED}+`,
      reset: `Daily at ${config.CRON_CONFIG.DAILY_RESET}`
    },
    {
      type: 'Weekly',
      icon: '📅',
      color: 'purple',
      pool: stats.prizepools.weekly,
      req: `${config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT} Quizzes`,
      levelReq: `Weekly Level ${config.QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED}+`,
      reset: `Every ${config.CRON_CONFIG.WEEKLY_RESET}`
    },
    {
      type: 'Monthly',
      icon: '🏆',
      color: 'orange',
      pool: stats.prizepools.monthly,
      req: `${config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} Quizzes`,
      levelReq: `Level ${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}+`,
      reset: `${config.CRON_CONFIG.MONTHLY_RESET}`
    }
  ];

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-800/50 rounded-3xl p-6 lg:p-10 ${className} shadow-xl`}>
      <div className="relative z-10">
        <h3 className="text-2xl lg:text-3xl font-black text-gray-800 dark:text-white mb-8 tracking-tight">
          Rewards & <span className="text-blue-600 dark:text-blue-400">Challenges System</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challengeInfo.map((item) => (
            <div key={item.type} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-white dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
              <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/50 rounded-xl flex items-center justify-center mb-4 text-xl`}>
                {item.icon}
              </div>
              <h4 className="font-bold text-gray-800 dark:text-white mb-1">{item.type} Challenge</h4>
              <div className={`text-${item.color}-600 dark:text-${item.color}-400 text-2xl font-black mb-3`}>
                ₹{(item.pool?.total ?? item.pool ?? 0).toLocaleString()}
                <span className="text-[10px] text-gray-400 block font-normal uppercase">Current Prize Pool</span>
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <strong>{item.levelReq}</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <strong>{item.req}</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% Min Accuracy</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{item.reset}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            Prizes are calculated based on <strong>{activePro} Active PRO Users</strong>. More PRO users = Higher Prize Pools!
          </p>
        </div>
      </div>

      {/* Reward Potential Example */}
      <div className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-700">
        <div className="relative group overflow-hidden rounded-3xl p-1">
          {/* Animated border/glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-gradient-shift"></div>

          <div className="relative z-10 bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-900 rounded-[calc(1.5rem-1px)] p-6 lg:p-10 text-white shadow-2xl overflow-hidden">
            {/* Complex Background Decor */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full -mr-40 -mt-40 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 blur-[100px] rounded-full -ml-40 -mb-40 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-400/10 blur-[80px] rounded-full -ml-20 -mt-20 animate-blob animation-delay-4000"></div>

            <div className="relative z-10">
              {/* Type Switcher */}
              <div className="flex items-center gap-2 mb-8 bg-white/10 p-1 rounded-xl self-start">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setExampleType(type)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      exampleType === type
                        ? 'bg-white text-indigo-700 shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                    {exampleType.charAt(0).toUpperCase() + exampleType.slice(1)} Earning Example
                  </div>
                  <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500 uppercase">
                    REWARD SYSTEM
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mt-1">
                    Compete, Win & Grow
                  </p>
                  <p className="text-indigo-100 text-sm lg:text-base leading-relaxed font-medium">
                    {exampleType === 'monthly' && (
                      <>Our prize pool grows with every new PRO member. For every PRO user who joins,
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded mx-1"> ₹{config.QUIZ_CONFIG.MONTHLY_POOL_MULTIPLIER} </span> is added to the monthly pool!</>
                    )}
                    {exampleType === 'weekly' && (
                      <>Weekly rewards are distributed every Sunday. For the weekly pool, we add 
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded mx-1"> ₹{config.QUIZ_CONFIG.WEEKLY_POOL_MULTIPLIER} </span> per PRO user, divided by 4 weeks.</>
                    )}
                    {exampleType === 'daily' && (
                      <>Daily winners are recognized every night! For the daily pool, we add 
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded mx-1"> ₹{config.QUIZ_CONFIG.DAILY_POOL_MULTIPLIER} </span> per PRO user, divided by 30 days.</>
                    )}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-75 animate-pulse-glow"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center lg:min-w-[280px] shadow-2xl hover-scale">
                    <div className="text-xs uppercase font-black text-indigo-200 tracking-widest mb-2">Hypothetical: 100 PRO Users</div>
                    <div className="text-5xl lg:text-6xl font-black text-white tracking-tighter sm:text-4xl">
                      ₹{(() => {
                        const base = 100;
                        if (exampleType === 'monthly') return (base * config.QUIZ_CONFIG.MONTHLY_POOL_MULTIPLIER).toLocaleString('en-IN');
                        if (exampleType === 'weekly') return Math.round((base * config.QUIZ_CONFIG.WEEKLY_POOL_MULTIPLIER) / 4).toLocaleString('en-IN');
                        if (exampleType === 'daily') return Math.round((base * config.QUIZ_CONFIG.DAILY_POOL_MULTIPLIER) / 30).toLocaleString('en-IN');
                        return 0;
                      })()}
                    </div>
                    <div className="text-[10px] text-indigo-200 mt-2 font-bold uppercase tracking-wide">Total {exampleType.charAt(0).toUpperCase() + exampleType.slice(1)} Prize Pool</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 lg:grid-cols-5 gap-4">
                {(() => {
                  const distributions = {
                    daily: [
                      { label: 'Rank 1 Wins', percentage: 1.0, icon: '🥇' }
                    ],
                    weekly: [
                      { label: 'Rank 1 Wins', percentage: 0.50, icon: '🥇' },
                      { label: 'Rank 2 Wins', percentage: 0.30, icon: '🥈' },
                      { label: 'Rank 3 Wins', percentage: 0.20, icon: '🥉' }
                    ],
                    monthly: [
                      { label: 'Rank 1 Wins', percentage: 0.35, icon: '🥇' },
                      { label: 'Rank 2 Wins', percentage: 0.25, icon: '🥈' },
                      { label: 'Rank 3 Wins', percentage: 0.20, icon: '🥉' },
                      { label: 'Rank 4 Wins', percentage: 0.12, icon: '🏅' },
                      { label: 'Rank 5 Wins', percentage: 0.08, icon: '🎖️' }
                    ]
                  };

                  return (distributions[exampleType] || distributions.monthly).map((reward, i) => (
                    <div key={i} className="group/card bg-white/40 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 dark:border-white/5 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-black text-white/70 uppercase tracking-wider">{reward.label}</div>
                        <span className="text-xl opacity-50 group-hover/card:opacity-100 transition-opacity">{reward.icon}</span>
                      </div>
                      <div className="text-xl lg:text-2xl font-black text-white group-hover/card:text-yellow-300 transition-colors">
                        ₹{(() => {
                          const base = 100;
                          let pool = 0;
                          if (exampleType === 'monthly') pool = base * config.QUIZ_CONFIG.MONTHLY_POOL_MULTIPLIER;
                          else if (exampleType === 'weekly') pool = (base * config.QUIZ_CONFIG.WEEKLY_POOL_MULTIPLIER) / 4;
                          else if (exampleType === 'daily') pool = (base * config.QUIZ_CONFIG.DAILY_POOL_MULTIPLIER) / 30;
                          return Math.round(pool * reward.percentage).toLocaleString('en-IN');
                        })()}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${reward.percentage * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-bold text-indigo-200">{(reward.percentage * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <p className="text-[10px] text-indigo-200 italic max-w-md">
                  * Illustrative example. Actual rewards are calculated based on real-time active PRO users. Join the legends today!
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
