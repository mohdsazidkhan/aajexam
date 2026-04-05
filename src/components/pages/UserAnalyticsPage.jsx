'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
   TrendingUp,
   TrendingDown,
   Wallet,
   Trophy,
   Target,
   Users,
   GraduationCap,
   BookOpen,
   Coins,
   PieChart,
   Award,
   Zap,
   ArrowRight,
   Flame,
   Star,
   UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Skeleton from '../Skeleton';

const MyAnalyticsPage = () => {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeTab, setActiveTab] = useState('skills'); // 'skills' or 'wallet'

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const res = await API.getAnalytics();
            if (res?.success) setData(res.data);
            else setError(res?.message || 'Failed to load data');
         } catch (err) {
            setError('An error occurred.');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   if (loading) return (
      <div className="space-y-8 animate-fade-in py-10 mt-16">
         <Skeleton height="150px" borderRadius="2rem" />
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" borderRadius="1.5rem" />)}
         </div>
         <Skeleton height="400px" borderRadius="1.5rem" />
      </div>
   );

   const {
      totalEarnings = 0, netEarnings = 0, totalExpenses = 0,
      averageAccuracy = 0, testAttemptsCount = 0, totalHighScoreWins = 0,
      followersCount = 0, followingCount = 0, referralCount = 0,
      quizEarnings = 0, blogEarnings = 0
   } = data || {};

   return (
      <div className="space-y-6 lg:space-y-10 animate-fade-in mt-0 lg:mt-16">
         <Head>
            <title>My Analytics - AajExam</title>
         </Head>

         {/* --- Performance Hero --- */}
         <section className="relative">
            <Card className="bg-gradient-to-br from-primary-500 to-indigo-600 text-white border-none shadow-duo-primary p-5 lg:p-8 overflow-hidden relative rounded-[2rem] lg:rounded-[3rem]">
               <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-8">
                  <div className="space-y-3 text-center lg:text-left">
                     <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                        <Star className="w-4 h-4 fill-white text-white" />
                        My Progress
                     </div>
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit">My Progress</h1>
                     <p className="text-sm lg:text-lg font-bold opacity-80 px-1">See how well you are doing in quizzes</p>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6">
                     <div className="text-center">
                        <p className="text-3xl lg:text-5xl font-black font-outfit">{averageAccuracy.toFixed(0)}%</p>
                        <p className="text-[10px] font-black opacity-60">Accuracy</p>
                     </div>
                     <div className="h-12 lg:h-16 w-1 bg-white/20 rounded-full" />
                     <div className="text-center">
                        <p className="text-3xl lg:text-5xl font-black font-outfit">{testAttemptsCount}</p>
                        <p className="text-[10px] font-black opacity-60">Quizzes Done</p>
                     </div>
                  </div>
               </div>

               <GraduationCap className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 rotate-12" />
            </Card>
         </section>

         {/* --- Tab Switcher --- */}
         <section className="flex flex-nowrap overflow-x-auto no-scrollbar gap-4 p-2 bg-background-surface-secondary rounded-[2rem] w-fit mx-auto lg:mx-0 max-w-full pb-3">
            <button
               onClick={() => setActiveTab('skills')}
               className={`flex-shrink-0 whitespace-nowrap px-8 py-3 rounded-full font-black uppercase text-sm transition-all ${activeTab === 'skills' ? 'bg-primary-500 text-white shadow-lg' : 'text-content-secondary'}`}
            >
               Quiz Stats
            </button>
            <button
               onClick={() => setActiveTab('wallet')}
               className={`flex-shrink-0 whitespace-nowrap px-8 py-3 rounded-full font-black uppercase text-sm transition-all ${activeTab === 'wallet' ? 'bg-primary-500 text-white shadow-lg' : 'text-content-secondary'}`}
            >
               My Wallet
            </button>
         </section>

         <AnimatePresence mode="wait">
            {activeTab === 'skills' ? (
               <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                     {[
                        { label: 'High-Score Quizzes', value: totalHighScoreWins, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                        { label: 'Followers', value: followersCount, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
                        { label: 'Following', value: followingCount, icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
                        { label: 'Referrals', value: referralCount, icon: UserPlus, color: 'text-accent-orange', bg: 'bg-accent-orange/10' }
                     ].map((item, idx) => (
                        <Card key={idx} className="flex flex-col items-center text-center p-4 lg:p-6 gap-2 border-border-primary group hover:border-primary-500 transition-colors rounded-[2rem] lg:rounded-[2.5rem]">
                           <div className={`p-3 lg:p-4 rounded-2xl lg:rounded-3xl ${item.bg} dark:bg-slate-700/50 ${item.color} group-hover:scale-110 transition-transform`}>
                              <item.icon className="w-6 h-6 lg:w-8 lg:h-8" />
                           </div>
                           <span className="text-xl lg:text-2xl font-black font-outfit">{item.value}</span>
                           <span className="text-[10px] font-black text-content-secondary">{item.label}</span>
                        </Card>
                     ))}
                  </div>

                  {/* Performance breakdown */}
                  <div className="space-y-6">
                     <h2 className="text-xl lg:text-2xl font-black font-outfit px-1">Your Subject Performance</h2>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[
                           { name: 'Mathematics', val: 78, color: 'primary' },
                           { name: 'Reasoning', val: 92, color: 'secondary' },
                           { name: 'GK & Science', val: 64, color: 'accent-orange' },
                           { name: 'English', val: 45, color: 'accent-purple' }
                        ].map((skill, idx) => (
                           <Card key={idx} className="p-6 border-border-primary space-y-4 rounded-3xl">
                              <div className="flex justify-between items-center">
                                 <span className="font-black text-lg">{skill.name}</span>
                                 <span className="font-black text-sm text-content-secondary">{skill.val}% Score</span>
                              </div>
                              <ProgressBar progress={skill.val} color={skill.color} height="h-3" />
                           </Card>
                        ))}
                     </div>
                  </div>
               </motion.div>
            ) : (
               <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <Card className="bg-primary-500 text-white border-none shadow-duo-secondary p-6 lg:p-8 flex flex-col justify-between rounded-[2rem] lg:rounded-[3rem]">
                        <div className="flex justify-between items-start">
                           <div className="p-3 bg-white/20 rounded-2xl"><Wallet className="w-8 h-8" /></div>
                           <span className="text-xs font-black opacity-60">Rewards</span>
                        </div>
                        <div className="space-y-1">
                           <p className="text-xs font-black opacity-60">Your Balance</p>
                           <h3 className="text-5xl font-black font-outfit">₹{netEarnings.toLocaleString('en-IN')}</h3>
                        </div>
                     </Card>

                     <div className="space-y-4">
                        <Card className="flex items-center gap-6 p-6 border-border-primary rounded-3xl">
                           <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><TrendingUp className="w-8 h-8" /></div>
                           <div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Total Earned</p>
                              <p className="text-xl lg:text-2xl font-black font-outfit">₹{totalEarnings.toLocaleString('en-IN')}</p>
                           </div>
                        </Card>
                        <Card className="flex items-center gap-6 p-6 border-border-primary rounded-3xl">
                           <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><TrendingDown className="w-8 h-8" /></div>
                           <div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Total Spent</p>
                              <p className="text-xl lg:text-2xl font-black font-outfit">₹{totalExpenses.toLocaleString('en-IN')}</p>
                           </div>
                        </Card>
                     </div>

                     <Card variant="dark" className="bg-slate-950 text-white border-none p-8 flex flex-col justify-center items-center text-center space-y-6 rounded-[3rem]">
                        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center animate-bounce">
                           <Coins className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-xl font-black font-outfit uppercase">Take Out Your Money</h4>
                           <p className="text-xs font-bold text-slate-400">Send your prize money directly to your bank account.</p>
                        </div>
                        <Button variant="primary" fullWidth className="rounded-2xl py-4 font-black">WITHDRAW</Button>
                     </Card>
                  </div>

                  <div className="space-y-6">
                     <h2 className="text-xl lg:text-2xl font-black font-outfit px-1">Earnings Breakdown</h2>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="p-6 border-border-primary flex items-center justify-between group hover:border-primary-500 transition-all rounded-3xl">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
                              <span className="font-black">From Articles</span>
                           </div>
                           <span className="font-black text-xl text-primary-600">₹{blogEarnings}</span>
                        </Card>
                        <Card className="p-6 border-border-primary flex items-center justify-between group hover:border-primary-500 transition-all rounded-3xl">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center"><Zap className="w-6 h-6" /></div>
                              <span className="font-black">From Quizzes</span>
                           </div>
                           <span className="font-black text-xl text-primary-600">₹{quizEarnings}</span>
                        </Card>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default MyAnalyticsPage;


