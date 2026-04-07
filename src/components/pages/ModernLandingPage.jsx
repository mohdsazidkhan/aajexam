'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
   Trophy,
   Star,
   Brain,
   Target,
   Zap,
   ChevronRight,
   Users,
   Flame,
   ShieldCheck,
   ArrowRight,
   Sparkles,
   Rocket,
   Medal,
   Coins,
} from 'lucide-react';
import { motion } from 'framer-motion';

import PublicNavbar from "../navbars/PublicNavbar";
import UnifiedFooter from "../UnifiedFooter";
import MobileAppWrapper from "../MobileAppWrapper";
import config from '../../lib/config/appConfig';
import API from '../../lib/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import MonthlyWinnersDisplay from "../MonthlyWinnersDisplay";

const ModernLandingPage = () => {
   const [stats, setStats] = useState({
      activeStudents: "250+",
      totalQuizzes: "2K+",
      totalQuestions: "12K+",
      monthlyPrizePool: "650"
   });
   const router = useRouter();

   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         router.push("/home");
         return;
      }
      fetchStats();
   }, [router]);

   const fetchStats = async () => {
      try {
         const res = await API.getPublicLandingStats();
         if (res.success) {
            const formatNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K+` : `${n}`);
            setStats({
               activeStudents: formatNum(res.data?.activeStudents || 250),
               totalQuizzes: formatNum(res.data?.totalQuizzes || 2400),
               totalQuestions: formatNum(res.data?.totalQuestions || 12500),
               monthlyPrizePool: formatNum(res.data?.monthlyPrizePool || 650)
            });
         }
      } catch (e) {
      }
   };

   return (
      <MobileAppWrapper showHeader={true} title="Home">
         <section className="relative pt-12 pb-8 lg:pt-16 lg:pb-20 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] bg-gradient-to-b from-primary-500/20 via-primary-500/10 to-transparent blur-[120px] opacity-70" />
               <div className="absolute top-1/4 right-[5%] w-96 h-96 bg-primary-500/15 rounded-full blur-[100px] animate-pulse" />
               <div className="absolute bottom-1/4 left-[5%] w-80 h-80 bg-primary-500/15 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-3 lg:px-6 relative z-10">
               <div className="max-w-5xl mx-auto text-center space-y-12 mt-8 lg:mt-0">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-white dark:bg-slate-800 backdrop-blur-md rounded-full text-xs font-black tracking-[0.12em] text-primary-700 dark:text-primary-500 border-2 border-primary-500/10 shadow-xl"
                  >
                     <Sparkles className="w-4 h-4 text-primary-700 dark:text-primary-500" />
                     Trusted by students across India
                  </motion.div>

                  <div className="space-y-4 lg:space-y-6">
                     <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tighter leading-[0.9] lg:leading-[0.85] text-slate-900 dark:text-white"
                     >
                        Practice for <span className="text-primary-700 dark:text-primary-500">Exams</span>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-500 to-primary-500 bg-[length:200%_auto] animate-gradient">You Study. You Win.</p>
                     </motion.h1>

                     <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-base lg:text-xl lg:text-2xl text-slate-700 dark:text-slate-400 font-bold max-w-3xl mx-auto leading-relaxed px-0 lg:px-4"
                     >
                        Practice daily quizzes for government exams, see how you are improving, and earn rewards for your hard work.
                     </motion.p>
                  </div>

                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4, duration: 0.8 }}
                     className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-0 lg:pt-4"
                  >
                     <Button
                        variant="primary"
                        size="xl"
                        icon={ArrowRight}
                        iconPosition="right"
                        className="w-full sm:w-auto shadow-duo-primary transform hover:-translate-y-1 transition-all duration-300 font-outfit tracking-[0.08em] text-sm py-3 lg:py-6"
                        onClick={() => router.push('/register')}
                     >
                        Start practicing now
                     </Button>
                     <Button
                        variant="ghost"
                        size="xl"
                        icon={Zap}
                        iconPosition="right"
                        className="w-full sm:w-auto bg-white dark:bg-slate-800/30 border-2 border-slate-200 dark:border-white/5 shadow-sm font-outfit tracking-[0.08em] text-sm py-3 lg:py-6"
                        onClick={() => router.push('/categories')}
                     >
                        Browse categories
                     </Button>
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="flex flex-wrap items-center justify-center gap-x-6 lg:gap-x-12 gap-y-4 pt-4 lg:pt-6 border-t-2 border-slate-200/50 dark:border-slate-800/50"
                  >
                     <div className="flex items-center gap-3 font-black text-xs tracking-[0.08em] text-slate-600 dark:text-slate-400">
                        <ShieldCheck className="w-5 h-5 text-primary-700 dark:text-primary-500" /> Questions by experts
                     </div>
                     <div className="flex items-center gap-3 font-black text-xs tracking-[0.08em] text-slate-600 dark:text-slate-400">
                        <Flame className="w-5 h-5 text-primary-700 dark:text-primary-500" /> Thousands of questions
                     </div>
                     <div className="flex items-center gap-3 font-black text-xs tracking-[0.08em] text-slate-600 dark:text-slate-400">
                        <Trophy className="w-5 h-5 text-amber-500" /> Win prizes every month
                     </div>
                  </motion.div>
               </div>
            </div>
         </section>

         <section className="py-8 lg:py-20 bg-white dark:bg-slate-900 border-y-2 border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-4 lg:px-6">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-12">
                  {[
                     { label: 'Students Learning', val: stats.activeStudents, icon: Users, color: 'text-primary-700 dark:text-primary-500' },
                     { label: 'Interactive Quizzes', val: stats.totalQuizzes, icon: Target, color: 'text-primary-700 dark:text-primary-500' },
                     { label: 'Study Questions', val: stats.totalQuestions, icon: Brain, color: 'text-primary-700 dark:text-primary-500' },
                     { label: 'Monthly Prize Pool', val: `₹${stats.monthlyPrizePool}`, icon: Coins, color: 'text-primary-700 dark:text-primary-500' }
                  ].map((stat, index) => (
                     <div key={index} className="flex flex-col items-center text-center group">
                        <div className={`p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-slate-50 dark:bg-slate-800 mb-3 lg:mb-4 group-hover:scale-110 transition-transform ${stat.color} border-2 border-transparent group-hover:border-current/10`}>
                           <stat.icon className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div className="text-2xl lg:text-5xl font-black font-outfit text-slate-900 dark:text-white mb-1 leading-none">{stat.val}</div>
                        <div className="text-[10px] lg:text-xs font-black tracking-[0.08em] text-slate-600 dark:text-slate-400">{stat.label}</div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         <section id="features" className="py-10 lg:py-32 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-3 lg:px-6 space-y-10 lg:space-y-20">
               <div className="text-center space-y-6 max-w-3xl mx-auto">
                  <h2 className="text-xl lg:text-5xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Study Smart. <br /> Pass Your Exam.</h2>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-400 px-4">Everything you need to prepare for government exams, all in one place.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 lg:min-h-[800px]">
                  <Card className="lg:col-span-8 p-6 lg:p-16 bg-gradient-to-br from-primary-600 to-primary-700 border-none shadow-2xl text-white flex flex-col justify-between group overflow-hidden relative rounded-[2rem] lg:rounded-[4rem]">
                     <div className="space-y-6 relative z-10 max-w-xl">
                        <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-md rounded-3xl lg:rounded-[2.5rem] w-fit shadow-xl border-2 border-white/20">
                           <Trophy className="w-10 h-10 lg:w-12 lg:h-12" />
                        </div>
                        <h3 className="text-xl lg:text-5xl font-black font-outfit uppercase leading-[0.9]">See your progress</h3>
                        <p className="text-base lg:text-lg lg:text-xl font-bold opacity-80 leading-relaxed">Know how well you are doing. Get a clear report after every quiz and move up as you improve.</p>
                        <div className="pt-4 lg:pt-8">
                           <Button variant="ghost" size="lg" className="bg-white text-primary-700 hover:bg-slate-100 rounded-[1.5rem] lg:rounded-[2rem] px-6 lg:px-8 font-black tracking-[0.08em] text-sm py-4 lg:py-6" onClick={() => router.push('/register')}>
                              Check your progress
                           </Button>
                        </div>
                     </div>
                     <Rocket className="absolute -right-16 -bottom-16 w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                     <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />
                  </Card>

                  <Card className="lg:col-span-4 p-5 lg:p-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 flex flex-col justify-between hover:border-primary-500 transition-all group rounded-[2rem] lg:rounded-[4rem] shadow-xl">
                     <div className="space-y-4 lg:space-y-6">
                        <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl lg:rounded-[2rem] w-fit border-2 border-primary-500/10">
                           <Flame className="w-8 h-8 lg:w-10 lg:h-10" />
                        </div>
                        <h3 className="text-xl lg:text-3xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white">Practice every day</h3>
                        <p className="text-base lg:text-lg font-bold text-slate-600 dark:text-slate-400">Practice a little every day. This helps you remember more and climb higher on the student list.</p>
                     </div>
                     <div className="space-y-3 lg:space-y-4 pt-8 lg:pt-10">
                        {[80, 60, 95].map((width, index) => (
                           <div key={index} className="h-2 lg:h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ width: 0 }}
                                 whileInView={{ width: `${width}%` }}
                                 className="h-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-duo-secondary"
                              />
                           </div>
                        ))}
                     </div>
                  </Card>

                  <Card className="lg:col-span-4 p-5 lg:p-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 flex flex-col justify-between group overflow-hidden rounded-[2rem] lg:rounded-[4rem] shadow-xl">
                     <div className="space-y-4 lg:space-y-6">
                        <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl lg:rounded-[2rem] w-fit border-2 border-primary-500/10">
                           <Zap className="w-8 h-8 lg:w-10 lg:h-10" />
                        </div>
                        <h3 className="text-xl lg:text-3xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white">See your test results</h3>
                        <p className="text-base lg:text-lg font-bold text-slate-600 dark:text-slate-400">After every test, see how many you got right and which topics need more practice.</p>
                     </div>
                     <div className="flex gap-3 lg:gap-4 pt-8 lg:pt-10">
                        <div className="flex-1 h-24 lg:h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl lg:rounded-3xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                           <div className="absolute bottom-0 left-0 w-full bg-primary-500/20 h-1/2" />
                        </div>
                        <div className="flex-1 h-24 lg:h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl lg:rounded-3xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                           <div className="absolute bottom-0 left-0 w-full bg-primary-500/40 h-3/4" />
                        </div>
                        <div className="flex-1 h-24 lg:h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl lg:rounded-3xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                           <div className="absolute bottom-0 left-0 w-full bg-primary-500/60 h-[90%]" />
                        </div>
                     </div>
                  </Card>

                  <Card className="lg:col-span-8 p-5 lg:p-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 shadow-2xl flex flex-col lg:flex-row items-center gap-6 lg:gap-10 overflow-hidden group rounded-[2rem] lg:rounded-[4rem]">
                     <div className="flex-1 space-y-4 lg:space-y-6 relative z-10 text-center lg:text-left">
                        <div className="p-3 lg:p-4 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-2xl lg:rounded-[2.5rem] w-fit shadow-duo-primary border-2 border-primary-500/5 mx-auto lg:mx-0">
                           <Medal className="w-10 h-10 lg:w-12 lg:h-12" />
                        </div>
                        <h3 className="text-xl lg:text-xl lg:text-3xl font-black font-outfit uppercase leading-[0.9] text-slate-900 dark:text-white">Student leaderboard</h3>
                        <p className="text-base lg:text-lg font-bold text-slate-600 dark:text-slate-400 max-w-sm px-2 lg:px-0">See where you stand among all students. Students who study the most win prizes every month.</p>
                        <div className="pt-2 lg:pt-4">
                           <Button variant="primary" size="lg" className="shadow-xl rounded-xl lg:rounded-2xl px-8 lg:px-10 font-outfit font-black tracking-[0.08em] text-sm py-4 lg:py-6" onClick={() => router.push('/monthly-winners')}>
                              See top students
                           </Button>
                        </div>
                     </div>
                     <div className="w-full lg:w-1/2 h-48 lg:h-64 lg:h-80 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] lg:rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 relative shadow-inner group-hover:scale-[1.02] transition-transform duration-700" />
                  </Card>
               </div>
            </div>
         </section>

         <section className="py-10 lg:py-32 bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="container mx-auto px-3 lg:px-6 relative z-10">
               <div className="flex flex-col gap-10 lg:gap-20">
                  <div className="space-y-8 lg:space-y-16 text-center max-w-6xl mx-auto w-full">
                     <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl lg:text-9xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.8] mb-8 lg:mb-12"
                     >
                        Study with <br /><span className="text-primary-700 dark:text-primary-500">Confidence.</span>
                     </motion.h2>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {[
                           { title: "Daily Goals", desc: "Set a small goal for each day and complete it. Small steps lead to big results.", icon: Target },
                           { title: "Study with Others", desc: "Study with thousands of students who want to pass the same exams as you.", icon: Users },
                           { title: "Get Rewarded", desc: "Your hard work is rewarded. Top students win real prizes every month.", icon: Trophy }
                        ].map((item, index) => (
                           <div key={index} className="flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-all">
                              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center text-primary-700 dark:text-primary-500 mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:rotate-6 border-2 border-transparent group-hover:border-primary-400/20 shadow-sm">
                                 <item.icon className="w-8 h-8" />
                              </div>
                              <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">{item.title}</h4>
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto text-center px-4">{item.desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="relative w-full mx-auto px-0 lg:px-4 lg:px-0">
                     <div className="absolute -inset-20 bg-primary-500/10 blur-[120px] rounded-full opacity-50" />
                     <MonthlyWinnersDisplay />
                  </div>
               </div>
            </div>
         </section>

         <section className="pb-20 lg:pb-40 px-6">
            <Card className="mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-slate-100 dark:border-white/5 shadow-2xl p-12 lg:p-32 text-center space-y-12 relative overflow-hidden group rounded-[5rem]">
               <div className="relative z-10 space-y-8">
                  <motion.h2
                     whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                     className="text-2xl lg:text-4xl lg:text-9xl font-black font-outfit uppercase tracking-tighter leading-[0.85] text-slate-900 dark:text-white"
                  >
                     Your Dream Job <br /><span className="text-primary-700 dark:text-primary-500">Is Waiting.</span>
                  </motion.h2>
                  <p className="text-md md:text-xl lg:text-2xl font-bold text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed tracking-[0.04em] px-4">Start today. Join AajExam, practice every day, and get the government job you want.</p>
                  <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                     <Button
                        variant="primary"
                        size="xl"
                        icon={ArrowRight}
                        iconPosition="right"
                        className="w-full sm:w-auto shadow-duo-primary rounded-2xl px-16 font-outfit font-black text-sm tracking-[0.08em] py-8 transition-transform active:scale-95"
                        onClick={() => router.push('/register')}
                     >
                        Join now for free
                     </Button>
                  </div>
               </div>
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(88,204,2,0.15)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <Sparkles className="absolute -top-20 -left-20 w-96 h-96 opacity-10 animate-pulse text-primary-500" />
               <Zap className="absolute -bottom-20 -right-20 w-96 h-96 opacity-10 rotate-12 text-primary-500" />
            </Card>
         </section>
      </MobileAppWrapper>
   );
};

export default ModernLandingPage;


