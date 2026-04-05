'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Award,
  Brain,
  Crown,
  Gem,
  History,
  Layout,
  Lock,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  Unlock,
  UserPlus,
  Wand2,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import MonthlyRewardsInfo from '../MonthlyRewardsInfo';
import Loading from '../Loading';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';
import PublicNavbar from '../navbars/PublicNavbar';
import Card from '../ui/Card';
import Button from '../ui/Button';

const LEVEL_CONFIG = {
  Starter: {
    icon: UserPlus,
    desc: 'Getting started',
    solid: 'bg-slate-500',
    soft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    progress: 'bg-slate-500',
  },
  Rookie: {
    icon: Star,
    desc: 'Starting your journey',
    solid: 'bg-blue-500',
    soft: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    progress: 'bg-blue-500',
  },
  Explorer: {
    icon: Rocket,
    desc: 'Growing fast',
    solid: 'bg-indigo-500',
    soft: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    progress: 'bg-indigo-500',
  },
  Thinker: {
    icon: Brain,
    desc: 'Thinking deeply',
    solid: 'bg-violet-500',
    soft: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    progress: 'bg-violet-500',
  },
  Strategist: {
    icon: Layout,
    desc: 'Smart thinking',
    solid: 'bg-purple-500',
    soft: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    progress: 'bg-purple-500',
  },
  Achiever: {
    icon: Award,
    desc: 'High achiever',
    solid: 'bg-emerald-500',
    soft: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    progress: 'bg-emerald-500',
  },
  Mastermind: {
    icon: Gem,
    desc: 'Top student',
    solid: 'bg-pink-500',
    soft: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    progress: 'bg-pink-500',
  },
  Champion: {
    icon: Trophy,
    desc: 'Quiz champion',
    solid: 'bg-amber-500',
    soft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    progress: 'bg-amber-500',
  },
  Prodigy: {
    icon: Medal,
    desc: 'Very talented',
    solid: 'bg-orange-500',
    soft: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    progress: 'bg-orange-500',
  },
  Wizard: {
    icon: Wand2,
    desc: 'Master of subjects',
    solid: 'bg-cyan-500',
    soft: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    progress: 'bg-cyan-500',
  },
  Legend: {
    icon: Crown,
    desc: 'Ultimate learner',
    solid: 'bg-primary-500',
    soft: 'bg-primary-500/10 text-primary-700 dark:text-primary-500',
    progress: 'bg-primary-500',
  },
  Default: {
    icon: Sparkles,
    desc: 'Learner',
    solid: 'bg-slate-500',
    soft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    progress: 'bg-slate-500',
  },
};

const HOW_IT_WORKS = [
  {
    label: 'Score high',
    value: `${config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% score required`,
    icon: Target,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Monthly reset',
    value: 'Your score resets every month. A new chance to win!',
    icon: History,
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Unlock levels',
    value: 'Pass enough quizzes to unlock the next level',
    icon: Lock,
    tone: 'bg-primary-500/10 text-primary-700 dark:text-primary-500',
  },
];

