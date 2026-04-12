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
   User,
   TrendingUp,
   Sparkles,
   ChevronRight,
   ShieldCheck,
   Search,
   MessageSquare,
   Activity,
   Radar,
   Library,
   PlayCircle,
   Play,
} from "lucide-react";
import { motion } from "framer-motion";

import API from "../../lib/api";
import { useAuthStatus } from "../../hooks/useClientSide";

import HomePageSkeleton from "../HomePageSkeleton";

import Button from "../ui/Button";
import Card from "../ui/Card";


const HomePage = () => {
   const router = useRouter();
   const { user, isClient: authLoading } = useAuthStatus();
   const [dailyDose, setDailyDose] = useState(null);
   const [performanceReport, setPerformanceReport] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         try {
            const [dailyRes, performanceRes] = await Promise.all([
               API.getDailyDose(),
               API.getAnalyticsReport(),
            ]);

            if (dailyRes?.success) setDailyDose(dailyRes.data);
            if (performanceRes?.success) setPerformanceReport(performanceRes.data);
         } catch (err) {
            console.error("Error loading data:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   if (!authLoading || loading) {
      return <HomePageSkeleton />;
   }

   const metrics = performanceReport?.performanceMetrics || {};
   const examStats = metrics.examStats || {};

   const overallReadiness = examStats.overallReadiness ?? 0;
   const averageMockScore = examStats.averageMockScore ?? 0;
   const mockTestsAttempted = examStats.mockTestsAttempted ?? 0;
   const streakCount = examStats.streakCount ?? 0;

   return (
      <div className="relative selection:bg-primary-500 selection:text-white font-outfit">
         <Head>
            <title>AajExam | Home</title>
         </Head>

         <div className="space-y-3 lg:space-y-10">

            {/* ── Greeting + Stats ── */}
            <section className="px-0 lg:px-4 pt-2 lg:pt-4">
               <div className="flex items-center justify-between mb-3 lg:mb-6">
                  <div>
                     <h1 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Hi, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'Student'}</span>
                     </h1>
                     <p className="text-xs lg:text-sm text-slate-400 font-medium mt-0.5">What would you like to practice?</p>
                  </div>
                  {streakCount > 0 && (
                     <div className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 rounded-xl">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-xs font-black text-orange-600">{streakCount}</span>
                     </div>
                  )}
               </div>

               {/* Quick Stats Row */}
               <div className="grid grid-cols-3 gap-2 lg:gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800">
                     <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500 mb-1.5" />
                     <p className="text-lg lg:text-3xl font-black text-slate-900 dark:text-white">{overallReadiness}%</p>
                     <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Readiness</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800">
                     <Target className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500 mb-1.5" />
                     <p className="text-lg lg:text-3xl font-black text-slate-900 dark:text-white">{averageMockScore}%</p>
                     <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800">
                     <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500 mb-1.5" />
                     <p className="text-lg lg:text-3xl font-black text-slate-900 dark:text-white">{mockTestsAttempted}</p>
                     <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests</p>
                  </div>
               </div>
            </section>

            {/* ── Quick Actions ── */}
            <section className="px-0 lg:px-4">
               <div className="grid grid-cols-2 gap-2 lg:gap-4">
                  <button
                     onClick={() => router.push('/search')}
                     className="bg-primary-500 rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
                  >
                     <Zap className="w-6 h-6 lg:w-10 lg:h-10 text-white/90 mb-2 lg:mb-4" />
                     <p className="text-white text-sm lg:text-xl font-black leading-tight">Start<br/>Test</p>
                     <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  </button>

                  <button
                     onClick={() => router.push('/govt-exams')}
                     className="bg-indigo-500 rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
                  >
                     <ShieldCheck className="w-6 h-6 lg:w-10 lg:h-10 text-white/90 mb-2 lg:mb-4" />
                     <p className="text-white text-sm lg:text-xl font-black leading-tight">Govt.<br/>Exams</p>
                     <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  </button>

                  <button
                     onClick={() => router.push('/reels')}
                     className="bg-rose-500 rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
                  >
                     <PlayCircle className="w-6 h-6 lg:w-10 lg:h-10 text-white/90 mb-2 lg:mb-4" />
                     <p className="text-white text-sm lg:text-xl font-black leading-tight">Watch<br/>Reels</p>
                     <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  </button>

                  <button
                     onClick={() => router.push('/search')}
                     className="bg-emerald-500 rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
                  >
                     <Search className="w-6 h-6 lg:w-10 lg:h-10 text-white/90 mb-2 lg:mb-4" />
                     <p className="text-white text-sm lg:text-xl font-black leading-tight">Find<br/>Tests</p>
                     <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  </button>
               </div>
            </section>

            {/* ── Reels Preview ── */}
            <section className="px-0 lg:px-4">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <PlayCircle className="w-5 h-5 text-rose-500" />
                     <h2 className="text-sm lg:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Reels</h2>
                  </div>
                  <button
                     onClick={() => router.push('/reels')}
                     className="text-[11px] font-bold text-primary-600 dark:text-primary-400"
                  >
                     See all
                  </button>
               </div>

               <div className="grid grid-cols-4 gap-1.5 lg:gap-3">
                  {[
                     { title: 'Math Shortcuts', color: 'from-rose-500 to-pink-600' },
                     { title: 'GK Facts', color: 'from-violet-500 to-purple-600' },
                     { title: 'Reasoning', color: 'from-cyan-500 to-blue-600' },
                     { title: 'English', color: 'from-emerald-500 to-teal-600' },
                  ].map((reel, idx) => (
                     <div
                        key={idx}
                        onClick={() => router.push('/reels')}
                        className={`relative cursor-pointer rounded-xl lg:rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-b ${reel.color}`}
                     >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-8 h-8 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-3 h-3 lg:w-5 lg:h-5 text-white fill-white ml-0.5" />
                           </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                           <p className="text-[8px] lg:text-[10px] font-bold text-white leading-tight">{reel.title}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

         </div>
      </div>
   );
};

export default HomePage;
