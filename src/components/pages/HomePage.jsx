'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
   Flame,
   Trophy,
   Target,
   Zap,
   ArrowRight,
   BookOpen,
   Gamepad2,
   Award,
   Star,
   Clock,
   User,
   TrendingUp,
   Sparkles,
   ChevronRight,
   ShieldCheck,
   Search,
   MessageSquare,
   Activity,
   Radar,
} from "lucide-react";
import { motion } from "framer-motion";

import API from "../../lib/api";
import Image from "next/image";
import { useAuthStatus } from "../../hooks/useClientSide";

// UI Components
import Button from "../ui/Button";
import Card from "../ui/Card";
import Skeleton from "../Skeleton";

const HomePage = () => {
   const router = useRouter();
   const { user, isClient: authLoading } = useAuthStatus();
   const [dailyDose, setDailyDose] = useState(null);
   const [articles, setArticles] = useState([]);
   const [performanceReport, setPerformanceReport] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         try {
            const [dailyRes, performanceRes, articlesRes] = await Promise.all([
               API.getDailyDose(),
               API.getAnalyticsReport(),
               API.getPublishedArticles({ limit: 3 }),
            ]);

            if (dailyRes?.success) setDailyDose(dailyRes.data);
            if (performanceRes?.success) setPerformanceReport(performanceRes.data);
            if (articlesRes?.success) setArticles(articlesRes.data.articles || []);
         } catch (err) {
            console.error("Error loading data:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   if (!authLoading || loading) {
      return (
         <div className="space-y-12 pt-6 font-outfit">
            <div className="bg-white dark:bg-slate-800 p-4 lg:p-8 rounded-[2rem] lg:rounded-[3rem] shadow-xl">
               <Skeleton height="80px" borderRadius="1.5rem" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
               <div className="lg:col-span-8"><Skeleton height="320px" borderRadius="3rem" /></div>
               <div className="lg:col-span-4 space-y-8">
                  <Skeleton height="150px" borderRadius="2.5rem" />
                  <Skeleton height="150px" borderRadius="2.5rem" />
               </div>
            </div>
            <div className="px-4">
               <Skeleton height="120px" borderRadius="3rem" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
               {[1, 2, 3, 4].map(i => <Skeleton key={i} height="180px" borderRadius="2.5rem" />)}
            </div>
         </div>
      );
   }

   const xpProgress = performanceReport?.overallAccuracy ?? 0;
   const streakCount = user?.streak ?? 0;
   const userLevel = Math.floor((performanceReport?.totalAttempts ?? 0) / 10) + 1;
   const quizAttempts = performanceReport?.totalAttempts ?? 0;
   const accuracyScore = performanceReport?.overallAccuracy ?? 0;
   const coinsEarned = user?.coins || 0;

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: { staggerChildren: 0.1, delayChildren: 0.1 }
      }
   };

   const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
   };

   return (
      <motion.div
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         className="pb-20 relative selection:bg-primary-500 selection:text-white font-outfit"
      >
         <Head>
            <title>AajExam | Home</title>
         </Head>

         {/* --- Ambient Background --- */}
         <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-page)] via-transparent to-[var(--bg-page)]" />
         </div>

         {/* Content Wrapper with proper spacing */}
         <div className="space-y-5 lg:space-y-12">

            {/* --- Dashboard Header --- */}
            <motion.section variants={itemVariants} className="relative z-10">
               <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 bg-background-surface p-3 md:p-8 lg:p-12 rounded-[1.5rem] lg:rounded-[4rem] border-b-4 lg:border-b-8 border-border-primary shadow-2xl relative overflow-hidden group mx-2 lg:mx-4">

                  <div className="space-y-3 lg:space-y-6 relative z-10 text-center lg:text-left">
                     <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-4">
                        <div className="px-3 py-1.5 lg:px-5 lg:py-2 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center gap-2 lg:gap-3 border-2 border-emerald-500/10 shadow-inner">
                           <Activity className="w-3 h-3 lg:w-4 lg:h-4 animate-pulse" />
                           <span className="text-[10px] lg:text-xs font-black tracking-[0.12em]">Study session active</span>
                        </div>
                        <div className="hidden lg:flex px-5 py-2 bg-primary-500/10 text-primary-600 rounded-full items-center gap-3 border-2 border-primary-500/10">
                           <Radar className="w-4 h-4 animate-spin-slow" />
                           <span className="text-xs font-black tracking-[0.12em]">Your progress is up to date</span>
                        </div>
                     </div>

                     <div className="space-y-1 lg:space-y-2">
                        <h1 className="text-lg lg:text-5xl font-black text-content-primary font-outfit uppercase tracking-tighter leading-none">
                           Hi, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="text-sm lg:text-lg font-bold text-content-secondary tracking-[0.04em]">What would you like to practice today?</p>
                     </div>

                     <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-4 pt-0 lg:pt-4">
                        <div className="flex items-center gap-1.5 text-[10px] lg:text-xs font-black text-content-secondary tracking-[0.08em] bg-background-page px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-xl border-2 border-border-primary">
                           <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-primary-600" /> Quiz: <span className="text-content-primary">{quizAttempts}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] lg:text-xs font-black text-content-secondary tracking-[0.08em] bg-background-page px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-xl border-2 border-border-primary">
                           <Target className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-500" /> <span className="text-content-primary">{accuracyScore.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] lg:text-xs font-black text-content-secondary tracking-[0.08em] bg-background-page px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-xl border-2 border-border-primary">
                           <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-amber-500" /> <span className="text-content-primary">{coinsEarned}</span>
                        </div>
                     </div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center lg:items-end gap-6">
                     <div className="w-20 lg:w-32 h-20 lg:h-32 lg:w-40 lg:h-40 bg-background-surface rounded-[3rem] shadow-xl flex items-center justify-center border-8 border-background-page group-hover:rotate-6 transition-all duration-500 hover:scale-105">
                        <User className="w-16 h-16 lg:w-20 lg:h-20 text-primary-600" />
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 shadow-xl">
                           <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                     </div>
                  </div>

                  {/* Motion background elements */}
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/5 to-transparent pointer-events-none" />
                  <Sparkles className="absolute -bottom-20 -right-20 w-80 h-80 text-primary-600/5 rotate-12 group-hover:text-primary-600/10 transition-colors" />
               </div>
            </motion.section>

            {/* --- Progress Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 relative z-10 px-2 lg:px-4">

               {/* XP & Level Core */}
               <motion.div variants={itemVariants} className="lg:col-span-8">
                  <Card variant="white" depth={false} className="h-full border-none shadow-2xl p-0 overflow-hidden group relative rounded-[1.5rem] lg:rounded-[4rem]">
                     <div className="p-4 md:p-8 lg:p-12 space-y-4 lg:space-y-12 relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8">
                           <div className="flex items-center justify-between gap-3 lg:gap-4">
                              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-background-page rounded-full border border-border-primary">
                                 <Activity className="w-3.5 h-3.5 text-primary-500" />
                                 <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.4em]">YOUR LEVEL</p>
                              </div>
                              <h2 className="text-xl lg:text-5xl font-black font-outfit uppercase text-content-primary tracking-tighter leading-none">LEVEL {userLevel}</h2>
                           </div>
                           <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-3 lg:gap-4 bg-background-page px-4 lg:px-8 py-3 lg:py-5 rounded-[1.5rem] lg:rounded-[2.5rem] border-2 border-border-primary shadow-2xl w-full lg:w-auto"
                           >
                              <div className="w-9 h-9 lg:w-12 lg:h-12 bg-orange-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-duo-amber">
                                 <Flame className="w-4 h-4 lg:w-6 lg:h-6 text-white fill-white" />
                              </div>
                              <div>
                                 <p className="text-[8px] lg:text-[9px] font-black text-content-muted uppercase tracking-widest leading-none mb-1">DAILY STREAK</p>
                                 <span className="text-xl lg:text-3xl font-black text-content-primary font-outfit">{streakCount} DAYS</span>
                              </div>
                           </motion.div>
                        </div>

                        <div className="space-y-3 lg:space-y-8 pt-2 lg:pt-8">
                           <div className="flex justify-between items-end">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 lg:p-4 bg-primary-500 rounded-xl lg:rounded-2xl shadow-duo-primary border-2 border-primary-500/10">
                                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                 </div>
                                 <div>
                                    <span className="text-md md:text-xl lg:text-2xl font-black text-content-primary font-outfit uppercase block">Next Level</span>
                                    <span className="text-[8px] lg:text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">GOAL: {userLevel + 1}</span>
                                 </div>
                              </div>
                              <span className="text-md md:text-xl lg:text-2xl font-black text-content-muted font-outfit tracking-tighter">{xpProgress.toFixed(0)}%</span>
                           </div>

                           <div className="relative">
                              <div className="h-8 lg:h-14 bg-background-page rounded-2xl lg:rounded-[2rem] p-1 lg:p-2 border-2 border-border-primary overflow-hidden shadow-inner">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-xl lg:rounded-2xl flex items-center justify-end px-4 lg:px-6 shadow-duo-primary relative overflow-hidden"
                                 >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                                    <Star className="w-4 h-4 lg:w-6 lg:h-6 text-white animate-pulse" />
                                 </motion.div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="absolute -bottom-10 -right-10 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700">
                        <Award className="w-64 h-64 lg:w-96 lg:h-96 text-white" />
                     </div>
                     <div className="h-2 lg:h-3 bg-primary-500 relative">
                        <div className="absolute inset-0 bg-white/50 animate-pulse" />
                     </div>
                  </Card>
               </motion.div>

               {/* Stats Cards */}
               <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-8">
                  <Card variant="white" className="border-2 border-border-primary shadow-duo text-content-primary p-3 lg:p-10 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-all rounded-[1.5rem] lg:rounded-[3.5rem] relative overflow-hidden h-36 lg:h-auto" onClick={() => router.push('/search')}>
                     <div className="flex justify-between items-start relative z-10">
                        <div className="p-2 lg:p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl lg:rounded-2xl border-2 border-emerald-100 dark:border-emerald-800 shadow-inner">
                           <Zap className="w-5 h-5 lg:w-10 lg:h-10 text-emerald-500 fill-emerald-500" />
                        </div>
                        <motion.div whileHover={{ x: 5 }} className="hidden sm:block p-2 lg:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                           <ChevronRight className="w-4 h-4 lg:w-6 lg:h-6 text-emerald-600" />
                        </motion.div>
                     </div>
                     <div className="space-y-0.5 relative z-10 pt-2 lg:pt-8">
                        <p className="text-[8px] lg:text-[10px] font-black text-content-muted uppercase tracking-[0.2em] lg:tracking-[0.3em]">PRACTICE</p>
                        <h4 className="text-lg lg:text-4xl font-black font-outfit uppercase leading-none tracking-tighter text-content-primary">START <span className="block text-emerald-500 font-black">QUIZ</span></h4>
                     </div>
                     <div className="absolute -bottom-4 -right-4 w-24 lg:w-32 h-24 lg:h-32 bg-emerald-500/5 rounded-full blur-2xl lg:blur-3xl opacity-50" />
                  </Card>

                  <Card variant="white" className="border-2 border-border-primary shadow-duo text-content-primary p-3 lg:p-10 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-all rounded-[1.5rem] lg:rounded-[3.5rem] relative overflow-hidden h-36 lg:h-auto" onClick={() => router.push('/rewards')}>
                     <div className="flex justify-between items-start relative z-10">
                        <div className="p-2 lg:p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl lg:rounded-2xl border-2 border-amber-100 dark:border-amber-800 shadow-inner">
                           <Trophy className="w-5 h-5 lg:w-10 lg:h-10 text-amber-500 fill-amber-500" />
                        </div>
                        <motion.div whileHover={{ x: 5 }} className="hidden sm:block p-2 lg:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                           <ChevronRight className="w-4 h-4 lg:w-6 lg:h-6 text-amber-600" />
                        </motion.div>
                     </div>
                     <div className="space-y-0.5 relative z-10 pt-2 lg:pt-8">
                        <p className="text-[8px] lg:text-[10px] font-black text-content-muted uppercase tracking-[0.2em] lg:tracking-[0.3em]">WALLET</p>
                        <h4 className="text-lg lg:text-4xl font-black font-outfit uppercase leading-none tracking-tighter text-content-primary">₹{user?.walletBalance || 0} <span className="block text-amber-500 text-[10px] lg:text-2xl font-black uppercase tracking-widest mt-0.5 lg:mt-2">Balance</span></h4>
                     </div>
                     <div className="absolute -bottom-4 -right-4 w-24 lg:w-32 h-24 lg:h-32 bg-amber-500/5 rounded-full blur-2xl lg:blur-3xl opacity-50" />
                  </Card>
               </motion.div>
            </div>

            {/* --- Main Action Button --- */}
            <motion.section variants={itemVariants} className="relative z-10 px-2 lg:px-4">
               <Button
                  fullWidth
                  variant="primary"
                  onClick={() => router.push('/govt-exams')}
                  className="py-3 lg:py-10 text-sm lg:text-3xl font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] shadow-xl rounded-[1.5rem] lg:rounded-[4rem] group overflow-hidden relative border-none ring-4 lg:ring-8 ring-primary-500/5 transition-all active:scale-95"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
                  <div className="flex items-center justify-center gap-3 lg:gap-6 relative z-10 font-outfit">
                     <Zap className="w-5 h-5 lg:w-8 lg:h-8 fill-white animate-pulse" />
                     Practice now
                     <ArrowRight className="w-5 h-5 lg:w-8 lg:h-8 group-hover:translate-x-2 transition-transform" />
                  </div>
               </Button>
            </motion.section>

            {/* --- Quick Actions --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 relative z-10 px-2 lg:px-4">
               {[
                  { label: 'Start Quiz', path: '/search', icon: Gamepad2, cardClass: 'bg-primary-500 border-none shadow-duo-secondary text-white' },
                  { label: 'All Tests', path: '/govt-exams', icon: Target, cardClass: 'bg-primary-500 border-none shadow-duo-primary text-white' },
                  { label: 'Find Quizzes', path: '/search', icon: Search, cardClass: 'bg-indigo-500 border-none text-white shadow-[0_18px_35px_rgba(99,102,241,0.35)]' },
                  { label: 'Support', path: '/contact', icon: MessageSquare, cardClass: 'bg-emerald-500 border-none shadow-duo-emerald text-white' }
               ].map((item, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                     <Card
                        hoverable
                        onClick={() => router.push(item.path)}
                        className={`${item.cardClass} p-3 lg:p-10 flex flex-col items-center gap-2 lg:gap-8 text-center rounded-[1.5rem] lg:rounded-[3.5rem] h-full group hover:translate-y-[-4px] lg:hover:translate-y-[-8px] transition-all relative overflow-hidden`}
                     >
                        <div className="w-10 lg:w-20 h-10 lg:h-20 bg-white/20 backdrop-blur-xl rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center border-2 border-white/20 group-hover:rotate-12 transition-transform relative z-10">
                           <item.icon className="w-5 h-5 lg:w-10 lg:h-10" />
                        </div>
                        <div className="space-y-1 relative z-10">
                           <span className="font-black text-[9px] lg:text-sm tracking-[0.08em] font-outfit block">{item.label}</span>
                           <div className="w-5 h-1 bg-white/40 group-hover:bg-white mx-auto rounded-full group-hover:w-10 transition-all shadow-sm" />
                        </div>
                        <div className="absolute top-0 right-0 w-16 lg:w-32 h-16 lg:h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                     </Card>
                  </motion.div>
               ))}
            </div>

            {/* --- Study Articles --- */}
            <motion.section variants={itemVariants} className="space-y-5 lg:space-y-10 relative z-10 px-2 lg:px-4">
               <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 border-b-4 border-border-primary pb-5 lg:pb-10 px-2 lg:px-4">
                  <div className="space-y-2 text-center lg:text-left">
                     <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-500/10 rounded-full border-2 border-primary-500/10 mb-2">
                        <Activity className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Live Updates</span>
                     </div>
                     <h2 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tighter flex items-center justify-center lg:justify-start gap-4 text-content-primary leading-none">
                        Study <span className="text-primary-600">Articles</span>
                     </h2>
                     <p className="text-sm font-black text-content-secondary tracking-[0.08em] lg:max-w-2xl leading-relaxed">
                        {dailyDose?.factOfDay || "Learn something useful every day."}
                     </p>
                  </div>
                  <Button
                     variant="ghost"
                     onClick={() => router.push('/articles')}
                     icon={ArrowRight}
                     iconPosition="right"
                     className="text-sm font-black tracking-[0.08em] hover:text-primary-600 group transition-colors font-outfit"
                  >
                     See all articles
                  </Button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                  {articles?.slice(0, 3).map((dose, idx) => (
                     <motion.div key={idx} variants={itemVariants}>
                        <Card
                           padded={false}
                           className="overflow-hidden flex flex-col border-2 border-border-primary bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[4rem] hover:shadow-duo-primary transition-all shadow-xl h-full group"
                           onClick={() => router.push(`/articles/${dose.slug || ''}`)}
                        >
                           <div className="h-44 lg:h-64 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
                              <div className="absolute top-6 left-6 z-10 px-5 py-2.5 bg-white/95 dark:bg-slate-800/95 rounded-[1.25rem] text-[9px] font-black text-primary-600 shadow-xl uppercase tracking-[0.3em] border-2 border-slate-50 dark:border-slate-700">
                                 {dose.category?.name || 'ARTICLE'}
                              </div>
                              <Image
                                 src={dose.featuredImage || "/default_banner.png"}
                                 alt={dose.title}
                                 fill
                                 className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                              />
                           </div>
                           <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 flex-grow flex flex-col justify-between">
                              <h3 className="font-black text-base lg:text-2xl text-content-primary line-clamp-2 leading-tight uppercase font-outfit group-hover:text-primary-600 transition-colors">
                                 {dose.title}
                              </h3>
                              <div className="flex items-center justify-between pt-6 border-t-2 border-border-primary">
                                 <div className="flex items-center gap-3 text-[9px] font-black text-content-secondary uppercase tracking-widest">
                                    <Clock className="w-4 h-4 text-primary-600" />
                                    {new Date(dose.publishedAt || dose.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                 </div>
                                 <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                    <ArrowRight className="w-5 h-5" />
                                 </div>
                              </div>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </div>
            </motion.section>

            {/* --- Monthly Showcase --- */}
            <motion.div variants={itemVariants} className="relative z-10 px-0 py-2 lg:py-4">
               <Card variant="primary" className="border-none shadow-2xl text-white rounded-[2rem] lg:rounded-[5rem] p-5 lg:p-20 overflow-hidden relative group">
                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-4 lg:gap-16">
                     <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 lg:w-40 h-16 lg:h-40 bg-white/10 backdrop-blur-2xl rounded-[2rem] lg:rounded-[3.5rem] flex items-center justify-center shadow-2xl border-2 border-white/20 relative group-hover:scale-105 transition-transform"
                     >
                        <Trophy className="w-8 lg:w-20 h-8 lg:h-20 text-amber-300 fill-amber-300 drop-shadow-[0_0_20px_rgba(252,211,77,0.8)]" />
                     </motion.div>
                     <div className="text-center lg:text-left space-y-3 lg:space-y-6 flex-grow">
                        <div className="inline-flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-1.5 bg-white/10 rounded-full border-2 border-white/20">
                           <Star className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-300 fill-amber-300" />
                           <span className="text-[10px] lg:text-xs font-black text-white tracking-[0.12em]">Rewards active</span>
                        </div>
                        <h4 className="text-xl lg:text-5xl font-black font-outfit uppercase tracking-tighter leading-none">Monthly <span className="text-amber-300">Winners</span></h4>
                        <p className="text-white/90 font-bold text-sm lg:text-xl max-w-2xl opacity-80 tracking-[0.04em] leading-relaxed">Top students win prizes every month.</p>
                     </div>
                     <div className="shrink-0 relative z-10">
                        <Button variant="white" onClick={() => router.push('/monthly-winners')} className="px-6 py-3 lg:px-14 lg:py-8 rounded-[1.5rem] lg:rounded-[2.5rem] font-black tracking-[0.08em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm font-outfit">
                           View winners
                        </Button>
                     </div>
                  </div>

                  {/* Background elements */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500 opacity-20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500 opacity-20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
               </Card>
            </motion.div>

            <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
         </div>
      </motion.div>
   );
};

export default HomePage;