const LevelsPage = ({ showNavbar = true }) => {
  const router = useRouter();
  const [userLevelData, setUserLevelData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'path'
  const [activeProUsers, setActiveProUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const requests = [API.getAllLevels(), API.getPublicLandingStats()];

        if (token) {
          requests.unshift(API.getProfile());
        }

        const results = await Promise.all(requests);

        if (token) {
          const [profileRes, levelsRes, statsRes] = results;
          setUserLevelData(profileRes?.user || null);
          if (levelsRes.success) setLevels(levelsRes.data || []);
          if (statsRes?.success) setActiveProUsers(statsRes.data.activeProUsers || 0);
          return;
        }

        const [levelsRes, statsRes] = results;
        if (levelsRes.success) setLevels(levelsRes.data || []);
        if (statsRes?.success) setActiveProUsers(statsRes.data.activeProUsers || 0);
      } catch {
        console.error('Data fetch failure');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const highScoreQuizzes = userLevelData?.monthlyProgress?.highScoreWins || 0;
  const userLevel = userLevelData?.levelInfo?.currentLevel || { number: 0, name: 'Starter', description: 'Start practicing to unlock your first level.' };
  const currentVisual = LEVEL_CONFIG[userLevel.name] || LEVEL_CONFIG.Default;
  const CurrentLevelIcon = currentVisual.icon;
  const estimatedRewardPool = Math.max(activeProUsers * (config.QUIZ_CONFIG.PRIZE_PER_PRO || 0), config.QUIZ_CONFIG.MIN_MONTHLY_POOL || 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loading size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
      <Head>
        <title>Levels | AajExam</title>
      </Head>

      {showNavbar && <PublicNavbar />}

      <div className="container mx-auto px-2 lg:px-6 py-4 lg:py-12 max-w-7xl space-y-8 lg:space-y-16">
        <header className="relative py-10 lg:py-20 text-center space-y-6 lg:space-y-8 overflow-hidden rounded-[2rem] lg:rounded-[4rem] bg-white dark:bg-slate-900 shadow-2xl border-2 border-b-8 border-slate-100 dark:border-primary-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-white dark:from-indigo-950/50 dark:to-slate-900 z-0" />
          <div className="relative z-10 space-y-10 px-4">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-20 lg:w-32 h-20 lg:h-32 bg-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-duo-primary border-4 border-white/10"
            >
              <Trophy className="w-8 lg:w-16 h-8 lg:h-16 text-white" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black font-outfit tracking-tight text-slate-900 dark:text-white leading-none">
                Your <span className="text-primary-700 dark:text-primary-500 text-glow-primary">progress path</span>
              </h1>
              <p className="text-base lg:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                See where you are, how rewards work, and what you need to reach the next level.
              </p>
            </div>
          </div>
          <Sparkles className="absolute -bottom-24 -right-24 w-96 h-96 text-primary-600/10 dark:text-primary-500/10 pointer-events-none" />
        </header>

        {/* --- Tab Switcher (Mobile Scrollable) --- */}
        <section className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 p-2 lg:p-3 bg-slate-100 dark:bg-slate-800 rounded-[2rem] mb-4 lg:mb-12 w-fit border-2 border-slate-200 dark:border-slate-700 mx-auto lg:mx-0 shadow-inner px-3">
          {[
            { id: 'overview', label: 'My Progress', icon: Zap },
            { id: 'path', label: 'Learning Path', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-duo-primary scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-primary-500'}`} />
              {tab.label}
            </button>
          ))}
        </section>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 lg:space-y-16"
            >
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-5 lg:p-10 space-y-5 lg:space-y-8 border-none bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[3rem] shadow-xl relative overflow-hidden group hover:border-primary-500/30 border-2 border-transparent transition-all">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl">
                      <Award className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">Reward system</h2>
                  </div>
                  <div className="space-y-4 lg:space-y-6 relative z-10">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                      Students who reach the <span className="text-primary-700 dark:text-primary-500 font-semibold">Legend</span> level with high scores can win monthly rewards.
                    </p>
                    <div className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center space-y-2">
                      <div className="text-3xl lg:text-4xl font-black font-outfit text-primary-700 dark:text-primary-500 tracking-tight">
                        Rs.{estimatedRewardPool.toLocaleString('en-IN')}+
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This month's estimated prize pool</p>
                    </div>
                  </div>
                  <Sparkles className="absolute -bottom-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                </Card>

                <Card className="p-5 lg:p-10 space-y-5 lg:space-y-8 border-none bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[3rem] shadow-xl relative overflow-hidden group hover:border-primary-500/30 border-2 border-transparent transition-all">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl">
                      <Gem className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">How it works</h2>
                  </div>
                  <ul className="space-y-4 relative z-10">
                    {HOW_IT_WORKS.map((item) => (
                      <li key={item.label} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                        <div className={`p-2 rounded-lg ${item.tone}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.value}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Sparkles className="absolute -bottom-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                </Card>
              </section>

              <MonthlyRewardsInfo />

              <section className="relative group">
                <Card className="p-5 lg:p-10 border-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-2 border-primary-500/20 text-center space-y-6 lg:space-y-10 overflow-hidden">
                  <div className="space-y-4 relative z-10">
                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-500 uppercase tracking-widest">Your progress</p>
                    <h2 className="text-xl lg:text-3xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">
                      Current level: <span className="text-primary-700 dark:text-primary-500">{userLevel.name}</span>
                    </h2>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
                    <div className="transition-transform group-hover:scale-105 duration-500">
                      <div className={`w-20 lg:w-32 h-20 lg:h-32 rounded-[2.5rem] flex items-center justify-center shadow-xl ${currentVisual.solid}`}>
                        <CurrentLevelIcon className="w-8 lg:w-16 h-8 lg:h-16 text-white" />
                      </div>
                    </div>

                    <div className="text-center lg:text-left space-y-6">
                      <div className="space-y-1">
                        <p className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Level {userLevel.number}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{userLevel.description || currentVisual.desc}</p>
                      </div>
                      <div className="p-6 bg-slate-900 dark:bg-black rounded-2xl border border-slate-700 inline-block">
                        <p className="text-xl lg:text-3xl font-black font-mono text-primary-700 dark:text-primary-500 tracking-tighter">{highScoreQuizzes}</p>
                        <p className="text-sm font-medium text-slate-400 pt-1">High-score quizzes you did this month</p>
                      </div>
                    </div>
                  </div>

                  <Sparkles className="absolute -top-12 -left-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 pointer-events-none" />
                </Card>
              </section>
            </motion.div>
          )}

          {activeTab === 'path' && (
            <motion.div
              key="path"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-content-primary">Learning Path</h3>
                <p className="text-sm font-medium text-content-secondary">See what each level needs and how close you are to reaching it.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
                {levels.map((level) => {
                  const levelVisual = LEVEL_CONFIG[level.name] || LEVEL_CONFIG.Default;
                  const LevelIcon = levelVisual.icon;
                  const isCurrent = level.level === userLevel.number;
                  const isUnlocked = highScoreQuizzes >= level.quizzesRequired;
                  const progressPercent = level.quizzesRequired ? Math.min(100, (highScoreQuizzes / level.quizzesRequired) * 100) : 0;

                  const statePill = isCurrent
                    ? 'bg-primary-500 text-white'
                    : isUnlocked
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                  const progressTone = isCurrent
                    ? 'bg-primary-500'
                    : isUnlocked
                      ? 'bg-emerald-500'
                      : levelVisual.progress;

                  return (
                    <motion.div key={level.level} whileHover={{ y: -8 }} className="relative h-full">
                      <Card className={`p-5 lg:p-8 h-full flex flex-col justify-between group border-2 transition-all rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden ${isCurrent ? 'border-primary-500 shadow-duo-primary bg-primary-500/5' : isUnlocked ? 'border-emerald-500/30' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="space-y-6 relative z-10 h-full flex flex-col justify-between">
                          <div className="space-y-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className={`p-4 rounded-2xl ${levelVisual.soft}`}>
                                <LevelIcon className="w-6 h-6" />
                              </div>
                              <div className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${statePill}`}>
                                {isCurrent ? <Zap className="w-3 h-3" /> : isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {isCurrent ? 'Active' : isUnlocked ? 'Unlocked' : 'Locked'}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xl font-black font-outfit tracking-tight">{level.name}</h4>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Level {level.level}</p>
                            </div>

                            <p className="text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-400 leading-relaxed">
                              {level.description || levelVisual.desc}
                            </p>
                          </div>

                          <div className="space-y-3 pt-6">
                            <div className="flex justify-between text-[10px] uppercase font-black tracking-widest gap-3">
                              <span className="text-slate-600 dark:text-slate-400">Goal</span>
                              <span className="text-slate-900 dark:text-white text-right">{level.quizzesRequired} Wins</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${progressTone}`} style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                        </div>

                        <Sparkles className="absolute -bottom-6 -right-6 w-24 h-24 text-slate-700 dark:text-slate-400/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-20 text-center">
          <Button
            onClick={() => router.push('/profile')}
            size="lg"
            variant="ghost"
            icon={ArrowLeft}
            className="px-16 py-7 rounded-[2rem] bg-white dark:bg-slate-800 text-sm font-black shadow-xl hover:text-primary-700 dark:text-primary-500 transition-all"
          >
            Return to profile
          </Button>
        </div>
      </div>

      <UnifiedFooter />
    </div>
  );
};

export default LevelsPage;


